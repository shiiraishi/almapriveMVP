export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      payments: {
        Row: {
          amount: number | null
          created_at: string
          discount_percent: number
          expiration_date: string | null
          id: string
          notes: string | null
          original_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string
          plan_type: string
          profile_id: string
          promo_label: string | null
          subscription_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          discount_percent?: number
          expiration_date?: string | null
          id?: string
          notes?: string | null
          original_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          plan_type: string
          profile_id: string
          promo_label?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          discount_percent?: number
          expiration_date?: string | null
          id?: string
          notes?: string | null
          original_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string
          plan_type?: string
          profile_id?: string
          promo_label?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          profile_id: string
          profile_name: string | null
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          profile_id: string
          profile_name?: string | null
          reason: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          profile_id?: string
          profile_name?: string | null
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          availability: string | null
          bio: string | null
          cover_image: string | null
          created_at: string | null
          dress_size: string | null
          eye_color: string | null
          gallery_images: string[] | null
          gallery_videos: string[] | null
          hair_color: string | null
          has_piercing: boolean | null
          has_silicone: boolean | null
          has_tattoo: boolean | null
          height_cm: number | null
          id: string
          is_black: boolean
          is_online: boolean
          is_pioneer: boolean
          is_suspended: boolean
          is_verified: boolean | null
          location: string | null
          main_image: string | null
          manual_position: number | null
          name: string | null
          payment_methods: string[] | null
          price_display: string | null
          priority_level: number | null
          service_location: string[] | null
          services: string[] | null
          services_not_offered: string[] | null
          video_url: string | null
          weight_kg: number | null
          whatsapp_number: string | null
        }
        Insert: {
          age?: number | null
          availability?: string | null
          bio?: string | null
          cover_image?: string | null
          created_at?: string | null
          dress_size?: string | null
          eye_color?: string | null
          gallery_images?: string[] | null
          gallery_videos?: string[] | null
          hair_color?: string | null
          has_piercing?: boolean | null
          has_silicone?: boolean | null
          has_tattoo?: boolean | null
          height_cm?: number | null
          id?: string
          is_black?: boolean
          is_online?: boolean
          is_pioneer?: boolean
          is_suspended?: boolean
          is_verified?: boolean | null
          location?: string | null
          main_image?: string | null
          manual_position?: number | null
          name?: string | null
          payment_methods?: string[] | null
          price_display?: string | null
          priority_level?: number | null
          service_location?: string[] | null
          services?: string[] | null
          services_not_offered?: string[] | null
          video_url?: string | null
          weight_kg?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          age?: number | null
          availability?: string | null
          bio?: string | null
          cover_image?: string | null
          created_at?: string | null
          dress_size?: string | null
          eye_color?: string | null
          gallery_images?: string[] | null
          gallery_videos?: string[] | null
          hair_color?: string | null
          has_piercing?: boolean | null
          has_silicone?: boolean | null
          has_tattoo?: boolean | null
          height_cm?: number | null
          id?: string
          is_black?: boolean
          is_online?: boolean
          is_pioneer?: boolean
          is_suspended?: boolean
          is_verified?: boolean | null
          location?: string | null
          main_image?: string | null
          manual_position?: number | null
          name?: string | null
          payment_methods?: string[] | null
          price_display?: string | null
          priority_level?: number | null
          service_location?: string[] | null
          services?: string[] | null
          services_not_offered?: string[] | null
          video_url?: string | null
          weight_kg?: number | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          expiration_date: string | null
          id: string
          notes: string | null
          partnership_notes: string | null
          partnership_reason: string | null
          partnership_review_date: string | null
          partnership_start_date: string | null
          partnership_status: string | null
          plan_type: string
          profile_id: string
          start_date: string
          subscription_status: string
          subscription_type: string
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          partnership_notes?: string | null
          partnership_reason?: string | null
          partnership_review_date?: string | null
          partnership_start_date?: string | null
          partnership_status?: string | null
          plan_type: string
          profile_id: string
          start_date?: string
          subscription_status?: string
          subscription_type?: string
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          expiration_date?: string | null
          id?: string
          notes?: string | null
          partnership_notes?: string | null
          partnership_reason?: string | null
          partnership_review_date?: string | null
          partnership_start_date?: string | null
          partnership_status?: string | null
          plan_type?: string
          profile_id?: string
          start_date?: string
          subscription_status?: string
          subscription_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_assinaturas_atrasadas: {
        Row: {
          dias_em_atraso: number | null
          expiration_date: string | null
          name: string | null
          plan_type: string | null
          whatsapp_number: string | null
        }
        Relationships: []
      }
      v_assinaturas_vencendo: {
        Row: {
          expiration_date: string | null
          name: string | null
          plan_type: string | null
          whatsapp_number: string | null
        }
        Relationships: []
      }
      v_bronze_ativos: {
        Row: {
          expiration_date: string | null
          name: string | null
          plan_type: string | null
          whatsapp_number: string | null
        }
        Relationships: []
      }
      v_ouro_ativos: {
        Row: {
          expiration_date: string | null
          name: string | null
          plan_type: string | null
          whatsapp_number: string | null
        }
        Relationships: []
      }
      v_pagamentos_pendentes: {
        Row: {
          amount: number | null
          data_prevista: string | null
          name: string | null
          plan_type: string | null
        }
        Relationships: []
      }
      v_parcerias_ativas: {
        Row: {
          created_at: string | null
          name: string | null
          notes: string | null
          plan_type: string | null
          whatsapp_number: string | null
        }
        Relationships: []
      }
      v_prata_ativos: {
        Row: {
          expiration_date: string | null
          name: string | null
          plan_type: string | null
          whatsapp_number: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      plan_duration_days: { Args: { _plan: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
