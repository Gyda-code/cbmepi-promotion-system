
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parse } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, Plus, Award } from 'lucide-react';

import { 
  getPromotionHistoryByMilitaryId, 
  getMilitaryPersonnelById,
  addPromotion,
  rankOrder
} from '@/services/militaryService';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { MilitaryPersonnel, PromotionHistory, RankType } from '@/types/military';
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
  promotion_date: z.string().min(1, 'Data da promoção é obrigatória'),
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

const PromotionsHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      promotion_date: format(new Date(), 'yyyy-MM-dd'),
      new_rank: 'SOLDADO'
    }
  });

  const { data: military, isLoading: isMilitaryLoading } = useQuery({
    queryKey: ['military', id],
    queryFn: () => getMilitaryPersonnelById(id!),
    enabled: !!id
  });

  const { data: promotions, isLoading: isPromotionsLoading, refetch } = useQuery({
    queryKey: ['promotions', id],
    queryFn: () => getPromotionHistoryByMilitaryId(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (military) {
      form.setValue('new_rank', getNextRank(military.rank));
    }
  }, [military, form]);

  const getNextRank = (currentRank: RankType): RankType => {
    const currentRankOrder = rankOrder[currentRank];
    
    for (const rank of rankOptions) {
      if (rankOrder[rank] > currentRankOrder) {
        return rank;
      }
    }
    
    return currentRank;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      if (!id || !military) {
        toast.error('Dados do militar não encontrados');
        return;
      }

      await addPromotion({
        military_id: id,
        promotion_date: data.promotion_date,
        previous_rank: military.rank,
        new_rank: data.new_rank
      });

      toast.success('Promoção registrada com sucesso!');
      setIsDialogOpen(false);
      refetch();

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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Histórico de Promoções</CardTitle>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Promoção</DialogTitle>
              <DialogDescription>
                Preencha os dados para registrar uma nova promoção para {military.full_name}.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex items-center space-x-4 py-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={military.photo_url || ''} />
                    <AvatarFallback>{getInitials(military.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{military.full_name}</h3>
                    <p className="text-sm text-muted-foreground">Posto atual: {military.rank}</p>
                  </div>
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
                            <SelectValue placeholder="Selecione o novo posto/graduação" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rankOptions
                            .filter(rank => rankOrder[rank] > rankOrder[military.rank])
                            .map((rank) => (
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

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-lg mb-2">Dados do Militar</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{military.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Posto/Graduação Atual</p>
              <p className="font-medium">{military.rank}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Matrícula</p>
              <p className="font-medium">{military.registration_number}</p>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data da Promoção</TableHead>
              <TableHead>Posto/Graduação Anterior</TableHead>
              <TableHead>Posto/Graduação Novo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions && promotions.length > 0 ? (
              promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>{format(new Date(promotion.promotion_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{promotion.previous_rank}</TableCell>
                  <TableCell className="font-medium">{promotion.new_rank}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Nenhuma promoção registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromotionsHistory;
