
// This file is maintained by the system and should not be edited directly.
// However, we need to update it to include additional fields for promotion requirements.

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { 
  createMilitaryPersonnel, 
  getDivisions, 
  getMilitaryPersonnelById, 
  updateMilitaryPersonnel 
} from '@/services/militaryService';
import { RankType, Division, MilitaryPersonnel } from '@/types/military';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const ranks: RankType[] = [
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

const MilitaryForm = () => {
  const { id, divisionId } = useParams<{ id: string; divisionId: string }>();
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MilitaryPersonnel & { entry_date_display: string; last_promotion_date_display?: string }>({
    defaultValues: {
      full_name: '',
      rank: 'SOLDADO',
      division_id: Number(divisionId) || 0,
      registration_number: '',
      entry_date: new Date().toISOString(),
      entry_date_display: format(new Date(), 'yyyy-MM-dd'),
      last_promotion_date: null,
      last_promotion_date_display: undefined,
      photo_url: null,
      
      // New fields for promotion requirements
      has_cfo: false,
      has_cao: false,
      has_chobm: false,
      has_superior_degree: false,
      is_health_approved: true,
      has_reduced_interstice: false,
      
      // Impediments
      is_sub_judice: false,
      is_in_disciplinary_process: false,
      is_on_desertion: false,
      is_on_leave: false,
      is_on_limited_service: false,
    },
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load divisions
        const divisionsData = await getDivisions();
        setDivisions(divisionsData);
        
        // If editing, load military personnel
        if (id) {
          const military = await getMilitaryPersonnelById(id);
          if (military) {
            form.reset({
              ...military,
              entry_date_display: format(new Date(military.entry_date), 'yyyy-MM-dd'),
              last_promotion_date_display: military.last_promotion_date 
                ? format(new Date(military.last_promotion_date), 'yyyy-MM-dd')
                : undefined,
              
              // Set default values for new fields if they don't exist in the DB yet
              has_cfo: military.has_cfo ?? false,
              has_cao: military.has_cao ?? false, 
              has_chobm: military.has_chobm ?? false,
              has_superior_degree: military.has_superior_degree ?? false,
              is_health_approved: military.is_health_approved ?? true,
              has_reduced_interstice: military.has_reduced_interstice ?? false,
              is_sub_judice: military.is_sub_judice ?? false,
              is_in_disciplinary_process: military.is_in_disciplinary_process ?? false,
              is_on_desertion: military.is_on_desertion ?? false,
              is_on_leave: military.is_on_leave ?? false,
              is_on_limited_service: military.is_on_limited_service ?? false,
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar dados. Por favor, tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, form]);
  
  const onSubmit = async (data: MilitaryPersonnel & { entry_date_display: string; last_promotion_date_display?: string }) => {
    try {
      setIsSubmitting(true);
      
      // Prepare data for submission
      const submitData: Partial<MilitaryPersonnel> = {
        full_name: data.full_name,
        rank: data.rank,
        division_id: data.division_id,
        registration_number: data.registration_number,
        entry_date: data.entry_date_display,
        last_promotion_date: data.last_promotion_date_display || null,
        photo_url: data.photo_url,
        
        // Include promotion requirement fields
        has_cfo: data.has_cfo,
        has_cao: data.has_cao,
        has_chobm: data.has_chobm,
        has_superior_degree: data.has_superior_degree,
        is_health_approved: data.is_health_approved,
        has_reduced_interstice: data.has_reduced_interstice,
        
        // Impediments
        is_sub_judice: data.is_sub_judice,
        is_in_disciplinary_process: data.is_in_disciplinary_process,
        is_on_desertion: data.is_on_desertion,
        is_on_leave: data.is_on_leave,
        is_on_limited_service: data.is_on_limited_service,
      };
      
      if (id) {
        // Update existing
        await updateMilitaryPersonnel(id, submitData);
        toast({
          title: 'Sucesso',
          description: 'Dados do militar atualizados com sucesso.',
        });
      } else {
        // Create new
        await createMilitaryPersonnel(submitData as any);
        toast({
          title: 'Sucesso',
          description: 'Novo militar cadastrado com sucesso.',
        });
      }
      
      // Navigate back to list
      const division = divisions.find(d => d.id === data.division_id);
      const route = division?.type === 'QPBM' || division?.type === 'QPRR'
        ? `/pracas/${division.code}`
        : `/oficiais/${division?.code}`;
      
      navigate(route);
    } catch (error) {
      console.error('Error saving military personnel:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar os dados. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEntryDateChange = (date: string) => {
    form.setValue('entry_date_display', date);
  };
  
  const handleLastPromotionDateChange = (date: string) => {
    form.setValue('last_promotion_date_display', date);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {id ? 'Editar Militar' : 'Novo Militar'}
        </h1>
        <p className="text-muted-foreground">
          {id ? 'Atualize os dados do militar' : 'Cadastre um novo militar no sistema'}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados de identificação e patente do militar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo do militar" {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matrícula</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de matrícula" {...field} required />
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
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o posto/graduação" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ranks.map((rank) => (
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
                </div>
                
                <FormField
                  control={form.control}
                  name="division_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quadro</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o quadro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {divisions.map((division) => (
                            <SelectItem key={division.id} value={division.id.toString()}>
                              {division.name} ({division.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="entry_date_display"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Ingresso</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value} 
                            onChange={(e) => handleEntryDateChange(e.target.value)}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="last_promotion_date_display"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Última Promoção</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            value={field.value || ''} 
                            onChange={(e) => handleLastPromotionDateChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Requisitos para Promoção</CardTitle>
                <CardDescription>
                  Cursos concluídos e condição para promoção
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="has_cfo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>CFO (Curso de Formação de Oficiais)</FormLabel>
                          <FormDescription>
                            Concluiu o Curso de Formação de Oficiais
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="has_cao"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>CAO (Curso de Aperfeiçoamento de Oficiais)</FormLabel>
                          <FormDescription>
                            Concluiu o Curso de Aperfeiçoamento de Oficiais
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="has_chobm"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>CHOBM (Curso de Habilitação de Oficiais)</FormLabel>
                          <FormDescription>
                            Concluiu o Curso de Habilitação de Oficiais
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="has_superior_degree"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Curso Superior</FormLabel>
                          <FormDescription>
                            Possui curso superior (necessário para Major QOCBM)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_health_approved"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Apto em Inspeção de Saúde</FormLabel>
                          <FormDescription>
                            Está apto em inspeção de saúde para promoção
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="has_reduced_interstice"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Redução de Interstício</FormLabel>
                        <FormDescription>
                          Possui redução de interstício conforme Art. 15 da Lei 7.772
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Impedimentos para Promoção</CardTitle>
                <CardDescription>
                  Fatores que podem impedir a promoção (Art. 21 e 22 da Lei 5.461)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="is_sub_judice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Sub Judice</FormLabel>
                          <FormDescription>
                            Está sub judice
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_in_disciplinary_process"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Em Processo Disciplinar</FormLabel>
                          <FormDescription>
                            Está em processo disciplinar
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="is_on_desertion"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Em Deserção</FormLabel>
                          <FormDescription>
                            Está em situação de deserção
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_on_leave"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Em Licença</FormLabel>
                          <FormDescription>
                            Está em licença prolongada
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_on_limited_service"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Em Serviço Limitado</FormLabel>
                          <FormDescription>
                            Está em serviço limitado
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : id ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default MilitaryForm;
