
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

import { 
  getConceptSheetByMilitaryId, 
  getMilitaryPersonnelById,
  updateConceptSheet,
  createConceptSheet
} from '@/services/militaryService';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  service_time_years: z.coerce.number().min(0).default(0),
  military_courses_count: z.coerce.number().min(0).default(0),
  civil_courses_count: z.coerce.number().min(0).default(0),
  medals_count: z.coerce.number().min(0).default(0),
  compliments_count: z.coerce.number().min(0).default(0),
  punishments_count: z.coerce.number().min(0).default(0),
  lack_of_performance_count: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

const ConceptSheet = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_time_years: 0,
      military_courses_count: 0,
      civil_courses_count: 0,
      medals_count: 0,
      compliments_count: 0,
      punishments_count: 0,
      lack_of_performance_count: 0
    }
  });

  const { data: military, isLoading: isMilitaryLoading } = useQuery({
    queryKey: ['military', id],
    queryFn: () => getMilitaryPersonnelById(id!),
    enabled: !!id
  });

  const { 
    data: conceptSheet, 
    isLoading: isConceptSheetLoading,
    refetch: refetchConceptSheet
  } = useQuery({
    queryKey: ['conceptSheet', id],
    queryFn: () => getConceptSheetByMilitaryId(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (conceptSheet) {
      form.reset({
        service_time_years: conceptSheet.service_time_years || 0,
        military_courses_count: conceptSheet.military_courses_count || 0,
        civil_courses_count: conceptSheet.civil_courses_count || 0,
        medals_count: conceptSheet.medals_count || 0,
        compliments_count: conceptSheet.compliments_count || 0,
        punishments_count: conceptSheet.punishments_count || 0,
        lack_of_performance_count: conceptSheet.lack_of_performance_count || 0
      });
    }
  }, [conceptSheet, form]);

  // Calculate points based on current form values
  const calculatePoints = () => {
    const values = form.getValues();
    
    // Calculate positive points with limits
    const serviceTimePoints = Math.min(values.service_time_years * 0.5, 10);
    const militaryCoursesPoints = Math.min(values.military_courses_count * 1, 15);
    const civilCoursesPoints = Math.min(values.civil_courses_count * 0.5, 5);
    const medalsPoints = Math.min(values.medals_count * 1, 10);
    const complimentsPoints = Math.min(values.compliments_count * 0.2, 10);
    
    const positivePoints = 
      serviceTimePoints + 
      militaryCoursesPoints + 
      civilCoursesPoints + 
      medalsPoints + 
      complimentsPoints;
    
    // Calculate negative points
    const punishmentsPoints = values.punishments_count * 2;
    const lackOfPerformancePoints = values.lack_of_performance_count * 1;
    
    const negativePoints = punishmentsPoints + lackOfPerformancePoints;
    
    // Total points
    const totalPoints = positivePoints - negativePoints;
    
    return {
      serviceTimePoints,
      militaryCoursesPoints,
      civilCoursesPoints,
      medalsPoints,
      complimentsPoints,
      positivePoints,
      punishmentsPoints,
      lackOfPerformancePoints,
      negativePoints,
      totalPoints
    };
  };

  const points = calculatePoints();

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      if (!id) {
        toast.error('ID do militar não encontrado');
        return;
      }

      if (conceptSheet) {
        await updateConceptSheet(conceptSheet.id, {
          ...data,
          military_id: id
        });
        toast.success('Ficha de conceito atualizada com sucesso!');
      } else {
        await createConceptSheet({
          ...data,
          military_id: id
        });
        toast.success('Ficha de conceito criada com sucesso!');
      }

      refetchConceptSheet();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao salvar os dados. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMilitaryLoading || isConceptSheetLoading) {
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
      <CardHeader>
        <CardTitle>Ficha de Conceito do Oficial</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Dados do Militar</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{military.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Posto/Graduação</p>
                  <p className="font-medium">{military.rank}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matrícula</p>
                  <p className="font-medium">{military.registration_number}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg">
              <div className="bg-primary text-primary-foreground p-3 rounded-t-lg">
                <h3 className="font-semibold text-center">PONTOS POSITIVOS</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="service_time_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo de Serviço (anos)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pontos por ano</p>
                    <p className="font-medium">0.5</p>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Total de pontos</p>
                    <p className="font-semibold">{points.serviceTimePoints.toFixed(2)} / 10</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="military_courses_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cursos Militares</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pontos por curso</p>
                    <p className="font-medium">1.0</p>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Total de pontos</p>
                    <p className="font-semibold">{points.militaryCoursesPoints.toFixed(2)} / 15</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="civil_courses_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cursos Civis</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pontos por curso</p>
                    <p className="font-medium">0.5</p>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Total de pontos</p>
                    <p className="font-semibold">{points.civilCoursesPoints.toFixed(2)} / 5</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="medals_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medalhas</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pontos por medalha</p>
                    <p className="font-medium">1.0</p>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Total de pontos</p>
                    <p className="font-semibold">{points.medalsPoints.toFixed(2)} / 10</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="compliments_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elogios</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pontos por elogio</p>
                    <p className="font-medium">0.2</p>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Total de pontos</p>
                    <p className="font-semibold">{points.complimentsPoints.toFixed(2)} / 10</p>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">TOTAL DE PONTOS POSITIVOS</p>
                    <p className="font-bold text-lg">{points.positivePoints.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg">
              <div className="bg-destructive text-destructive-foreground p-3 rounded-t-lg">
                <h3 className="font-semibold text-center">PONTOS NEGATIVOS</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="punishments_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Punições</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pontos por punição</p>
                    <p className="font-medium">2.0</p>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Total de pontos</p>
                    <p className="font-semibold">{points.punishmentsPoints.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <FormField
                    control={form.control}
                    name="lack_of_performance_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Falta de Aproveitamento</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pontos por ocorrência</p>
                    <p className="font-medium">1.0</p>
                  </div>
                  <div className="bg-muted p-2 rounded-md">
                    <p className="text-sm text-muted-foreground">Total de pontos</p>
                    <p className="font-semibold">{points.lackOfPerformancePoints.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">TOTAL DE PONTOS NEGATIVOS</p>
                    <p className="font-bold text-lg">{points.negativePoints.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg">SOMA TOTAL DE PONTOS</p>
                <p className="font-bold text-xl">{points.totalPoints.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Voltar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Salvar Ficha
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ConceptSheet;
