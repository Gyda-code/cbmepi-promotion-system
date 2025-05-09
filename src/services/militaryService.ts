
import { supabase } from "@/integrations/supabase/client";
import { ConceptSheet, Division, MilitaryPersonnel, PromotionHistory, RankType } from "@/types/military";
import { Database } from "@/integrations/supabase/types";

// Helper function to map database response to MilitaryPersonnel interface
export const mapToMilitaryPersonnel = (data: any): MilitaryPersonnel => {
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

// ----- Division Service Functions -----

export const getDivisions = async (): Promise<Division[]> => {
  const { data, error } = await supabase
    .from('divisions')
    .select("*")
    .order("id");
  
  if (error) throw error;
  return data || [];
};

export const getDivisionByCode = async (code: string): Promise<Division | null> => {
  const { data, error } = await supabase
    .from('divisions')
    .select("*")
    .eq("code", code)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data;
};

// ----- Military Personnel Service Functions -----

export const getMilitaryPersonnelByDivision = async (divisionId: number): Promise<MilitaryPersonnel[]> => {
  const { data, error } = await supabase
    .from('military_personnel')
    .select("*")
    .eq("division_id", divisionId)
    .order("full_name");
  
  if (error) throw error;
  return (data || []).map(mapToMilitaryPersonnel);
};

export const getMilitaryPersonnelById = async (id: string): Promise<MilitaryPersonnel | null> => {
  const { data, error } = await supabase
    .from('military_personnel')
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data ? mapToMilitaryPersonnel(data) : null;
};

export const createMilitaryPersonnel = async (military: Omit<MilitaryPersonnel, 'id' | 'created_at' | 'updated_at'>): Promise<MilitaryPersonnel> => {
  const { data, error } = await supabase
    .from('military_personnel')
    .insert(military)
    .select()
    .single();
  
  if (error) throw error;
  
  if (data) {
    // Create an empty concept sheet for the new military
    await createConceptSheet({ military_id: data.id });
  } else {
    throw new Error("No data returned after insert operation");
  }
  
  return mapToMilitaryPersonnel(data);
};

export const updateMilitaryPersonnel = async (id: string, military: Partial<MilitaryPersonnel>): Promise<MilitaryPersonnel> => {
  const { data, error } = await supabase
    .from('military_personnel')
    .update(military)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error("No data returned after update operation");
  return mapToMilitaryPersonnel(data);
};

export const deleteMilitaryPersonnel = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('military_personnel')
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// ----- Concept Sheet Service Functions -----

export const getConceptSheetByMilitaryId = async (militaryId: string): Promise<ConceptSheet | null> => {
  const { data, error } = await supabase
    .from('concept_sheets')
    .select("*")
    .eq("military_id", militaryId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data;
};

export const createConceptSheet = async (conceptSheet: Partial<ConceptSheet>): Promise<ConceptSheet> => {
  const { data, error } = await supabase
    .from('concept_sheets')
    .insert({
      military_id: conceptSheet.military_id,
      service_time_years: conceptSheet.service_time_years || 0,
      military_courses_count: conceptSheet.military_courses_count || 0,
      civil_courses_count: conceptSheet.civil_courses_count || 0,
      medals_count: conceptSheet.medals_count || 0,
      compliments_count: conceptSheet.compliments_count || 0,
      punishments_count: conceptSheet.punishments_count || 0,
      lack_of_performance_count: conceptSheet.lack_of_performance_count || 0
    })
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error("No data returned after insert operation");
  return data;
};

export const updateConceptSheet = async (id: string, conceptSheet: Partial<ConceptSheet>): Promise<ConceptSheet> => {
  const { data, error } = await supabase
    .from('concept_sheets')
    .update(conceptSheet)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error("No data returned after update operation");
  return data;
};

// ----- Promotion History Service Functions -----

export const getPromotionHistoryByMilitaryId = async (militaryId: string): Promise<PromotionHistory[]> => {
  const { data, error } = await supabase
    .from('promotion_history')
    .select("*")
    .eq("military_id", militaryId)
    .order("promotion_date", { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addPromotion = async (promotion: Omit<PromotionHistory, 'id' | 'created_at'>): Promise<PromotionHistory> => {
  const { data, error } = await supabase
    .from('promotion_history')
    .insert(promotion)
    .select()
    .single();
  
  if (error) throw error;
  if (!data) throw new Error("No data returned after insert operation");
  
  // Update military personnel with new rank and promotion date
  await updateMilitaryPersonnel(promotion.military_id, {
    rank: promotion.new_rank,
    last_promotion_date: promotion.promotion_date
  });
  
  return data;
};

// ----- File Upload Helpers -----

export const uploadProfilePhoto = async (file: File, fileName: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) throw error;
  if (!data) throw new Error("No data returned after upload operation");
  
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(data.path);
  
  return publicUrl;
};
