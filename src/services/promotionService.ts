import { differenceInMonths, parse } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { 
  ConceptSheet, 
  Division, 
  MilitaryPersonnel, 
  PromotionAccessList, 
  PROMOTION_DATES, 
  RankType, 
  VacancyQuota,
  ranksOrder
} from "@/types/military";
import { Database } from "@/integrations/supabase/types";

// Helper function to map database response to MilitaryPersonnel interface
const mapToMilitaryPersonnel = (data: any): MilitaryPersonnel => {
  return {
    ...data,
    // Set default values for fields that don't exist in database yet
    has_cfo: data.has_cfo ?? false,
    has_cao: data.has_cao ?? false,
    has_chobm: data.has_chobm ?? false,
    has_superior_degree: data.has_superior_degree ?? false,
    is_health_approved: data.is_health_approved ?? true,
    has_reduced_interstice: data.has_reduced_interstice ?? false,
    is_sub_judice: data.is_sub_judice ?? false,
    is_in_disciplinary_process: data.is_in_disciplinary_process ?? false,
    is_on_desertion: data.is_on_desertion ?? false,
    is_on_leave: data.is_on_leave ?? false,
    is_on_limited_service: data.is_on_limited_service ?? false
  };
};

// Get the minimum required interstice for promotion based on rank and division type
export function getMinimumInterstice(rank: RankType, divisionType: string): number {
  // Based on RF005 from requirements document
  if (divisionType === 'QOEM') {
    switch (rank) {
      case '2º TENENTE': return 2;
      case '1º TENENTE': return 3;
      case 'CAPITÃO': return 4;
      case 'MAJOR': return 3;
      case 'TENENTE-CORONEL': return 2;
      default: return 0;
    }
  } else if (divisionType === 'QOE') {
    switch (rank) {
      case '2º TENENTE': return 3;
      case '1º TENENTE': return 4;
      case 'CAPITÃO': return 5;
      default: return 0;
    }
  } else if (divisionType === 'QPBM') {
    switch (rank) {
      case 'SOLDADO': return 3;
      case 'CABO': return 5;
      case 'SARGENTO': return 1;
      case '3º SARGENTO': return 5;
      case '2º SARGENTO': return 5;
      case '1º SARGENTO': return 2;
      default: return 0;
    }
  }
  
  return 0; // Default or not applicable
}

// Calculate interstice (time in current rank)
export function calculateInterstice(military: MilitaryPersonnel): number {
  if (!military.last_promotion_date) {
    return 0;
  }
  
  const currentDate = new Date();
  const lastPromotionDate = new Date(military.last_promotion_date);
  
  // Calculate months and convert to years
  const monthsDifference = differenceInMonths(currentDate, lastPromotionDate);
  return Math.floor(monthsDifference / 12);
}

// Check if a military meets all requirements for access lists
export function checkPromotionRequirements(
  military: MilitaryPersonnel, 
  division: Division
): { meetsRequirements: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // 1. Check minimum interstice
  const requiredInterstice = getMinimumInterstice(military.rank, division.type);
  const currentInterstice = calculateInterstice(military);
  
  // Apply interstice reduction if applicable (Art. 15 of Law 7.772)
  const effectiveInterstice = military.has_reduced_interstice 
    ? currentInterstice + 1 // Assume 1 year reduction
    : currentInterstice;
  
  if (effectiveInterstice < requiredInterstice) {
    reasons.push(`Interstício insuficiente (${effectiveInterstice}/${requiredInterstice} anos)`);
  }
  
  // 2. Check required courses
  if (division.type === 'QOEM' || division.type === 'QOE') {
    // Check for officer requirements
    if (['2º TENENTE', '1º TENENTE', 'CAPITÃO'].includes(military.rank) && !military.has_cfo) {
      reasons.push('CFO não concluído');
    }
    if (['MAJOR', 'TENENTE-CORONEL'].includes(military.rank) && !military.has_cao) {
      reasons.push('CAO não concluído');
    }
    if (military.rank === 'CORONEL' && !military.has_chobm) {
      reasons.push('CHOBM não concluído');
    }
    // Superior degree for Major in QOCBM
    if (division.type === 'QOEM' && military.rank === 'MAJOR' && !military.has_superior_degree) {
      reasons.push('Curso superior não concluído');
    }
  }
  
  // 3. Check health inspection
  if (!military.is_health_approved) {
    reasons.push('Não aprovado em inspeção de saúde');
  }
  
  // 4. Check impediments (Art. 21 and 22 of Law 5.461)
  if (military.is_sub_judice) {
    reasons.push('Sub judice');
  }
  if (military.is_in_disciplinary_process) {
    reasons.push('Em processo disciplinar');
  }
  if (military.is_on_desertion) {
    reasons.push('Em deserção');
  }
  if (military.is_on_leave) {
    reasons.push('Em licença');
  }
  if (military.is_on_limited_service) {
    reasons.push('Em serviço limitado');
  }
  
  return {
    meetsRequirements: reasons.length === 0,
    reasons
  };
}

// Generate Quadro de Acesso por Antiguidade (QAA)
export async function generateQAA(divisionId: number): Promise<PromotionAccessList[]> {
  try {
    // 1. Get the division
    const divisionResult = await supabase
      .from('divisions')
      .select('*')
      .eq('id', divisionId)
      .single();
    
    if (divisionResult.error) throw divisionResult.error;
    const division = divisionResult.data;
    
    // 2. Get all military personnel from the division
    const militaryResult = await supabase
      .from('military_personnel')
      .select('*')
      .eq('division_id', divisionId);
    
    if (militaryResult.error) throw militaryResult.error;
    const militaryPersonnel = militaryResult.data?.map(mapToMilitaryPersonnel) || [];
    
    // 3. Filter military personnel that meet requirements and sort by promotion date
    const accessList: PromotionAccessList[] = await Promise.all(
      militaryPersonnel.map(async (military) => {
        const interstice = calculateInterstice(military);
        const { meetsRequirements, reasons } = checkPromotionRequirements(military, division);
        
        return {
          military,
          division,
          interstice_years: interstice,
          meets_requirements: meetsRequirements
        };
      })
    );
    
    // 4. Filter qualified and sort by last promotion date (oldest first)
    return accessList
      .filter(item => item.meets_requirements)
      .sort((a, b) => {
        // Sort by last promotion date - oldest first
        const dateA = a.military.last_promotion_date ? new Date(a.military.last_promotion_date) : new Date(a.military.entry_date);
        const dateB = b.military.last_promotion_date ? new Date(b.military.last_promotion_date) : new Date(b.military.entry_date);
        return dateA.getTime() - dateB.getTime();
      });
  } catch (error) {
    console.error('Error generating QAA:', error);
    throw error;
  }
}

// Generate Quadro de Acesso por Merecimento (QAM)
export async function generateQAM(divisionId: number): Promise<PromotionAccessList[]> {
  try {
    // 1. Get the division
    const divisionResult = await supabase
      .from('divisions')
      .select('*')
      .eq('id', divisionId)
      .single();
    
    if (divisionResult.error) throw divisionResult.error;
    const division = divisionResult.data;
    
    // 2. Get all military personnel from the division
    const militaryResult = await supabase
      .from('military_personnel')
      .select('*')
      .eq('division_id', divisionId);
    
    if (militaryResult.error) throw militaryResult.error;
    const militaryPersonnel = militaryResult.data?.map(mapToMilitaryPersonnel) || [];
    
    // 3. Process each military, get their concept sheet points
    const accessList: PromotionAccessList[] = await Promise.all(
      militaryPersonnel.map(async (military) => {
        const interstice = calculateInterstice(military);
        const { meetsRequirements } = checkPromotionRequirements(military, division);
        
        // Get concept sheet for points
        const conceptSheetResult = await supabase
          .from('concept_sheets')
          .select('*')
          .eq('military_id', military.id)
          .single();
        
        const points = conceptSheetResult.data?.total_points || 0;
        
        return {
          military,
          division,
          interstice_years: interstice,
          meets_requirements: meetsRequirements,
          points
        };
      })
    );
    
    // 4. Filter qualified and sort by points (highest first), 
    // then by last promotion date (oldest first) for ties
    return accessList
      .filter(item => item.meets_requirements)
      .sort((a, b) => {
        // First sort by points (descending)
        if ((b.points || 0) !== (a.points || 0)) {
          return (b.points || 0) - (a.points || 0);
        }
        
        // If points are tied, sort by last promotion date (oldest first)
        const dateA = a.military.last_promotion_date ? new Date(a.military.last_promotion_date) : new Date(a.military.entry_date);
        const dateB = b.military.last_promotion_date ? new Date(b.military.last_promotion_date) : new Date(b.military.entry_date);
        return dateA.getTime() - dateB.getTime();
      });
  } catch (error) {
    console.error('Error generating QAM:', error);
    throw error;
  }
}

// Get vacancy quotas based on the Law 7.772/2022, Annex
export async function getVacancyQuotas(): Promise<VacancyQuota[]> {
  // This would ideally come from a database table, 
  // but for simplicity we're hard-coding the values from Law 7.772/2022
  return [
    // QOEM
    { id: 1, division_type: 'QOEM', rank: 'CORONEL', vacancies: 1 },
    { id: 2, division_type: 'QOEM', rank: 'TENENTE-CORONEL', vacancies: 4 },
    { id: 3, division_type: 'QOEM', rank: 'MAJOR', vacancies: 10 },
    { id: 4, division_type: 'QOEM', rank: 'CAPITÃO', vacancies: 20 },
    { id: 5, division_type: 'QOEM', rank: '1º TENENTE', vacancies: 25 },
    { id: 6, division_type: 'QOEM', rank: '2º TENENTE', vacancies: 30 },
    
    // QOE
    { id: 7, division_type: 'QOE', rank: 'CAPITÃO', vacancies: 5 },
    { id: 8, division_type: 'QOE', rank: '1º TENENTE', vacancies: 10 },
    { id: 9, division_type: 'QOE', rank: '2º TENENTE', vacancies: 15 },
    
    // QPBM
    { id: 10, division_type: 'QPBM', rank: 'SUBTENENTE', vacancies: 30 },
    { id: 11, division_type: 'QPBM', rank: '1º SARGENTO', vacancies: 60 },
    { id: 12, division_type: 'QPBM', rank: '2º SARGENTO', vacancies: 90 },
    { id: 13, division_type: 'QPBM', rank: '3º SARGENTO', vacancies: 120 },
    { id: 14, division_type: 'QPBM', rank: 'CABO', vacancies: 200 },
    { id: 15, division_type: 'QPBM', rank: 'SOLDADO', vacancies: 400 }
  ];
}

// Calculate promotion distribution by seniority and merit
export function calculatePromotionDistribution(vacancies: number): { 
  byMerit: number; 
  bySeniority: number; 
} {
  // According to Article 9 of Law 5.461/2005
  if (vacancies <= 0) {
    return { byMerit: 0, bySeniority: 0 };
  }
  
  if (vacancies === 1) {
    return { byMerit: 0, bySeniority: 1 };
  }
  
  if (vacancies === 2) {
    return { byMerit: 1, bySeniority: 1 };
  }
  
  // For more than 2 vacancies: 1/3 merit, 2/3 seniority
  const byMerit = Math.ceil(vacancies / 3);
  const bySeniority = vacancies - byMerit;
  
  return { byMerit, bySeniority };
}

// Check if the current date is close to a promotion date
export function isNearPromotionDate(daysThreshold: number = 30): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Parse the two promotion dates for the current year
  const julyPromotion = parse(`${currentYear}-${PROMOTION_DATES.JULY}`, 'yyyy-MM-dd', new Date());
  const decemberPromotion = parse(`${currentYear}-${PROMOTION_DATES.DECEMBER}`, 'yyyy-MM-dd', new Date());
  
  // Calculate days difference
  const julyDiff = Math.abs(differenceInMonths(currentDate, julyPromotion) * 30.44);
  const decemberDiff = Math.abs(differenceInMonths(currentDate, decemberPromotion) * 30.44);
  
  return julyDiff <= daysThreshold || decemberDiff <= daysThreshold;
}

// Get the next promotion date
export function getNextPromotionDate(): Date {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Parse the two promotion dates for the current year
  const julyPromotion = parse(`${currentYear}-${PROMOTION_DATES.JULY}`, 'yyyy-MM-dd', new Date());
  const decemberPromotion = parse(`${currentYear}-${PROMOTION_DATES.DECEMBER}`, 'yyyy-MM-dd', new Date());
  
  // If we've passed December's date, return next July
  if (currentDate > decemberPromotion) {
    return parse(`${currentYear + 1}-${PROMOTION_DATES.JULY}`, 'yyyy-MM-dd', new Date());
  }
  
  // If we've passed July's date but not December's, return December
  if (currentDate > julyPromotion) {
    return decemberPromotion;
  }
  
  // Otherwise return this year's July date
  return julyPromotion;
}

// Update military service with our new promotion-related fields
export const updateMilitaryPersonnelFields = async (
  id: string, 
  fields: Partial<MilitaryPersonnel>
): Promise<MilitaryPersonnel> => {
  const { data, error } = await supabase
    .from('military_personnel')
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error("No data returned after update operation");
  return mapToMilitaryPersonnel(data);
};
