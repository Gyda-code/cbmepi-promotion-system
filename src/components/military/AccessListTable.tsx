
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PromotionAccessList } from "@/types/military";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EyeIcon } from 'lucide-react';

interface AccessListTableProps {
  accessList: PromotionAccessList[];
  type: 'QAA' | 'QAM';
}

const AccessListTable: React.FC<AccessListTableProps> = ({ accessList, type }) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableCaption>
        {type === 'QAA' ? 'Quadro de Acesso por Antiguidade' : 'Quadro de Acesso por Merecimento'}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Posto/Graduação</TableHead>
          <TableHead>Matrícula</TableHead>
          <TableHead>Última Promoção</TableHead>
          <TableHead>Interstício (anos)</TableHead>
          {type === 'QAM' && <TableHead className="text-right">Pontos</TableHead>}
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accessList.map((item) => (
          <TableRow key={item.military.id}>
            <TableCell>{item.military.full_name}</TableCell>
            <TableCell>{item.military.rank}</TableCell>
            <TableCell>{item.military.registration_number}</TableCell>
            <TableCell>
              {item.military.last_promotion_date 
                ? format(new Date(item.military.last_promotion_date), 'dd/MM/yyyy')
                : 'N/A'}
            </TableCell>
            <TableCell>{item.interstice_years}</TableCell>
            {type === 'QAM' && <TableCell className="text-right">{item.points?.toFixed(2)}</TableCell>}
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/military/concept-sheet/${item.military.id}`)}
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver Ficha
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {accessList.length === 0 && (
          <TableRow>
            <TableCell colSpan={type === 'QAM' ? 7 : 6} className="text-center py-8">
              Nenhum militar qualificado para promoção no quadro de acesso.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default AccessListTable;
