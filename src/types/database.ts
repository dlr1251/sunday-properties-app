// Database Type Definitions
// TypeScript interfaces for all database tables and relationships

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          role: 'registered' | 'verified' | 'agent' | 'lawyer' | 'admin' | 'super_admin' | 'visitor' | 'premium';
          verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
          email_confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          role?: 'registered' | 'verified' | 'agent' | 'lawyer' | 'admin' | 'super_admin' | 'visitor' | 'premium';
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
          email_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          role?: 'registered' | 'verified' | 'agent' | 'lawyer' | 'admin' | 'super_admin' | 'visitor' | 'premium';
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
          email_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          address: string;
          city: string;
          price: number | null;
          rent_monthly: number | null;
          listing_type: string | null;
          slug: string | null;
          nearby_places: Array<{
            id?: string;
            name: string;
            category: string;
            lat: number;
            lng: number;
            note?: string;
          }> | null;
          property_type: string;
          status: 'draft' | 'pending' | 'published' | 'inactive' | 'sold' | 'rejected';
          area: number;
          bedrooms: number;
          bathrooms: number;
          parking_spaces: number | null;
          year_built: number | null;
          strata_fee: number | null;
          coordinates: { lat: number; lng: number } | null;
          features: string[];
          negotiation_rules: any | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          address: string;
          city: string;
          price?: number | null;
          rent_monthly?: number | null;
          listing_type?: string | null;
          slug?: string | null;
          nearby_places?: Array<{
            id?: string;
            name: string;
            category: string;
            lat: number;
            lng: number;
            note?: string;
          }> | null;
          property_type: string;
          status?: 'draft' | 'pending' | 'published' | 'inactive' | 'sold' | 'rejected';
          area: number;
          bedrooms: number;
          bathrooms: number;
          parking_spaces?: number | null;
          year_built?: number | null;
          strata_fee?: number | null;
          coordinates?: { lat: number; lng: number } | null;
          features?: string[];
          negotiation_rules?: any | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          address?: string;
          city?: string;
          price?: number | null;
          rent_monthly?: number | null;
          listing_type?: string | null;
          slug?: string | null;
          nearby_places?: Array<{
            id?: string;
            name: string;
            category: string;
            lat: number;
            lng: number;
            note?: string;
          }> | null;
          property_type?: string;
          status?: 'draft' | 'pending' | 'published' | 'inactive' | 'sold' | 'rejected';
          area?: number;
          bedrooms?: number;
          bathrooms?: number;
          parking_spaces?: number | null;
          year_built?: number | null;
          strata_fee?: number | null;
          coordinates?: { lat: number; lng: number } | null;
          features?: string[];
          negotiation_rules?: any | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          property_id: string;
          buyer_id: string;
          offer_price: number;
          payment_method: string;
          closing_date: string;
          conditions: string | null;
          down_payment: number | null;
          financing_details: any | null;
          parent_offer_id: string | null;
          counter_message: string | null;
          status: 'pending' | 'accepted' | 'rejected' | 'not_selected' | 'countered' | 'cancelled';
          validity_days: number;
          calculated_npv: number | null;
          risk_adjusted_npv: number | null;
          npv_breakdown: any | null;
          npv_calculated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          buyer_id: string;
          offer_price: number;
          payment_method: string;
          closing_date: string;
          conditions?: string | null;
          down_payment?: number | null;
          financing_details?: any | null;
          parent_offer_id?: string | null;
          counter_message?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'not_selected' | 'countered' | 'cancelled';
          validity_days?: number;
          calculated_npv?: number | null;
          risk_adjusted_npv?: number | null;
          npv_breakdown?: any | null;
          npv_calculated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          buyer_id?: string;
          offer_price?: number;
          payment_method?: string;
          closing_date?: string;
          conditions?: string | null;
          down_payment?: number | null;
          financing_details?: any | null;
          parent_offer_id?: string | null;
          counter_message?: string | null;
          status?: 'pending' | 'accepted' | 'rejected' | 'not_selected' | 'countered' | 'cancelled';
          validity_days?: number;
          calculated_npv?: number | null;
          risk_adjusted_npv?: number | null;
          npv_breakdown?: any | null;
          npv_calculated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      offer_attachments: {
        Row: {
          id: string;
          offer_id: string;
          uploaded_by: string;
          file_url: string;
          file_name: string;
          file_type: string;
          file_size: number;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          uploaded_by: string;
          file_url: string;
          file_name: string;
          file_type: string;
          file_size: number;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          uploaded_by?: string;
          file_url?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          uploaded_at?: string;
        };
      };
      visits: {
        Row: {
          id: string;
          property_id: string;
          visitor_id: string;
          visitor_name: string;
          visitor_email: string;
          visitor_phone: string;
          scheduled_at: string;
          duration_minutes: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
          notes: string | null;
          seller_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          visitor_id: string;
          visitor_name: string;
          visitor_email: string;
          visitor_phone: string;
          scheduled_at: string;
          duration_minutes?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
          notes?: string | null;
          seller_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          visitor_id?: string;
          visitor_name?: string;
          visitor_email?: string;
          visitor_phone?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
          notes?: string | null;
          seller_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: string;
          title: string;
          message: string;
          data: any | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: string;
          title: string;
          message: string;
          data?: any | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          data?: any | null;
          read?: boolean;
          created_at?: string;
        };
      };
      verification_requests: {
        Row: {
          id: string;
          user_id: string;
          document_type: string;
          document_url: string;
          selfie_url: string;
          full_name: string;
          dob: string;
          nationality: string;
          phone: string;
          address: string;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          submitted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_type: string;
          document_url: string;
          selfie_url: string;
          full_name: string;
          dob: string;
          nationality: string;
          phone: string;
          address: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_type?: string;
          document_url?: string;
          selfie_url?: string;
          full_name?: string;
          dob?: string;
          nationality?: string;
          phone?: string;
          address?: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          offer_id: string;
          property_id: string;
          buyer_id: string;
          seller_id: string;
          final_price: number;
          closing_date: string;
          payment_method: string;
          conditions: string | null;
          contract_url: string | null;
          status: 'pending_signature' | 'signed' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
          signed_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          offer_id: string;
          property_id: string;
          buyer_id: string;
          seller_id: string;
          final_price: number;
          closing_date: string;
          payment_method: string;
          conditions?: string | null;
          contract_url?: string | null;
          status?: 'pending_signature' | 'signed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
          signed_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          offer_id?: string;
          property_id?: string;
          buyer_id?: string;
          seller_id?: string;
          final_price?: number;
          closing_date?: string;
          payment_method?: string;
          conditions?: string | null;
          contract_url?: string | null;
          status?: 'pending_signature' | 'signed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
          signed_at?: string | null;
          completed_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action_type: string;
          resource_type: string;
          resource_id: string;
          changes: any;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action_type: string;
          resource_type: string;
          resource_id: string;
          changes: any;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action_type?: string;
          resource_type?: string;
          resource_id?: string;
          changes?: any;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_property_id: string | null;
          report_type: string;
          description: string;
          evidence_urls: string[] | null;
          status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
          resolved_by: string | null;
          resolution_notes: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          reported_property_id?: string | null;
          report_type: string;
          description: string;
          evidence_urls?: string[] | null;
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
          resolved_by?: string | null;
          resolution_notes?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string | null;
          reported_property_id?: string | null;
          report_type?: string;
          description?: string;
          evidence_urls?: string[] | null;
          status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
          resolved_by?: string | null;
          resolution_notes?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
      };
      platform_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: any;
          updated_by: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value: any;
          updated_by: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          setting_key?: string;
          setting_value?: any;
          updated_by?: string;
          updated_at?: string;
        };
      };
      feature_flags: {
        Row: {
          id: string;
          flag_name: string;
          enabled_globally: boolean;
          enabled_for_users: string[];
          enabled_for_roles: string[];
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          flag_name: string;
          enabled_globally?: boolean;
          enabled_for_users?: string[];
          enabled_for_roles?: string[];
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          flag_name?: string;
          enabled_globally?: boolean;
          enabled_for_users?: string[];
          enabled_for_roles?: string[];
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      offer_conditions: {
        Row: {
          id: string;
          offer_id: string;
          parent_condition_id: string | null;
          condition_type: 'price' | 'payment_method' | 'closing_date' | 'delivery_date' | 'deed_signing_date' | 'notary_costs_distribution' | 'promesa_compraventa_terms' | 'inspection_contingency' | 'financing_contingency' | 'appraisal_contingency' | 'title_contingency' | 'repairs_required' | 'appliances_included' | 'custom';
          condition_key: string;
          condition_value: any;
          condition_display_text: string;
          status: 'proposed' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
          proposed_by: 'buyer' | 'seller' | 'agent' | 'lawyer';
          proposer_user_id: string | null;
          npv_impact: number | null;
          risk_impact: number | null;
          priority: number;
          notes: string | null;
          metadata: any;
          version: number;
          superseded_by: string | null;
          created_at: string;
          updated_at: string;
          accepted_at: string | null;
          rejected_at: string | null;
        };
        Insert: {
          id?: string;
          offer_id: string;
          parent_condition_id?: string | null;
          condition_type: 'price' | 'payment_method' | 'closing_date' | 'delivery_date' | 'deed_signing_date' | 'notary_costs_distribution' | 'promesa_compraventa_terms' | 'inspection_contingency' | 'financing_contingency' | 'appraisal_contingency' | 'title_contingency' | 'repairs_required' | 'appliances_included' | 'custom';
          condition_key: string;
          condition_value: any;
          condition_display_text: string;
          status?: 'proposed' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
          proposed_by: 'buyer' | 'seller' | 'agent' | 'lawyer';
          proposer_user_id?: string | null;
          npv_impact?: number | null;
          risk_impact?: number | null;
          priority?: number;
          notes?: string | null;
          metadata?: any;
          version?: number;
          superseded_by?: string | null;
          created_at?: string;
          updated_at?: string;
          accepted_at?: string | null;
          rejected_at?: string | null;
        };
        Update: {
          id?: string;
          offer_id?: string;
          parent_condition_id?: string | null;
          condition_type?: 'price' | 'payment_method' | 'closing_date' | 'delivery_date' | 'deed_signing_date' | 'notary_costs_distribution' | 'promesa_compraventa_terms' | 'inspection_contingency' | 'financing_contingency' | 'appraisal_contingency' | 'title_contingency' | 'repairs_required' | 'appliances_included' | 'custom';
          condition_key?: string;
          condition_value?: any;
          condition_display_text?: string;
          status?: 'proposed' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
          proposed_by?: 'buyer' | 'seller' | 'agent' | 'lawyer';
          proposer_user_id?: string | null;
          npv_impact?: number | null;
          risk_impact?: number | null;
          priority?: number;
          notes?: string | null;
          metadata?: any;
          version?: number;
          superseded_by?: string | null;
          created_at?: string;
          updated_at?: string;
          accepted_at?: string | null;
          rejected_at?: string | null;
        };
      };

      // Payment-related tables
      property_verifications: {
        Row: {
          id: string;
          property_id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          changes_requested: string | null;
          submitted_data: any;
          visit_availability_configured: boolean;
          submitted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'requires_changes';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          changes_requested?: string | null;
          submitted_data: any;
          visit_availability_configured?: boolean;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'requires_changes';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          changes_requested?: string | null;
          submitted_data?: any;
          visit_availability_configured?: boolean;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      close_negotiation_transaction: {
        Args: { p_offer_id: string; p_property_id: string; p_buyer_id: string; p_seller_id: string };
        Returns: any;
      };
      get_contract_details: {
        Args: { contract_id: string };
        Returns: any;
      };
      has_active_negotiations: {
        Args: { property_id: string };
        Returns: boolean;
      };
      get_audit_logs_with_users: {
        Args: { limit_count?: number; offset_count?: number; user_filter?: string; action_filter?: string; resource_filter?: string };
        Returns: {
          id: string;
          user_id: string | null;
          user_name: string;
          user_email: string;
          action_type: string;
          resource_type: string;
          resource_id: string;
          changes: any;
          created_at: string;
        }[];
      };
      get_audit_statistics: {
        Args: { days_back?: number };
        Returns: any;
      };
      get_property_feedback_stats: {
        Args: { property_id: string };
        Returns: any;
      };
      get_available_time_slots: {
        Args: { p_property_id: string; p_date: string };
        Returns: { time_slot: string; available: boolean }[];
      };
      is_feature_enabled: {
        Args: { p_flag_name: string; p_user_id: string | null };
        Returns: boolean;
      };
      add_user_to_feature_flag: {
        Args: { p_flag_name: string; p_user_id: string };
        Returns: boolean;
      };
      calculate_offer_npv: {
        Args: { p_offer_id: string; p_base_discount_rate?: number };
        Returns: {
          npv: number;
          adjusted_value: number;
          risk_adjusted_npv: number;
          breakdown: any;
        }[];
      };
      get_current_condition_version: {
        Args: { p_offer_id: string; p_condition_key: string };
        Returns: number;
      };
      get_condition_history: {
        Args: { p_offer_id: string; p_condition_key: string };
        Returns: {
          id: string;
          version: number;
          status: string;
          created_at: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Export commonly used types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type Offer = Database['public']['Tables']['offers']['Row'];
export type OfferAttachment = Database['public']['Tables']['offer_attachments']['Row'];
export type Visit = Database['public']['Tables']['visits']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type VerificationRequest = Database['public']['Tables']['verification_requests']['Row'];
export type Contract = Database['public']['Tables']['contracts']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type PlatformSetting = Database['public']['Tables']['platform_settings']['Row'];
export type FeatureFlag = Database['public']['Tables']['feature_flags']['Row'];
export type OfferCondition = Database['public']['Tables']['offer_conditions']['Row'];