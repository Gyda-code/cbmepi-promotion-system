
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Award, Loader2, Plus } from 'lucide-react';

import { 
  addPromotion,
  getMilitaryPersonnelById, 
  getPromotionHistoryByMilitaryId,
  rankOrder
} from '@/services/militaryService';
import { RankType } from '@/types/military';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  promotion_date: z.string().min(1, 'Data da promoção é obrigatória'),
  previous_rank: z.enum([
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
  new_rank: z.enum([
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
});

type FormValues = z.infer<typeof formSchema>;

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

const PromotionsHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      promotion_date: format(new Date(), 'yyyy-MM-dd'),
      previous_rank: 'SOLDADO',
      new_rank: 'CABO',
    }
  });

  const { data: military, isLoading: isMilitaryLoading } = useQuery({
    queryKey: ['military', id],
    queryFn: () => getMilitaryPersonnelById(id!),
    enabled: !!id
  });

  const { 
    data: promotions, 
    isLoading: isPromotionsLoading,
    refetch: refetchPromotions
  } = useQuery({
    queryKey: ['promotions', id],
    queryFn: () => getPromotionHistoryByMilitaryId(id!),
    enabled: !!id
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      if (!id) {
        toast.error('ID do militar não encontrado');
        return;
      }

      // Validate ranks (new rank should be higher than previous rank)
      if (rankOrder[data.new_rank] <= rankOrder[data.previous_rank]) {
        toast.error('O novo posto deve ser superior ao posto anterior');
        return;
      }

      await addPromotion({
        military_id: id,
        promotion_date: data.promotion_date,
        previous_rank: data.previous_rank,
        new_rank: data.new_rank
      });

      toast.success('Promoção registrada com sucesso!');
      setIsDialogOpen(false);
      
      // Reset form
      form.reset({
        promotion_date: format(new Date(), 'yyyy-MM-dd'),
        previous_rank: military?.rank || 'SOLDADO',
        new_rank: rankOptions[rankOptions.indexOf(military?.rank || 'SOLDADO') + 1] || 'CABO',
      });
      
      // Refetch data
      refetchPromotions();
      queryClient.invalidateQueries({ queryKey: ['military', id] });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao registrar promoção. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMilitaryLoading || isPromotionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!military) {
    return (
      <div className="text-center text-red-500">
        Militar não encontrado.
      </div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Histórico de Promoções</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Promoção</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4">
                  <div className="bg-muted p-3 rounded-lg mb-4">
                    <h3 className="font-semibold mb-1">{military.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Posto atual: <span className="font-medium">{military.rank}</span>
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="promotion_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Promoção</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previous_rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posto/Graduação Anterior</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o posto anterior" />
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
                    name="new_rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Novo Posto/Graduação</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o novo posto" />
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
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar Promoção
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-3 rounded-lg mb-4">
          <h3 className="font-semibold mb-1">{military.full_name}</h3>
          <p className="text-sm">
            <span className="text-muted-foreground">Posto atual:</span>{' '}
            <span className="font-medium">{military.rank}</span>
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data da Promoção</TableHead>
              <TableHead>Posto/Graduação Anterior</TableHead>
              <TableHead>Posto/Graduação Promovido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions && promotions.length > 0 ? (
              promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>
                    {format(parseISO(promotion.promotion_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{promotion.previous_rank}</TableCell>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    {promotion.new_rank}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  Nenhuma promoção registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionsHistory;
