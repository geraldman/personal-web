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
      analyses: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          input_tokens: number | null
          model_used: string
          output_tokens: number | null
          owner_id: string
          period: string
          provider: string
          recommendations: Json
          stats_snapshot: Json
          summary_text: string
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          input_tokens?: number | null
          model_used: string
          output_tokens?: number | null
          owner_id?: string
          period: string
          provider: string
          recommendations?: Json
          stats_snapshot?: Json
          summary_text: string
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          input_tokens?: number | null
          model_used?: string
          output_tokens?: number | null
          owner_id?: string
          period?: string
          provider?: string
          recommendations?: Json
          stats_snapshot?: Json
          summary_text?: string
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      entries: {
        Row: {
          category: string
          challenge_name: string
          created_at: string
          date_completed: string | null
          difficulty: string | null
          difficulty_rank: number | null
          external_id: string | null
          id: string
          notes: string | null
          owner_id: string
          platform_id: string
          portfolio_writeup: string | null
          problem_url: string | null
          source: string
          status: string
          synced_at: string | null
          tags: string[]
          updated_at: string
          writeup_generated_at: string | null
          writeup_model: string | null
        }
        Insert: {
          category: string
          challenge_name: string
          created_at?: string
          date_completed?: string | null
          difficulty?: string | null
          difficulty_rank?: number | null
          external_id?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          platform_id: string
          portfolio_writeup?: string | null
          problem_url?: string | null
          source?: string
          status?: string
          synced_at?: string | null
          tags?: string[]
          updated_at?: string
          writeup_generated_at?: string | null
          writeup_model?: string | null
        }
        Update: {
          category?: string
          challenge_name?: string
          created_at?: string
          date_completed?: string | null
          difficulty?: string | null
          difficulty_rank?: number | null
          external_id?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          platform_id?: string
          portfolio_writeup?: string | null
          problem_url?: string | null
          source?: string
          status?: string
          synced_at?: string | null
          tags?: string[]
          updated_at?: string
          writeup_generated_at?: string | null
          writeup_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entries_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          created_at: string
          id: string
          model_used: string | null
          owner_id: string
          parsed: Json | null
          platform_id: string
          raw_input: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_used?: string | null
          owner_id?: string
          parsed?: Json | null
          platform_id: string
          raw_input: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          model_used?: string | null
          owner_id?: string
          parsed?: Json | null
          platform_id?: string
          raw_input?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_accounts: {
        Row: {
          created_at: string
          credential_secret_name: string | null
          handle: string
          id: string
          last_synced_at: string | null
          owner_id: string
          platform_id: string
          sync_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_secret_name?: string | null
          handle: string
          id?: string
          last_synced_at?: string | null
          owner_id?: string
          platform_id: string
          sync_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_secret_name?: string | null
          handle?: string
          id?: string
          last_synced_at?: string | null
          owner_id?: string
          platform_id?: string
          sync_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_accounts_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          brand_color: string
          category: string
          created_at: string
          icon_kind: string
          icon_ref: string
          id: string
          import_hint: string | null
          name: string
          slug: string
          sort_order: number
          sync_adapter: string | null
          updated_at: string
          url: string
        }
        Insert: {
          brand_color: string
          category: string
          created_at?: string
          icon_kind: string
          icon_ref: string
          id?: string
          import_hint?: string | null
          name: string
          slug: string
          sort_order?: number
          sync_adapter?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          brand_color?: string
          category?: string
          created_at?: string
          icon_kind?: string
          icon_ref?: string
          id?: string
          import_hint?: string | null
          name?: string
          slug?: string
          sort_order?: number
          sync_adapter?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      sync_runs: {
        Row: {
          entries_created: number
          entries_updated: number
          error_text: string | null
          finished_at: string | null
          id: string
          owner_id: string
          platform_id: string
          started_at: string
          status: string
        }
        Insert: {
          entries_created?: number
          entries_updated?: number
          error_text?: string | null
          finished_at?: string | null
          id?: string
          owner_id?: string
          platform_id: string
          started_at?: string
          status?: string
        }
        Update: {
          entries_created?: number
          entries_updated?: number
          error_text?: string | null
          finished_at?: string | null
          id?: string
          owner_id?: string
          platform_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_runs_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_entries: {
        Row: {
          category: string | null
          challenge_name: string | null
          date_completed: string | null
          difficulty: string | null
          difficulty_rank: number | null
          id: string | null
          platform_id: string | null
          portfolio_writeup: string | null
          problem_url: string | null
          tags: string[] | null
        }
        Insert: {
          category?: string | null
          challenge_name?: string | null
          date_completed?: string | null
          difficulty?: string | null
          difficulty_rank?: number | null
          id?: string | null
          platform_id?: string | null
          portfolio_writeup?: string | null
          problem_url?: string | null
          tags?: string[] | null
        }
        Update: {
          category?: string | null
          challenge_name?: string | null
          date_completed?: string | null
          difficulty?: string | null
          difficulty_rank?: number | null
          id?: string | null
          platform_id?: string | null
          portfolio_writeup?: string | null
          problem_url?: string | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "entries_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_usage: {
        Row: {
          tag: string | null
          usage_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_owner: { Args: never; Returns: boolean }
      owner_id: { Args: never; Returns: string }
      stats_activity: {
        Args: {
          bucket: string
          from_date: string
          owner: string
          to_date: string
        }
        Returns: {
          bucket_start: string
          count: number
        }[]
      }
      stats_by_difficulty: {
        Args: { owner: string }
        Returns: {
          count: number
          difficulty_rank: number
        }[]
      }
      stats_by_platform: {
        Args: { owner: string }
        Returns: {
          count: number
          platform_id: string
          platform_name: string
        }[]
      }
      stats_by_tag: {
        Args: { limit?: number; owner: string }
        Returns: {
          count: number
          tag: string
        }[]
      }
      stats_kpis: {
        Args: { owner: string }
        Returns: {
          current_streak: number
          longest_streak: number
          solved_this_month: number
          total_solved: number
        }[]
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
