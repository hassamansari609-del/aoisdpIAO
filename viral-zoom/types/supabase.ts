export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          role: 'admin' | 'seller' | 'buyer'
          whatsapp: string | null
          balance: number
          trust_score: number
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          role?: 'admin' | 'seller' | 'buyer'
          whatsapp?: string | null
          balance?: number
          trust_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          role?: 'admin' | 'seller' | 'buyer'
          whatsapp?: string | null
          balance?: number
          trust_score?: number
          created_at?: string
        }
      }
      catalog_services: {
        Row: {
          id: string
          name: string
          slug: string
          category: string
          logo_url: string | null
          description: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category: string
          logo_url?: string | null
          description?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category?: string
          logo_url?: string | null
          description?: string | null
          is_active?: boolean
        }
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          service_id: string | null
          custom_service_name: string | null
          title: string
          description: string | null
          price_per_slot: number
          original_price: number | null
          total_slots: number
          duration_days: number
          expiry_date: string | null
          credentials_vault: string | null
          proof_image_url: string | null
          status: 'pending_approval' | 'active' | 'rejected' | 'sold_out' | 'expired'
          admin_feedback: string | null
          is_trial: boolean
          upsell_listing_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          service_id?: string | null
          custom_service_name?: string | null
          title: string
          description?: string | null
          price_per_slot: number
          original_price?: number | null
          total_slots?: number
          duration_days: number
          expiry_date?: string | null
          credentials_vault?: string | null
          proof_image_url?: string | null
          status?: 'pending_approval' | 'active' | 'rejected' | 'sold_out' | 'expired'
          admin_feedback?: string | null
          is_trial?: boolean
          upsell_listing_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          service_id?: string | null
          custom_service_name?: string | null
          title?: string
          description?: string | null
          price_per_slot?: number
          original_price?: number | null
          total_slots?: number
          duration_days?: number
          expiry_date?: string | null
          credentials_vault?: string | null
          proof_image_url?: string | null
          status?: 'pending_approval' | 'active' | 'rejected' | 'sold_out' | 'expired'
          admin_feedback?: string | null
          is_trial?: boolean
          upsell_listing_id?: string | null
          created_at?: string
        }
      }
      slots: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string | null
          status: 'available' | 'reserved' | 'sold'
          access_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id?: string | null
          status?: 'available' | 'reserved' | 'sold'
          access_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          buyer_id?: string | null
          status?: 'available' | 'reserved' | 'sold'
          access_code?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          buyer_id: string | null
          slot_id: string | null
          amount: number
          status: 'pending_proof' | 'verification' | 'completed' | 'failed' | 'cancelled'
          payment_method_type: string | null
          payment_proof_url: string | null
          transaction_ref: string | null
          contact_info: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id?: string | null
          slot_id?: string | null
          amount: number
          status?: 'pending_proof' | 'verification' | 'completed' | 'failed' | 'cancelled'
          payment_method_type?: string | null
          payment_proof_url?: string | null
          transaction_ref?: string | null
          contact_info?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string | null
          slot_id?: string | null
          amount?: number
          status?: 'pending_proof' | 'verification' | 'completed' | 'failed' | 'cancelled'
          payment_method_type?: string | null
          payment_proof_url?: string | null
          transaction_ref?: string | null
          contact_info?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      ledger_entries: {
        Row: {
          id: string
          profile_id: string
          order_id: string | null
          amount: number
          entry_type: 'credit' | 'debit'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          order_id?: string | null
          amount: number
          entry_type: 'credit' | 'debit'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          order_id?: string | null
          amount?: number
          entry_type?: 'credit' | 'debit'
          description?: string | null
          created_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          title: string
          details: Json
          type: 'crypto' | 'bank' | 'wallet' | 'other'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          details: Json
          type?: 'crypto' | 'bank' | 'wallet' | 'other'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          details?: Json
          type?: 'crypto' | 'bank' | 'wallet' | 'other'
          is_active?: boolean
          created_at?: string
        }
      }
    }
  }
}
