
import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { getVacancyQuotas } from '@/services/promotionService';
import VacancyQuotaTable from '@/components/military/VacancyQuotaTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VacancyQuota } from '@/types/military';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VacancyQuotaPage = () => {
  const [quotas, setQuotas] = useState<VacancyQuota[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuotas = async () => {
      try {
        const data = await getVacancyQuotas();
        setQuotas(data);
      } catch (error) {
        console.error('Failed to fetch vacancy quotas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotas();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Quadro de Fixação de Vagas (QFV)</h1>
        <p className="text-muted-foreground">
          Efetivo previsto para cada posto/graduação conforme Anexo Único da Lei 7.772/2022
        </p>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Efetivo por Quadros</CardTitle>
              <CardDescription>
                Visualize o efetivo previsto para cada quadro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="QOEM">QOEM</TabsTrigger>
                  <TabsTrigger value="QOE">QOE</TabsTrigger>
                  <TabsTrigger value="QPBM">QPBM</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <VacancyQuotaTable quotas={quotas} />
                </TabsContent>
                <TabsContent value="QOEM">
                  <VacancyQuotaTable quotas={quotas} divisionType="QOEM" />
                </TabsContent>
                <TabsContent value="QOE">
                  <VacancyQuotaTable quotas={quotas} divisionType="QOE" />
                </TabsContent>
                <TabsContent value="QPBM">
                  <VacancyQuotaTable quotas={quotas} divisionType="QPBM" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default VacancyQuotaPage;
