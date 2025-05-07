
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
