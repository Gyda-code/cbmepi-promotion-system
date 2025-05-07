
import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useParams } from 'react-router-dom';
import { generateQAM, getNextPromotionDate, isNearPromotionDate } from '@/services/promotionService';
import { getDivisionByCode } from '@/services/militaryService';
import { Division, PromotionAccessList } from '@/types/military';
import AccessListTable from '@/components/military/AccessListTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import PromotionDistributionCalculator from '@/components/military/PromotionDistributionCalculator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarIcon, InfoIcon } from 'lucide-react';

const QAMPage = () => {
  const { divisionCode } = useParams<{ divisionCode: string }>();
  const [accessList, setAccessList] = useState<PromotionAccessList[]>([]);
  const [division, setDivision] = useState<Division | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPromotionDate, setNextPromotionDate] = useState<Date | null>(null);
  const [isNearPromotion, setIsNearPromotion] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!divisionCode) return;
      
      try {
        setIsLoading(true);
        // Get division details
        const divisionData = await getDivisionByCode(divisionCode);
        if (!divisionData) throw new Error(`Division with code ${divisionCode} not found`);
        
        setDivision(divisionData);
        
        // Generate QAM
        const qamData = await generateQAM(divisionData.id);
        setAccessList(qamData);
        
        // Check if we're near a promotion date
        setIsNearPromotion(isNearPromotionDate(30));
        setNextPromotionDate(getNextPromotionDate());
      } catch (error) {
        console.error('Failed to fetch QAM data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [divisionCode]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quadro de Acesso por Merecimento (QAM)</h1>
          {division && (
            <p className="text-muted-foreground">{division.name} - {division.code}</p>
          )}
        </div>

        {isNearPromotion && nextPromotionDate && (
          <Alert>
            <CalendarIcon className="h-4 w-4" />
            <AlertTitle>Próxima data de promoção se aproximando!</AlertTitle>
            <AlertDescription>
              A próxima data de promoção será em {format(nextPromotionDate, 'dd/MM/yyyy')}. 
              Certifique-se de que todos os dados estejam atualizados.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Acesso por Merecimento</CardTitle>
                <CardDescription>
                  Militares que cumprem os requisitos para promoção, ordenados por pontuação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessListTable accessList={accessList} type="QAM" />
              </CardContent>
            </Card>

            <PromotionDistributionCalculator />
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <InfoIcon className="h-5 w-5 mr-2" /> Informações sobre o QAM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              O Quadro de Acesso por Merecimento (QAM) lista os militares que cumprem todos os requisitos para promoção,
              ordenados pelo critério de merecimento (pontuação na ficha de conceito).
            </p>
            <p>
              Para constar no QAM, o militar deve:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Ter cumprido o interstício mínimo no posto/graduação atual</li>
              <li>Possuir os cursos obrigatórios para o posto/graduação</li>
              <li>Estar apto em inspeção de saúde</li>
              <li>Não possuir impedimentos legais (conforme Art. 21 e 22 da Lei 5.461)</li>
            </ul>
            <p className="mt-2">
              A ordenação é feita pela pontuação total na ficha de conceito. Em caso de empate, usa-se o critério de antiguidade.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default QAMPage;
