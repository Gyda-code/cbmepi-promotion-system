
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Edit, FileText, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { getDivisionByCode, getMilitaryPersonnelByDivision } from '@/services/militaryService';
import { Division, MilitaryPersonnel } from '@/types/military';
import { getInitials } from '@/lib/utils';

const MilitaryList = () => {
  const { divisionCode } = useParams<{ divisionCode: string }>();
  const [division, setDivision] = useState<Division | null>(null);
  const navigate = useNavigate();

  const { 
    data: militaryPersonnel, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['military', divisionCode],
    queryFn: async () => {
      if (!division) return [];
      return await getMilitaryPersonnelByDivision(division.id);
    },
    enabled: !!division
  });

  useEffect(() => {
    const fetchDivision = async () => {
      try {
        if (divisionCode) {
          const divisionData = await getDivisionByCode(divisionCode);
          setDivision(divisionData);
        }
      } catch (error) {
        toast.error('Erro ao carregar dados da divisão');
        console.error(error);
      }
    };

    fetchDivision();
  }, [divisionCode]);

  const handleNewMilitary = () => {
    if (division) {
      navigate(`/military/new/${division.id}`);
    }
  };

  const handleEditMilitary = (id: string) => {
    navigate(`/military/edit/${id}`);
  };

  const handleViewConceptSheet = (id: string) => {
    navigate(`/military/concept-sheet/${id}`);
  };

  const handleViewPromotions = (id: string) => {
    navigate(`/military/promotions/${id}`);
  };

  if (isLoading || !division) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Erro ao carregar militares. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{division.name}</CardTitle>
        <Button onClick={handleNewMilitary} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Novo
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Posto/Graduação</TableHead>
              <TableHead>Data da Última Promoção</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {militaryPersonnel && militaryPersonnel.length > 0 ? (
              militaryPersonnel.map((military) => (
                <TableRow key={military.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={military.photo_url || ''} alt={military.full_name} />
                      <AvatarFallback>{getInitials(military.full_name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{military.full_name}</TableCell>
                  <TableCell>{military.rank}</TableCell>
                  <TableCell>
                    {military.last_promotion_date 
                      ? format(new Date(military.last_promotion_date), 'dd/MM/yyyy')
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEditMilitary(military.id)}
                        title="Editar Dados"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleViewConceptSheet(military.id)}
                        title="Ficha"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleViewPromotions(military.id)}
                        title="Promoções"
                      >
                        <Award className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Nenhum militar cadastrado neste quadro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MilitaryList;
