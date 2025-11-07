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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      community_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          likes_count: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          likes_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          likes_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      devotees: {
        Row: {
          address: string | null
          city: string | null
          contact_number: string
          created_at: string
          email: string | null
          id: string
          name: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_number: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_number?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      donation_campaigns: {
        Row: {
          created_at: string | null
          current_amount: number | null
          description: string | null
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          start_date: string
          target_amount: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date: string
          target_amount: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date?: string
          target_amount?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string | null
          donor_email: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          is_anonymous: boolean | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string | null
          donor_email?: string | null
          donor_name: string
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string | null
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "donation_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      festival_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          image_url: string | null
          is_major_festival: boolean | null
          location: string | null
          start_time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_major_festival?: boolean | null
          location?: string | null
          start_time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_major_festival?: boolean | null
          location?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          item_name: string
          last_restocked: string | null
          price_per_unit: number | null
          quantity: number
          reorder_level: number | null
          supplier_name: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          item_name: string
          last_restocked?: string | null
          price_per_unit?: number | null
          quantity?: number
          reorder_level?: number | null
          supplier_name?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          item_name?: string
          last_restocked?: string | null
          price_per_unit?: number | null
          quantity?: number
          reorder_level?: number | null
          supplier_name?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pooja_bookings: {
        Row: {
          amount_paid: number | null
          created_at: string
          devotee_id: string
          id: string
          pooja_id: string
          scheduled_date: string
          scheduled_time: string
          special_requests: string | null
          status: Database["public"]["Enums"]["pooja_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          devotee_id: string
          id?: string
          pooja_id: string
          scheduled_date: string
          scheduled_time: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["pooja_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          devotee_id?: string
          id?: string
          pooja_id?: string
          scheduled_date?: string
          scheduled_time?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["pooja_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pooja_bookings_devotee_id_fkey"
            columns: ["devotee_id"]
            isOneToOne: false
            referencedRelation: "devotees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pooja_bookings_pooja_id_fkey"
            columns: ["pooja_id"]
            isOneToOne: false
            referencedRelation: "poojas"
            referencedColumns: ["id"]
          },
        ]
      }
      poojas: {
        Row: {
          base_price: number | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          name: string
        }
        Insert: {
          base_price?: number | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
        }
        Update: {
          base_price?: number | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          language_preference: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          language_preference?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          language_preference?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_poojas: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean | null
          next_occurrence: string
          pooja_id: string
          special_requests: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          next_occurrence: string
          pooja_id: string
          special_requests?: string | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_occurrence?: string
          pooja_id?: string
          special_requests?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_poojas_pooja_id_fkey"
            columns: ["pooja_id"]
            isOneToOne: false
            referencedRelation: "poojas"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          devotee_id: string
          id: string
          payment_method: string | null
          reference_number: string | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          devotee_id: string
          id?: string
          payment_method?: string | null
          reference_number?: string | null
          transaction_date?: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          devotee_id?: string
          id?: string
          payment_method?: string | null
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_devotee_id_fkey"
            columns: ["devotee_id"]
            isOneToOne: false
            referencedRelation: "devotees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      virtual_darshan_bookings: {
        Row: {
          created_at: string | null
          id: string
          payment_status: string | null
          slot_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_status?: string | null
          slot_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_status?: string | null
          slot_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_darshan_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "virtual_darshan_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_darshan_slots: {
        Row: {
          created_at: string | null
          current_bookings: number | null
          duration_minutes: number | null
          id: string
          is_available: boolean | null
          max_bookings: number | null
          meeting_link: string | null
          price: number | null
          slot_date: string
          slot_time: string
        }
        Insert: {
          created_at?: string | null
          current_bookings?: number | null
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          max_bookings?: number | null
          meeting_link?: string | null
          price?: number | null
          slot_date: string
          slot_time: string
        }
        Update: {
          created_at?: string | null
          current_bookings?: number | null
          duration_minutes?: number | null
          id?: string
          is_available?: boolean | null
          max_bookings?: number | null
          meeting_link?: string | null
          price?: number | null
          slot_date?: string
          slot_time?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "devotee"
      pooja_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      transaction_type: "donation" | "pooja_fee" | "prasadam" | "other"
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
    Enums: {
      app_role: ["admin", "staff", "devotee"],
      pooja_status: ["scheduled", "in_progress", "completed", "cancelled"],
      transaction_type: ["donation", "pooja_fee", "prasadam", "other"],
    },
  },
} as const
