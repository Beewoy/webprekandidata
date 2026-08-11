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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_generations: {
        Row: {
          accepted_at: string | null
          created_at: string
          estimated_cost_cents: number | null
          id: string
          input_tokens: number | null
          model: string
          output_tokens: number | null
          prompt_fingerprint: string
          provider: string
          retention_expires_at: string
          safety_category: string | null
          site_id: string
          status: string
          target_id: string | null
          task_type: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          estimated_cost_cents?: number | null
          id?: string
          input_tokens?: number | null
          model: string
          output_tokens?: number | null
          prompt_fingerprint: string
          provider: string
          retention_expires_at?: string
          safety_category?: string | null
          site_id: string
          status: string
          target_id?: string | null
          task_type: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          estimated_cost_cents?: number | null
          id?: string
          input_tokens?: number | null
          model?: string
          output_tokens?: number | null
          prompt_fingerprint?: string
          provider?: string
          retention_expires_at?: string
          safety_category?: string | null
          site_id?: string
          status?: string
          target_id?: string | null
          task_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: number
          metadata: Json
          site_id: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json
          site_id?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json
          site_id?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          consent_recorded_at: string
          created_at: string
          delivery_status: string
          id: string
          message: string
          request_fingerprint: string | null
          retention_expires_at: string
          sender_email: string
          sender_name: string
          sender_phone: string | null
          site_id: string
          spam_score: number | null
        }
        Insert: {
          consent_recorded_at: string
          created_at?: string
          delivery_status?: string
          id?: string
          message: string
          request_fingerprint?: string | null
          retention_expires_at?: string
          sender_email: string
          sender_name: string
          sender_phone?: string | null
          site_id: string
          spam_score?: number | null
        }
        Update: {
          consent_recorded_at?: string
          created_at?: string
          delivery_status?: string
          id?: string
          message?: string
          request_fingerprint?: string | null
          retention_expires_at?: string
          sender_email?: string
          sender_name?: string
          sender_phone?: string | null
          site_id?: string
          spam_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          created_at: string
          domain_type: string
          hostname: string
          id: string
          is_primary: boolean
          site_id: string
          ssl_metadata: Json
          status: string
          verification_metadata: Json
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          domain_type: string
          hostname: string
          id?: string
          is_primary?: boolean
          site_id: string
          ssl_metadata?: Json
          status?: string
          verification_metadata?: Json
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          domain_type?: string
          hostname?: string
          id?: string
          is_primary?: boolean
          site_id?: string
          ssl_metadata?: Json
          status?: string
          verification_metadata?: Json
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domains_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verification_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_verification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string
          byte_size: number
          caption: string
          created_at: string
          crop_metadata: Json
          deleted_at: string | null
          height: number | null
          id: string
          kind: string
          mime_type: string
          owner_user_id: string
          site_id: string
          sort_order: number | null
          storage_path: string
          variants: Json
          width: number | null
        }
        Insert: {
          alt_text?: string
          byte_size: number
          caption?: string
          created_at?: string
          crop_metadata?: Json
          deleted_at?: string | null
          height?: number | null
          id?: string
          kind: string
          mime_type: string
          owner_user_id: string
          site_id: string
          sort_order?: number | null
          storage_path: string
          variants?: Json
          width?: number | null
        }
        Update: {
          alt_text?: string
          byte_size?: number
          caption?: string
          created_at?: string
          crop_metadata?: Json
          deleted_at?: string | null
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string
          owner_user_id?: string
          site_id?: string
          sort_order?: number | null
          storage_path?: string
          variants?: Json
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_snapshot: Json
          created_at: string
          currency: string
          fulfilled_at: string | null
          id: string
          net_cents: number | null
          paid_at: string | null
          plan_code: Database["public"]["Enums"]["plan_code"]
          seller_snapshot: Json
          site_id: string
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          tax_cents: number | null
          total_cents: number
          user_id: string
          valid_until: string | null
        }
        Insert: {
          buyer_snapshot: Json
          created_at?: string
          currency?: string
          fulfilled_at?: string | null
          id?: string
          net_cents?: number | null
          paid_at?: string | null
          plan_code: Database["public"]["Enums"]["plan_code"]
          seller_snapshot: Json
          site_id: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          tax_cents?: number | null
          total_cents: number
          user_id: string
          valid_until?: string | null
        }
        Update: {
          buyer_snapshot?: Json
          created_at?: string
          currency?: string
          fulfilled_at?: string | null
          id?: string
          net_cents?: number | null
          paid_at?: string | null
          plan_code?: Database["public"]["Enums"]["plan_code"]
          seller_snapshot?: Json
          site_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          tax_cents?: number | null
          total_cents?: number
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          event_type: string
          failure_reason: string | null
          id: string
          payload_reference: string | null
          processed_at: string | null
          processing_status: string
          provider_event_id: string
          received_at: string
        }
        Insert: {
          event_type: string
          failure_reason?: string | null
          id?: string
          payload_reference?: string | null
          processed_at?: string | null
          processing_status?: string
          provider_event_id: string
          received_at?: string
        }
        Update: {
          event_type?: string
          failure_reason?: string | null
          id?: string
          payload_reference?: string | null
          processed_at?: string | null
          processing_status?: string
          provider_event_id?: string
          received_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_user_id: string
          body: Json
          cover_asset_id: string | null
          created_at: string
          deleted_at: string | null
          excerpt: string
          id: string
          published_at: string | null
          revision: number
          seo_description: string
          seo_title: string
          site_id: string
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_user_id: string
          body?: Json
          cover_asset_id?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string
          id?: string
          published_at?: string | null
          revision?: number
          seo_description?: string
          seo_title?: string
          site_id: string
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string
          body?: Json
          cover_asset_id?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string
          id?: string
          published_at?: string | null
          revision?: number
          seo_description?: string
          seo_title?: string
          site_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_cover_asset_id_fkey"
            columns: ["cover_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email_verified_at: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_verified_at?: string | null
          full_name?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_verified_at?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      site_drafts: {
        Row: {
          content: Json
          revision: number
          schema_version: number
          seo: Json
          site_id: string
          theme: Json
          updated_at: string
          updated_by: string
          validation_state: Json
        }
        Insert: {
          content?: Json
          revision?: number
          schema_version?: number
          seo?: Json
          site_id: string
          theme?: Json
          updated_at?: string
          updated_by: string
          validation_state?: Json
        }
        Update: {
          content?: Json
          revision?: number
          schema_version?: number
          seo?: Json
          site_id?: string
          theme?: Json
          updated_at?: string
          updated_by?: string
          validation_state?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_drafts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_drafts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_publications: {
        Row: {
          content: Json
          id: string
          media_manifest: Json
          published_at: string
          published_by: string
          schema_version: number
          seo: Json
          site_id: string
          theme: Json
          unpublished_at: string | null
          version_number: number
        }
        Insert: {
          content: Json
          id?: string
          media_manifest?: Json
          published_at?: string
          published_by: string
          schema_version?: number
          seo: Json
          site_id: string
          theme: Json
          unpublished_at?: string | null
          version_number: number
        }
        Update: {
          content?: Json
          id?: string
          media_manifest?: Json
          published_at?: string
          published_by?: string
          schema_version?: number
          seo?: Json
          site_id?: string
          theme?: Json
          unpublished_at?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "site_publications_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_publications_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          campaign_ends_at: string | null
          candidate_name: string
          created_at: string
          current_publication_id: string | null
          deleted_at: string | null
          id: string
          internal_name: string
          locality: string
          owner_user_id: string
          plan_code: Database["public"]["Enums"]["plan_code"] | null
          slug: string
          status: Database["public"]["Enums"]["site_status"]
          updated_at: string
        }
        Insert: {
          campaign_ends_at?: string | null
          candidate_name?: string
          created_at?: string
          current_publication_id?: string | null
          deleted_at?: string | null
          id?: string
          internal_name: string
          locality?: string
          owner_user_id: string
          plan_code?: Database["public"]["Enums"]["plan_code"] | null
          slug: string
          status?: Database["public"]["Enums"]["site_status"]
          updated_at?: string
        }
        Update: {
          campaign_ends_at?: string | null
          candidate_name?: string
          created_at?: string
          current_publication_id?: string | null
          deleted_at?: string | null
          id?: string
          internal_name?: string
          locality?: string
          owner_user_id?: string
          plan_code?: Database["public"]["Enums"]["plan_code"] | null
          slug?: string
          status?: Database["public"]["Enums"]["site_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_current_publication_fk"
            columns: ["current_publication_id"]
            isOneToOne: false
            referencedRelation: "site_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_candidate_post: { Args: { p_site_id: string }; Returns: string }
      create_candidate_site: {
        Args: {
          p_candidate_name: string
          p_internal_name: string
          p_locality: string
          p_position: string
          p_slug: string
        }
        Returns: string
      }
      has_plus_entitlement: { Args: { p_site_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      issue_email_verification_token: {
        Args: { p_token_hash: string; p_user_id: string }
        Returns: string
      }
      owns_site: { Args: { target_site_id: string }; Returns: boolean }
      reorder_gallery_assets: {
        Args: { p_asset_ids: string[]; p_site_id: string }
        Returns: undefined
      }
      reserve_post_ai_generation: {
        Args: {
          p_model: string
          p_post_id: string
          p_prompt_fingerprint: string
          p_site_id: string
        }
        Returns: string
      }
      revoke_email_verification_token: {
        Args: { p_token_hash: string; p_user_id: string }
        Returns: undefined
      }
      storage_object_site_id: { Args: { object_name: string }; Returns: string }
      update_site_section: {
        Args: {
          p_expected_revision: number
          p_payload: Json
          p_section_key: string
          p_site_id: string
        }
        Returns: number
      }
      verify_email_token: { Args: { p_token_hash: string }; Returns: boolean }
    }
    Enums: {
      order_status: "pending" | "paid" | "failed" | "refunded" | "cancelled"
      plan_code: "basic" | "plus"
      post_status: "draft" | "published" | "archived"
      site_status:
        | "draft"
        | "ready"
        | "payment_pending"
        | "published"
        | "suspended"
        | "archived"
      user_role: "candidate" | "admin"
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
      order_status: ["pending", "paid", "failed", "refunded", "cancelled"],
      plan_code: ["basic", "plus"],
      post_status: ["draft", "published", "archived"],
      site_status: [
        "draft",
        "ready",
        "payment_pending",
        "published",
        "suspended",
        "archived",
      ],
      user_role: ["candidate", "admin"],
    },
  },
} as const
