
import React, { useState } from 'react';
import { calculatePromotionDistribution } from '@/services/promotionService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PromotionDistributionCalculator = () => {
  const [vacancies, setVacancies] = useState<number>(0);
  const [distribution, setDistribution] = useState<{ byMerit: number; bySeniority: number } | null>(null);

  const handleCalculate = () => {
    const result = calculatePromotionDistribution(vacancies);
    setDistribution(result);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Distribuição de Promoções</CardTitle>
        <CardDescription>
          Calcule quantos militares serão promovidos por antiguidade e por merecimento conforme Art. 9º da Lei 5.461/2005
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label htmlFor="vacancies" className="text-sm font-medium">
              Número de Vagas Disponíveis:
            </label>
            <div className="flex space-x-2">
              <Input
                id="vacancies"
                type="number"
                min="0"
                value={vacancies}
                onChange={(e) => setVacancies(Number(e.target.value))}
              />
              <Button onClick={handleCalculate}>Calcular</Button>
            </div>
          </div>

          {distribution && (
            <div className="mt-4 p-4 border rounded-md bg-muted">
              <h3 className="font-medium mb-2">Distribuição de Promoções:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-100 rounded-md">
                  <p className="text-sm text-muted-foreground">Por Antiguidade (QAA):</p>
                  <p className="text-2xl font-bold">{distribution.bySeniority}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-md">
                  <p className="text-sm text-muted-foreground">Por Merecimento (QAM):</p>
                  <p className="text-2xl font-bold">{distribution.byMerit}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Conforme Art. 9º da Lei 5.461/2005: Quando o número de vagas é 1, a promoção é por antiguidade; 
                quando são 2 vagas, uma é por antiguidade e outra por merecimento; 
                quando são mais de 2, dois terços são por antiguidade e um terço por merecimento.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionDistributionCalculator;
