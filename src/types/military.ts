
export type RankType = 
  | 'SOLDADO' 
  | 'CABO' 
  | 'SARGENTO' 
  | '3º SARGENTO' 
  | '2º SARGENTO' 
  | '1º SARGENTO' 
  | 'SUBTENENTE' 
  | 'ASPIRANTE' 
  | '2º TENENTE' 
  | '1º TENENTE' 
  | 'CAPITÃO' 
  | 'MAJOR' 
  | 'TENENTE-CORONEL' 
  | 'CORONEL';

export type DivisionType = 'QOEM' | 'QOE' | 'QORR' | 'QPBM' | 'QPRR';

export interface Division {
  id: number;
  code: string;
  name: string;
  type: DivisionType;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MilitaryPersonnel {
  id: string;
  full_name: string;
  rank: RankType;
  division_id: number;
  registration_number: string;
  entry_date: string;
  last_promotion_date: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  // New fields for promotion requirements
  has_cfo: boolean;
  has_cao: boolean;
  has_chobm: boolean;
  has_superior_degree: boolean;
  is_health_approved: boolean;
  has_reduced_interstice: boolean;
  // Impediments (Art. 21 and 22 of Law 5.461)
  is_sub_judice: boolean;
  is_in_disciplinary_process: boolean;
  is_on_desertion: boolean;
  is_on_leave: boolean;
  is_on_limited_service: boolean;
}

export interface ConceptSheet {
  id: string;
  military_id: string;
  service_time_years: number;
  military_courses_count: number;
  civil_courses_count: number;
  medals_count: number;
  compliments_count: number;
  punishments_count: number;
  lack_of_performance_count: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionHistory {
  id: string;
  military_id: string;
  promotion_date: string;
  previous_rank: RankType;
  new_rank: RankType;
  created_at: string;
}

// Ranks in order for promotions
export const ranksOrder: Record<RankType, number> = {
  'SOLDADO': 1,
  'CABO': 2,
  'SARGENTO': 3,
  '3º SARGENTO': 4,
  '2º SARGENTO': 5,
  '1º SARGENTO': 6,
  'SUBTENENTE': 7,
  'ASPIRANTE': 8,
  '2º TENENTE': 9,
  '1º TENENTE': 10,
  'CAPITÃO': 11,
  'MAJOR': 12,
  'TENENTE-CORONEL': 13,
  'CORONEL': 14
};

// Interface for the vacancy quota table
export interface VacancyQuota {
  id: number;
  division_type: DivisionType;
  rank: RankType;
  vacancies: number;
}

// Interface for promotion access lists
export interface PromotionAccessList {
  military: MilitaryPersonnel;
  division: Division;
  interstice_years: number;
  meets_requirements: boolean;
  points?: number; // For QAM
}

// Promotion dates according to Law
export const PROMOTION_DATES = {
  JULY: '07-18',
  DECEMBER: '12-23'
};
