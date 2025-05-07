
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parse } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

import { 
  createMilitaryPersonnel,
  getDivisions, 
  getMilitaryPersonnelById, 
  updateMilitaryPersonnel,
  uploadProfilePhoto 
} from '@/services/militaryService';
import { MilitaryPersonnel, RankType } from '@/types/military';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

const rankOptions: RankType[] = [
  'SOLDADO',
  'CABO',
  'SARGENTO',
  '3º SARGENTO',
  '2º SARGENTO',
  '1º SARGENTO',
  'SUBTENENTE',
  'ASPIRANTE',
  '2º TENENTE',
  '1º TENENTE',
  'CAPITÃO',
  'MAJOR',
  'TENENTE-CORONEL',
  'CORONEL'
];

const formSchema = z.object({
  full_name: z.string().min(3, 'Nome completo é obrigatório'),
  rank: z.enum([
    'SOLDADO',
    'CABO',
    'SARGENTO',
    '3º SARGENTO',
    '2º SARGENTO',
    '1º SARGENTO',
    'SUBTENENTE',
    'ASPIRANTE',
    '2º TENENTE',
    '1º TENENTE',
    'CAPITÃO',
    'MAJOR',
    'TENENTE-CORONEL',
    'CORONEL'
  ] as const),
  division_id: z.coerce.number().positive('Quadro é obrigatório'),
  registration_number: z.string().min(1, 'Matrícula é obrigatória'),
  entry_date: z.string().min(1, 'Data de ingresso é obrigatória'),
  last_promotion_date: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const MilitaryForm = () => {
  const { id, divisionId } = useParams<{ id: string, divisionId: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      rank: 'SOLDADO',
      division_id: divisionId ? parseInt(divisionId) : 0,
      registration_number: '',
      entry_date: '',
      last_promotion_date: null,
      photo_url: null,
    }
  });

  const { data: divisions, isLoading: isDivisionsLoading } = useQuery({
    queryKey: ['divisions'],
    queryFn: getDivisions
  });

  const { data: militaryData, isLoading: isMilitaryLoading } = useQuery({
    queryKey: ['military', id],
    queryFn: () => getMilitaryPersonnelById(id!),
    enabled: isEditing
  });

  useEffect(() => {
    if (militaryData) {
      form.reset({
        full_name: militaryData.full_name,
        rank: militaryData.rank,
        division_id: militaryData.division_id,
        registration_number: militaryData.registration_number,
        entry_date: militaryData.entry_date ? format(new Date(militaryData.entry_date), 'yyyy-MM-dd') : '',
        last_promotion_date: militaryData.last_promotion_date 
          ? format(new Date(militaryData.last_promotion_date), 'yyyy-MM-dd') 
          : null,
        photo_url: militaryData.photo_url,
      });

      if (militaryData.photo_url) {
        setPhotoPreview(militaryData.photo_url);
      }
    }
  }, [militaryData, form]);

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Handle photo upload if there's a new photo
      let photoUrl = data.photo_url;
      if (photoFile) {
        const extension = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${data.registration_number}.${extension}`;
        photoUrl = await uploadProfilePhoto(photoFile, fileName);
      }

      // Parse dates
      const formattedData: Partial<MilitaryPersonnel> = {
        ...data,
        photo_url: photoUrl,
        entry_date: data.entry_date,
        last_promotion_date: data.last_promotion_date || null,
      };

      if (isEditing) {
        await updateMilitaryPersonnel(id!, formattedData);
        toast.success('Militar atualizado com sucesso!');
      } else {
        await createMilitaryPersonnel(formattedData as Omit<MilitaryPersonnel, 'id' | 'created_at' | 'updated_at'>);
        toast.success('Militar cadastrado com sucesso!');
      }

      // Navigate back to the list
      navigate(`/oficiais/${divisions?.find(div => div.id === data.division_id)?.code.toLowerCase()}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao salvar os dados. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDivisionsLoading || (isEditing && isMilitaryLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Militar' : 'Novo Militar'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={photoPreview || ''} />
                <AvatarFallback className="text-2xl">
                  {form.watch('full_name') ? getInitials(form.watch('full_name')) : 'CB'}
                </AvatarFallback>
              </Avatar>
              <label htmlFor="photo" className="cursor-pointer">
                <div className="flex items-center gap-2 text-primary">
                  <Upload size={16} />
                  <span>Carregar foto</span>
                </div>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onPhotoChange}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula</FormLabel>
                    <FormControl>
                      <Input placeholder="Matrícula" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posto/Graduação</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o posto/graduação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rankOptions.map((rank) => (
                          <SelectItem key={rank} value={rank}>
                            {rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="division_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quadro</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o quadro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {divisions?.map((division) => (
                          <SelectItem key={division.id} value={division.id.toString()}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Ingresso</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_promotion_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Última Promoção</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''} 
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default MilitaryForm;
