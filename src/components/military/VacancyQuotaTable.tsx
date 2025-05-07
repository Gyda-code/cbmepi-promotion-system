
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VacancyQuota } from "@/types/military";

interface VacancyQuotaTableProps {
  quotas: VacancyQuota[];
  divisionType?: string;
}

const VacancyQuotaTable: React.FC<VacancyQuotaTableProps> = ({ quotas, divisionType }) => {
  // Filter by division type if provided
  const filteredQuotas = divisionType 
    ? quotas.filter(q => q.division_type === divisionType)
    : quotas;

  // Group by division type
  const groupedQuotas = filteredQuotas.reduce<Record<string, VacancyQuota[]>>(
    (acc, quota) => {
      if (!acc[quota.division_type]) {
        acc[quota.division_type] = [];
      }
      acc[quota.division_type].push(quota);
      return acc;
    }, 
    {}
  );

  return (
    <div className="space-y-8">
      {Object.entries(groupedQuotas).map(([division, divisionQuotas]) => (
        <div key={division} className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">{division}</h3>
          <Table>
            <TableCaption>Quadro de Fixação de Vagas (QFV) - Anexo Único Lei 7.772/2022</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Posto/Graduação</TableHead>
                <TableHead className="text-right">Vagas Previstas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {divisionQuotas.sort((a, b) => b.id - a.id).map((quota) => (
                <TableRow key={quota.id}>
                  <TableCell>{quota.rank}</TableCell>
                  <TableCell className="text-right">{quota.vacancies}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};

export default VacancyQuotaTable;
