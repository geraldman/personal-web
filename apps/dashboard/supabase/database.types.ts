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
      record_kinds: {
        Row: {
          capabilities: string[]
          color: string | null
          created_at: string
          default_status: string
          done_statuses: string[]
          field_schema: Json
          icon: string | null
          id: string
          is_system: boolean
          name: string
          owner_id: string
          plural_name: string
          slug: string
          sort_order: number
          statuses: string[]
          updated_at: string
        }
        Insert: {
          capabilities?: string[]
          color?: string | null
          created_at?: string
          default_status: string
          done_statuses?: string[]
          field_schema?: Json
          icon?: string | null
          id?: string
          is_system?: boolean
          name: string
          owner_id?: string
          plural_name: string
          slug: string
          sort_order?: number
          statuses: string[]
          updated_at?: string
        }
        Update: {
          capabilities?: string[]
          color?: string | null
          created_at?: string
          default_status?: string
          done_statuses?: string[]
          field_schema?: Json
          icon?: string | null
          id?: string
          is_system?: boolean
          name?: string
          owner_id?: string
          plural_name?: string
          slug?: string
          sort_order?: number
          statuses?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      record_links: {
        Row: {
          created_at: string
          from_id: string
          id: string
          note: string | null
          owner_id: string
          rel: string
          to_id: string
        }
        Insert: {
          created_at?: string
          from_id: string
          id?: string
          note?: string | null
          owner_id?: string
          rel: string
          to_id: string
        }
        Update: {
          created_at?: string
          from_id?: string
          id?: string
          note?: string | null
          owner_id?: string
          rel?: string
          to_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "record_links_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "public_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_links_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "public_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_links_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_links_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "public_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_links_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "public_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_links_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
      records: {
        Row: {
          body: string | null
          completed_on: string | null
          created_at: string
          data: Json
          external_id: string | null
          id: string
          is_public: boolean
          kind_id: string
          minutes_spent: number | null
          notes: string | null
          owner_id: string
          parent_id: string | null
          platform_id: string | null
          rank: number | null
          rank_label: string | null
          slug: string | null
          sort_order: number
          source: string
          started_on: string | null
          status: string
          summary: string | null
          synced_at: string | null
          tags: string[]
          title: string
          updated_at: string
          url: string | null
          writeup_generated_at: string | null
          writeup_model: string | null
        }
        Insert: {
          body?: string | null
          completed_on?: string | null
          created_at?: string
          data?: Json
          external_id?: string | null
          id?: string
          is_public?: boolean
          kind_id: string
          minutes_spent?: number | null
          notes?: string | null
          owner_id?: string
          parent_id?: string | null
          platform_id?: string | null
          rank?: number | null
          rank_label?: string | null
          slug?: string | null
          sort_order?: number
          source?: string
          started_on?: string | null
          status?: string
          summary?: string | null
          synced_at?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          url?: string | null
          writeup_generated_at?: string | null
          writeup_model?: string | null
        }
        Update: {
          body?: string | null
          completed_on?: string | null
          created_at?: string
          data?: Json
          external_id?: string | null
          id?: string
          is_public?: boolean
          kind_id?: string
          minutes_spent?: number | null
          notes?: string | null
          owner_id?: string
          parent_id?: string | null
          platform_id?: string | null
          rank?: number | null
          rank_label?: string | null
          slug?: string | null
          sort_order?: number
          source?: string
          started_on?: string | null
          status?: string
          summary?: string | null
          synced_at?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string | null
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
          {
            foreignKeyName: "records_kind_id_fkey"
            columns: ["kind_id"]
            isOneToOne: false
            referencedRelation: "record_kinds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
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
      public_records: {
        Row: {
          body: string | null
          completed_on: string | null
          data: Json | null
          id: string | null
          kind: string | null
          kind_id: string | null
          kind_name: string | null
          parent_id: string | null
          platform_id: string | null
          rank: number | null
          rank_label: string | null
          slug: string | null
          started_on: string | null
          summary: string | null
          tags: string[] | null
          title: string | null
          url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entries_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_kind_id_fkey"
            columns: ["kind_id"]
            isOneToOne: false
            referencedRelation: "record_kinds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "records_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "records"
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
      time_rollup: {
        Row: {
          kind: string | null
          minutes: number | null
          occurred_on: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      compute_stats_snapshot: { Args: { owner: string }; Returns: Json }
      is_owner: { Args: never; Returns: boolean }
      owner_id: { Args: never; Returns: string }
      review_prefill: {
        Args: { owner: string; window_end: string; window_start: string }
        Returns: Json
      }
      stats_activity: {
        Args: {
          bucket: string
          from_date: string
          kind?: string
          owner: string
          to_date: string
        }
        Returns: {
          bucket_start: string
          count: number
        }[]
      }
      stats_by_field: {
        Args: { field: string; kind?: string; owner: string }
        Returns: {
          count: number
          value: string
        }[]
      }
      stats_by_platform: {
        Args: { kind?: string; owner: string }
        Returns: {
          count: number
          platform_id: string
          platform_name: string
        }[]
      }
      stats_by_rank: {
        Args: { kind?: string; owner: string }
        Returns: {
          count: number
          rank: number
        }[]
      }
      stats_by_tag: {
        Args: { kind?: string; limit?: number; owner: string }
        Returns: {
          count: number
          tag: string
        }[]
      }
      stats_kpis: {
        Args: { kind?: string; owner: string }
        Returns: {
          current_streak: number
          done_this_month: number
          longest_streak: number
          total_done: number
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
