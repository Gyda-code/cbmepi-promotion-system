export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      concept_sheets: {
        Row: {
          civil_courses_count: number | null
          compliments_count: number | null
          created_at: string | null
          id: string
          lack_of_performance_count: number | null
          medals_count: number | null
          military_courses_count: number | null
          military_id: string | null
          punishments_count: number | null
          service_time_years: number | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          civil_courses_count?: number | null
          compliments_count?: number | null
          created_at?: string | null
          id?: string
          lack_of_performance_count?: number | null
          medals_count?: number | null
          military_courses_count?: number | null
          military_id?: string | null
          punishments_count?: number | null
          service_time_years?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          civil_courses_count?: number | null
          compliments_count?: number | null
          created_at?: string | null
          id?: string
          lack_of_performance_count?: number | null
          medals_count?: number | null
          military_courses_count?: number | null
          military_id?: string | null
          punishments_count?: number | null
          service_time_years?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concept_sheets_military_id_fkey"
            columns: ["military_id"]
            isOneToOne: false
            referencedRelation: "military_personnel"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: number
          name: string
          type: Database["public"]["Enums"]["division_type"]
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          type: Database["public"]["Enums"]["division_type"]
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          type?: Database["public"]["Enums"]["division_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      military_personnel: {
        Row: {
          created_at: string | null
          division_id: number
          entry_date: string
          full_name: string
          id: string
          last_promotion_date: string | null
          photo_url: string | null
          rank: Database["public"]["Enums"]["rank_type"]
          registration_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          division_id: number
          entry_date: string
          full_name: string
          id?: string
          last_promotion_date?: string | null
          photo_url?: string | null
          rank: Database["public"]["Enums"]["rank_type"]
          registration_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          division_id?: number
          entry_date?: string
          full_name?: string
          id?: string
          last_promotion_date?: string | null
          photo_url?: string | null
          rank?: Database["public"]["Enums"]["rank_type"]
          registration_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "military_personnel_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_history: {
        Row: {
          created_at: string | null
          id: string
          military_id: string | null
          new_rank: Database["public"]["Enums"]["rank_type"]
          previous_rank: Database["public"]["Enums"]["rank_type"]
          promotion_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          military_id?: string | null
          new_rank: Database["public"]["Enums"]["rank_type"]
          previous_rank: Database["public"]["Enums"]["rank_type"]
          promotion_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          military_id?: string | null
          new_rank?: Database["public"]["Enums"]["rank_type"]
          previous_rank?: Database["public"]["Enums"]["rank_type"]
          promotion_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_history_military_id_fkey"
            columns: ["military_id"]
            isOneToOne: false
            referencedRelation: "military_personnel"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      division_type: "QOEM" | "QOE" | "QORR" | "QPBM" | "QPRR"
      rank_type:
        | "SOLDADO"
        | "CABO"
        | "SARGENTO"
        | "3º SARGENTO"
        | "2º SARGENTO"
        | "1º SARGENTO"
        | "SUBTENENTE"
        | "ASPIRANTE"
        | "2º TENENTE"
        | "1º TENENTE"
        | "CAPITÃO"
        | "MAJOR"
        | "TENENTE-CORONEL"
        | "CORONEL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      division_type: ["QOEM", "QOE", "QORR", "QPBM", "QPRR"],
      rank_type: [
        "SOLDADO",
        "CABO",
        "SARGENTO",
        "3º SARGENTO",
        "2º SARGENTO",
        "1º SARGENTO",
        "SUBTENENTE",
        "ASPIRANTE",
        "2º TENENTE",
        "1º TENENTE",
        "CAPITÃO",
        "MAJOR",
        "TENENTE-CORONEL",
        "CORONEL",
      ],
    },
  },
} as const
