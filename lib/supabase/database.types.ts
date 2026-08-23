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
      complaints: {
        Row: {
          channel: string
          complaint_number: string
          confirmation_email_sent_at: string | null
          created_at: string
          deadline_at: string
          decision_at: string | null
          decision_reason: string | null
          description: string
          desired_remedy: string | null
          email: string
          full_name: string
          id: string
          order_id: string | null
          received_at: string
          remedy: string | null
          site_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel?: string
          complaint_number?: string
          confirmation_email_sent_at?: string | null
          created_at?: string
          deadline_at: string
          decision_at?: string | null
          decision_reason?: string | null
          description: string
          desired_remedy?: string | null
          email: string
          full_name: string
          id?: string
          order_id?: string | null
          received_at?: string
          remedy?: string | null
          site_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          complaint_number?: string
          confirmation_email_sent_at?: string | null
          created_at?: string
          deadline_at?: string
          decision_at?: string | null
          decision_reason?: string | null
          description?: string
          desired_remedy?: string | null
          email?: string
          full_name?: string
          id?: string
          order_id?: string | null
          received_at?: string
          remedy?: string | null
          site_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      content_reports: {
        Row: {
          content_url: string
          decided_at: string | null
          decided_by: string | null
          decision: string | null
          decision_basis: string | null
          good_faith: boolean
          id: string
          political_ad_snapshot_id: string
          priority: string
          reason: string
          received_at: string
          report_type: string
          reporter_email: string
          reporter_name: string
          reporter_notified_at: string | null
          site_id: string
          source_fingerprint: string
          sponsor_notified_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          content_url: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          decision_basis?: string | null
          good_faith: boolean
          id?: string
          political_ad_snapshot_id: string
          priority?: string
          reason: string
          received_at?: string
          report_type: string
          reporter_email: string
          reporter_name: string
          reporter_notified_at?: string | null
          site_id: string
          source_fingerprint: string
          sponsor_notified_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          content_url?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          decision_basis?: string | null
          good_faith?: boolean
          id?: string
          political_ad_snapshot_id?: string
          priority?: string
          reason?: string
          received_at?: string
          report_type?: string
          reporter_email?: string
          reporter_name?: string
          reporter_notified_at?: string | null
          site_id?: string
          source_fingerprint?: string
          sponsor_notified_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_political_ad_snapshot_id_fkey"
            columns: ["political_ad_snapshot_id"]
            isOneToOne: false
            referencedRelation: "political_ad_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reports_site_id_fkey"
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
      draft_revision_cooldowns: {
        Row: {
          conflict_until: string
          last_revision: number | null
          site_id: string
          updated_at: string
        }
        Insert: {
          conflict_until: string
          last_revision?: number | null
          site_id: string
          updated_at?: string
        }
        Update: {
          conflict_until?: string
          last_revision?: number | null
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_revision_cooldowns_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
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
      feedback_submissions: {
        Row: {
          comment: string | null
          consent_public: boolean
          created_at: string
          editor_rating: number
          email: string | null
          highlights: string[]
          id: string
          improvements: string[]
          overall_rating: number
          request_fingerprint: string | null
          site_id: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          consent_public?: boolean
          created_at?: string
          editor_rating: number
          email?: string | null
          highlights?: string[]
          id?: string
          improvements?: string[]
          overall_rating: number
          request_fingerprint?: string | null
          site_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          consent_public?: boolean
          created_at?: string
          editor_rating?: number
          email?: string | null
          highlights?: string[]
          id?: string
          improvements?: string[]
          overall_rating?: number
          request_fingerprint?: string | null
          site_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_submissions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_audit_events: {
        Row: {
          action: string
          actor_service: string | null
          actor_user_id: string | null
          after_hash: string | null
          before_hash: string | null
          correlation_id: string | null
          entity_id: string | null
          entity_type: string
          entity_version: string | null
          id: number
          legal_basis_tag: string | null
          metadata: Json
          occurred_at: string
          result: string
        }
        Insert: {
          action: string
          actor_service?: string | null
          actor_user_id?: string | null
          after_hash?: string | null
          before_hash?: string | null
          correlation_id?: string | null
          entity_id?: string | null
          entity_type: string
          entity_version?: string | null
          id?: never
          legal_basis_tag?: string | null
          metadata?: Json
          occurred_at?: string
          result?: string
        }
        Update: {
          action?: string
          actor_service?: string | null
          actor_user_id?: string | null
          after_hash?: string | null
          before_hash?: string | null
          correlation_id?: string | null
          entity_id?: string | null
          entity_type?: string
          entity_version?: string | null
          id?: never
          legal_basis_tag?: string | null
          metadata?: Json
          occurred_at?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_audit_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_document_versions: {
        Row: {
          content_hash: string
          content_markdown: string
          created_at: string
          doc_type: string
          effective_from: string
          id: string
          locale: string
          published_at: string
          title: string
          version: string
        }
        Insert: {
          content_hash: string
          content_markdown: string
          created_at?: string
          doc_type: string
          effective_from: string
          id?: string
          locale?: string
          published_at?: string
          title: string
          version: string
        }
        Update: {
          content_hash?: string
          content_markdown?: string
          created_at?: string
          doc_type?: string
          effective_from?: string
          id?: string
          locale?: string
          published_at?: string
          title?: string
          version?: string
        }
        Relationships: []
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
      order_legal_acceptances: {
        Row: {
          acceptance_kind: string
          accepted: boolean
          accepted_at: string
          actor_user_id: string | null
          document_version_id: string | null
          id: string
          ip_hash: string | null
          order_id: string
          statement_text: string
          statement_version: string
          user_agent: string | null
        }
        Insert: {
          acceptance_kind: string
          accepted: boolean
          accepted_at?: string
          actor_user_id?: string | null
          document_version_id?: string | null
          id?: string
          ip_hash?: string | null
          order_id: string
          statement_text: string
          statement_version: string
          user_agent?: string | null
        }
        Update: {
          acceptance_kind?: string
          accepted?: boolean
          accepted_at?: string
          actor_user_id?: string | null
          document_version_id?: string | null
          id?: string
          ip_hash?: string | null
          order_id?: string
          statement_text?: string
          statement_version?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_legal_acceptances_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_legal_acceptances_document_version_id_fkey"
            columns: ["document_version_id"]
            isOneToOne: false
            referencedRelation: "legal_document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_legal_acceptances_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          activation_deferred: boolean
          buyer_snapshot: Json
          confirmation_email_sent_at: string | null
          created_at: string
          currency: string
          customer_type: string | null
          customer_type_statement: string | null
          customer_type_statement_version: string | null
          early_performance_requested: boolean
          early_performance_statement_text: string | null
          early_performance_statement_version: string | null
          fulfilled_at: string | null
          id: string
          net_cents: number | null
          order_number: string
          paid_at: string | null
          plan_code: Database["public"]["Enums"]["plan_code"]
          plan_version_id: string | null
          privacy_version_id: string | null
          public_activation_at: string | null
          seller_snapshot: Json
          service_ends_at: string | null
          service_starts_at: string | null
          site_id: string
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_hosted_invoice_url: string | null
          stripe_invoice_id: string | null
          stripe_invoice_pdf_url: string | null
          tax_cents: number | null
          terms_version_id: string | null
          total_cents: number
          user_id: string
          valid_until: string | null
          withdrawal_notice_version_id: string | null
        }
        Insert: {
          activation_deferred?: boolean
          buyer_snapshot: Json
          confirmation_email_sent_at?: string | null
          created_at?: string
          currency?: string
          customer_type?: string | null
          customer_type_statement?: string | null
          customer_type_statement_version?: string | null
          early_performance_requested?: boolean
          early_performance_statement_text?: string | null
          early_performance_statement_version?: string | null
          fulfilled_at?: string | null
          id?: string
          net_cents?: number | null
          order_number?: string
          paid_at?: string | null
          plan_code: Database["public"]["Enums"]["plan_code"]
          plan_version_id?: string | null
          privacy_version_id?: string | null
          public_activation_at?: string | null
          seller_snapshot: Json
          service_ends_at?: string | null
          service_starts_at?: string | null
          site_id: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_hosted_invoice_url?: string | null
          stripe_invoice_id?: string | null
          stripe_invoice_pdf_url?: string | null
          tax_cents?: number | null
          terms_version_id?: string | null
          total_cents: number
          user_id: string
          valid_until?: string | null
          withdrawal_notice_version_id?: string | null
        }
        Update: {
          activation_deferred?: boolean
          buyer_snapshot?: Json
          confirmation_email_sent_at?: string | null
          created_at?: string
          currency?: string
          customer_type?: string | null
          customer_type_statement?: string | null
          customer_type_statement_version?: string | null
          early_performance_requested?: boolean
          early_performance_statement_text?: string | null
          early_performance_statement_version?: string | null
          fulfilled_at?: string | null
          id?: string
          net_cents?: number | null
          order_number?: string
          paid_at?: string | null
          plan_code?: Database["public"]["Enums"]["plan_code"]
          plan_version_id?: string | null
          privacy_version_id?: string | null
          public_activation_at?: string | null
          seller_snapshot?: Json
          service_ends_at?: string | null
          service_starts_at?: string | null
          site_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_hosted_invoice_url?: string | null
          stripe_invoice_id?: string | null
          stripe_invoice_pdf_url?: string | null
          tax_cents?: number | null
          terms_version_id?: string | null
          total_cents?: number
          user_id?: string
          valid_until?: string | null
          withdrawal_notice_version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_plan_version_id_fkey"
            columns: ["plan_version_id"]
            isOneToOne: false
            referencedRelation: "plan_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_privacy_version_id_fkey"
            columns: ["privacy_version_id"]
            isOneToOne: false
            referencedRelation: "legal_document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_terms_version_id_fkey"
            columns: ["terms_version_id"]
            isOneToOne: false
            referencedRelation: "legal_document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_withdrawal_notice_version_id_fkey"
            columns: ["withdrawal_notice_version_id"]
            isOneToOne: false
            referencedRelation: "legal_document_versions"
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
      plan_versions: {
        Row: {
          created_at: string
          currency: string
          duration_rule: string
          effective_from: string
          effective_to: string | null
          features: Json
          id: string
          limits: Json
          plan_code: Database["public"]["Enums"]["plan_code"]
          price_cents: number
          service_ends_at: string
          support_summary: string
          tax_regime: string
          version: string
        }
        Insert: {
          created_at?: string
          currency?: string
          duration_rule?: string
          effective_from: string
          effective_to?: string | null
          features?: Json
          id?: string
          limits?: Json
          plan_code: Database["public"]["Enums"]["plan_code"]
          price_cents: number
          service_ends_at: string
          support_summary?: string
          tax_regime?: string
          version: string
        }
        Update: {
          created_at?: string
          currency?: string
          duration_rule?: string
          effective_from?: string
          effective_to?: string | null
          features?: Json
          id?: string
          limits?: Json
          plan_code?: Database["public"]["Enums"]["plan_code"]
          price_cents?: number
          service_ends_at?: string
          support_summary?: string
          tax_regime?: string
          version?: string
        }
        Relationships: []
      }
      political_ad_profiles: {
        Row: {
          ad_id: string
          amount_cents: number
          art_5_2_confirmed: boolean
          art_5_2_eligibility: string | null
          controlling_entity_address: string | null
          controlling_entity_email: string | null
          controlling_entity_name: string | null
          controlling_entity_settlement: string | null
          created_at: string
          data_truthful: boolean
          declaration_version: string
          declared_at: string
          declared_by: string
          election_date: string
          election_name: string
          election_official_url: string | null
          election_territory: string
          election_type: string
          finance_methodology: string
          funding_origin: string
          funding_source: string
          is_political_ad: boolean
          other_benefits: string | null
          payer_address: string | null
          payer_email: string | null
          payer_is_different: boolean
          payer_name: string | null
          payer_settlement: string | null
          publication_ends_on: string
          publication_starts_on: string
          signer_name: string
          site_id: string
          sponsor_address: string
          sponsor_country_code: string
          sponsor_email: string
          sponsor_name: string
          sponsor_registration_id: string | null
          sponsor_settlement: string
          sponsor_type: string
          updated_at: string
        }
        Insert: {
          ad_id?: string
          amount_cents: number
          art_5_2_confirmed?: boolean
          art_5_2_eligibility?: string | null
          controlling_entity_address?: string | null
          controlling_entity_email?: string | null
          controlling_entity_name?: string | null
          controlling_entity_settlement?: string | null
          created_at?: string
          data_truthful?: boolean
          declaration_version: string
          declared_at?: string
          declared_by: string
          election_date: string
          election_name: string
          election_official_url?: string | null
          election_territory: string
          election_type: string
          finance_methodology: string
          funding_origin: string
          funding_source: string
          is_political_ad?: boolean
          other_benefits?: string | null
          payer_address?: string | null
          payer_email?: string | null
          payer_is_different?: boolean
          payer_name?: string | null
          payer_settlement?: string | null
          publication_ends_on: string
          publication_starts_on: string
          signer_name: string
          site_id: string
          sponsor_address: string
          sponsor_country_code?: string
          sponsor_email: string
          sponsor_name: string
          sponsor_registration_id?: string | null
          sponsor_settlement: string
          sponsor_type: string
          updated_at?: string
        }
        Update: {
          ad_id?: string
          amount_cents?: number
          art_5_2_confirmed?: boolean
          art_5_2_eligibility?: string | null
          controlling_entity_address?: string | null
          controlling_entity_email?: string | null
          controlling_entity_name?: string | null
          controlling_entity_settlement?: string | null
          created_at?: string
          data_truthful?: boolean
          declaration_version?: string
          declared_at?: string
          declared_by?: string
          election_date?: string
          election_name?: string
          election_official_url?: string | null
          election_territory?: string
          election_type?: string
          finance_methodology?: string
          funding_origin?: string
          funding_source?: string
          is_political_ad?: boolean
          other_benefits?: string | null
          payer_address?: string | null
          payer_email?: string | null
          payer_is_different?: boolean
          payer_name?: string | null
          payer_settlement?: string | null
          publication_ends_on?: string
          publication_starts_on?: string
          signer_name?: string
          site_id?: string
          sponsor_address?: string
          sponsor_country_code?: string
          sponsor_email?: string
          sponsor_name?: string
          sponsor_registration_id?: string | null
          sponsor_settlement?: string
          sponsor_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "political_ad_profiles_declared_by_fkey"
            columns: ["declared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "political_ad_profiles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      political_ad_snapshots: {
        Row: {
          ad_id: string
          created_at: string
          created_by: string
          first_published_at: string
          id: string
          last_published_at: string
          notice_hash: string
          publication_hash: string
          publication_id: string
          publication_version: number
          repository_checked_at: string
          repository_payload: Json
          repository_payload_hash: string
          repository_public_url: string | null
          repository_source_url: string
          repository_status: string
          retained_until: string
          site_id: string
          transparency_data: Json
          transparency_hash: string
          transparency_version: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          created_by: string
          first_published_at: string
          id?: string
          last_published_at: string
          notice_hash: string
          publication_hash: string
          publication_id: string
          publication_version: number
          repository_checked_at: string
          repository_payload: Json
          repository_payload_hash: string
          repository_public_url?: string | null
          repository_source_url: string
          repository_status: string
          retained_until: string
          site_id: string
          transparency_data: Json
          transparency_hash: string
          transparency_version: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          created_by?: string
          first_published_at?: string
          id?: string
          last_published_at?: string
          notice_hash?: string
          publication_hash?: string
          publication_id?: string
          publication_version?: number
          repository_checked_at?: string
          repository_payload?: Json
          repository_payload_hash?: string
          repository_public_url?: string | null
          repository_source_url?: string
          repository_status?: string
          retained_until?: string
          site_id?: string
          transparency_data?: Json
          transparency_hash?: string
          transparency_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "political_ad_snapshots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "political_ad_snapshots_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: true
            referencedRelation: "site_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "political_ad_snapshots_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
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
      rate_limit_buckets: {
        Row: {
          bucket_key: string
          hit_count: number
          updated_at: string
          window_started_at: string
        }
        Insert: {
          bucket_key: string
          hit_count: number
          updated_at?: string
          window_started_at: string
        }
        Update: {
          bucket_key?: string
          hit_count?: number
          updated_at?: string
          window_started_at?: string
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
          posts: Json
          published_at: string
          published_by: string
          schema_version: number
          seo: Json
          site_id: string
          source_fingerprint: string
          source_revision: number
          theme: Json
          unpublished_at: string | null
          version_number: number
        }
        Insert: {
          content: Json
          id?: string
          media_manifest?: Json
          posts?: Json
          published_at?: string
          published_by: string
          schema_version?: number
          seo: Json
          site_id: string
          source_fingerprint?: string
          source_revision?: number
          theme: Json
          unpublished_at?: string | null
          version_number: number
        }
        Update: {
          content?: Json
          id?: string
          media_manifest?: Json
          posts?: Json
          published_at?: string
          published_by?: string
          schema_version?: number
          seo?: Json
          site_id?: string
          source_fingerprint?: string
          source_revision?: number
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
          admin_hold: boolean
          admin_hold_at: string | null
          admin_hold_by: string | null
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
          admin_hold?: boolean
          admin_hold_at?: string | null
          admin_hold_by?: string | null
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
          admin_hold?: boolean
          admin_hold_at?: string | null
          admin_hold_by?: string | null
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
            foreignKeyName: "sites_admin_hold_by_fkey"
            columns: ["admin_hold_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      withdrawal_requests: {
        Row: {
          channel: string
          confirmation_email_sent_at: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          order_id: string
          refund_amount_cents: number | null
          refund_currency: string | null
          refund_deadline_at: string | null
          refunded_at: string | null
          site_id: string
          statement_text: string
          status: string
          stripe_refund_id: string | null
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel: string
          confirmation_email_sent_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          order_id: string
          refund_amount_cents?: number | null
          refund_currency?: string | null
          refund_deadline_at?: string | null
          refunded_at?: string | null
          site_id: string
          statement_text: string
          status?: string
          stripe_refund_id?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          confirmation_email_sent_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          order_id?: string
          refund_amount_cents?: number | null
          refund_currency?: string | null
          refund_deadline_at?: string | null
          refunded_at?: string | null
          site_id?: string
          statement_text?: string
          status?: string
          stripe_refund_id?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          order_id: string
          token_hash: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          order_id: string
          token_hash: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          order_id?: string
          token_hash?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_tokens_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_deferred_orders: { Args: { p_limit?: number }; Returns: Json }
      admin_dashboard_metrics: { Args: never; Returns: Json }
      admin_decide_content_report: {
        Args: {
          p_decision: string
          p_decision_basis: string
          p_report_id: string
          p_reporter_notified: boolean
          p_sponsor_notified: boolean
          p_status: string
        }
        Returns: Json
      }
      admin_grant_site_plan: {
        Args: {
          p_plan_code: Database["public"]["Enums"]["plan_code"]
          p_reason: string
          p_site_id: string
        }
        Returns: Json
      }
      admin_search_users: {
        Args: { p_limit?: number; p_query?: string }
        Returns: {
          created_at: string
          email: string
          email_verified_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          site_count: number
        }[]
      }
      admin_set_site_hold: {
        Args: {
          p_candidate_message: string
          p_category: string
          p_duration_days: number
          p_hold: boolean
          p_reason: string
          p_scope: string
          p_site_id: string
        }
        Returns: Database["public"]["Enums"]["site_status"]
      }
      attach_custom_domain: {
        Args: { p_hostname: string; p_site_id: string }
        Returns: Json
      }
      consume_rate_limit: {
        Args: {
          p_bucket_key: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: boolean
      }
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
      fulfill_stripe_checkout: {
        Args: {
          p_amount_total: number
          p_currency: string
          p_customer_id: string
          p_event_type: string
          p_provider_event_id: string
          p_session_id: string
        }
        Returns: Json
      }
      has_plus_entitlement: { Args: { p_site_id: string }; Returns: boolean }
      has_publish_entitlement: { Args: { p_site_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      issue_email_verification_token: {
        Args: { p_token_hash: string; p_user_id: string }
        Returns: string
      }
      mark_checkout_session_status: {
        Args: {
          p_event_type: string
          p_provider_event_id: string
          p_session_id: string
          p_status: Database["public"]["Enums"]["order_status"]
        }
        Returns: Json
      }
      next_complaint_number: { Args: never; Returns: string }
      next_order_number: { Args: never; Returns: string }
      owns_site: { Args: { target_site_id: string }; Returns: boolean }
      publish_candidate_site: {
        Args: {
          p_content: Json
          p_media_manifest: Json
          p_posts: Json
          p_publication_id: string
          p_schema_version: number
          p_seo: Json
          p_site_id: string
          p_source_fingerprint: string
          p_source_revision: number
          p_theme: Json
        }
        Returns: Json
      }
      publish_candidate_site_compliant: {
        Args: {
          p_content: Json
          p_correlation_id: string
          p_media_manifest: Json
          p_notice_hash: string
          p_posts: Json
          p_publication_id: string
          p_repository_checked_at: string
          p_repository_source_url: string
          p_repository_status: string
          p_schema_version: number
          p_seo: Json
          p_site_id: string
          p_source_fingerprint: string
          p_source_revision: number
          p_theme: Json
        }
        Returns: Json
      }
      purge_expired_operational_data: { Args: never; Returns: Json }
      record_stripe_invoice: {
        Args: {
          p_customer_id: string
          p_event_type: string
          p_hosted_invoice_url: string
          p_invoice_id: string
          p_invoice_pdf_url: string
          p_order_id: string
          p_provider_event_id: string
        }
        Returns: Json
      }
      remove_custom_domain: { Args: { p_domain_id: string }; Returns: Json }
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
      resolve_active_custom_domain: {
        Args: { p_hostname: string }
        Returns: {
          site_id: string
          slug: string
        }[]
      }
      revoke_email_verification_token: {
        Args: { p_token_hash: string; p_user_id: string }
        Returns: undefined
      }
      set_candidate_site_visibility: {
        Args: { p_site_id: string; p_visible: boolean }
        Returns: Database["public"]["Enums"]["site_status"]
      }
      set_primary_domain: { Args: { p_domain_id: string }; Returns: Json }
      storage_object_site_id: { Args: { object_name: string }; Returns: string }
      sync_domain_provider_state: {
        Args: {
          p_domain_id: string
          p_make_primary?: boolean
          p_ssl_metadata: Json
          p_status: string
          p_verification_metadata: Json
          p_verified_at?: string
        }
        Returns: Json
      }
      update_site_section: {
        Args: {
          p_expected_revision: number
          p_payload: Json
          p_section_key: string
          p_site_id: string
        }
        Returns: Json
      }
      update_site_slug: {
        Args: { p_new_slug: string; p_site_id: string }
        Returns: Json
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

