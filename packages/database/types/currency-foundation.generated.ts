// Generated from Supabase CLI public schema output. Do not hand-edit.
// Regenerate with scripts/generate-currency-foundation-types.mjs.
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CurrencyFoundationTables = {
  campaigns: {
    Row: {
      audience_filter: Json;
      channel: string;
      created_at: string;
      created_by: string | null;
      creator_donor_id: string;
      currency: string;
      current_amount: number;
      end_date: string | null;
      goal_amount: number;
      id: string;
      metadata: Json;
      missionary_id: string;
      scheduled_for: string | null;
      sent_at: string | null;
      share_url: string | null;
      slug: string | null;
      start_date: string | null;
      status: string;
      story: string | null;
      tenant_id: string;
      title: string;
      updated_at: string;
    };
    Insert: {
      audience_filter?: Json;
      channel?: string;
      created_at?: string;
      created_by?: string | null;
      creator_donor_id: string;
      currency?: string;
      current_amount?: number;
      end_date?: string | null;
      goal_amount?: number;
      id?: string;
      metadata?: Json;
      missionary_id: string;
      scheduled_for?: string | null;
      sent_at?: string | null;
      share_url?: string | null;
      slug?: string | null;
      start_date?: string | null;
      status?: string;
      story?: string | null;
      tenant_id: string;
      title: string;
      updated_at?: string;
    };
    Update: {
      audience_filter?: Json;
      channel?: string;
      created_at?: string;
      created_by?: string | null;
      creator_donor_id?: string;
      currency?: string;
      current_amount?: number;
      end_date?: string | null;
      goal_amount?: number;
      id?: string;
      metadata?: Json;
      missionary_id?: string;
      scheduled_for?: string | null;
      sent_at?: string | null;
      share_url?: string | null;
      slug?: string | null;
      start_date?: string | null;
      status?: string;
      story?: string | null;
      tenant_id?: string;
      title?: string;
      updated_at?: string;
    };
    Relationships: [
      {
        foreignKeyName: "campaigns_created_by_fkey";
        columns: ["created_by"];
        isOneToOne: false;
        referencedRelation: "profiles";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "campaigns_creator_donor_id_fkey";
        columns: ["creator_donor_id"];
        isOneToOne: false;
        referencedRelation: "donors";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "campaigns_currency_iso_fkey";
        columns: ["currency"];
        isOneToOne: false;
        referencedRelation: "currency_metadata";
        referencedColumns: ["code"];
      },
      {
        foreignKeyName: "campaigns_missionary_id_fkey";
        columns: ["missionary_id"];
        isOneToOne: false;
        referencedRelation: "missionaries";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "campaigns_tenant_id_fkey";
        columns: ["tenant_id"];
        isOneToOne: false;
        referencedRelation: "tenants";
        referencedColumns: ["id"];
      },
    ];
  };
  currency_metadata: {
    Row: {
      code: string;
      exponent: number;
      stripe_charge_exponent: number;
      stripe_charge_multiple: number;
      stripe_payout_exponent: number;
      stripe_payout_multiple: number;
    };
    Insert: {
      code: string;
      exponent: number;
      stripe_charge_exponent: number;
      stripe_charge_multiple: number;
      stripe_payout_exponent: number;
      stripe_payout_multiple: number;
    };
    Update: {
      code?: string;
      exponent?: number;
      stripe_charge_exponent?: number;
      stripe_charge_multiple?: number;
      stripe_payout_exponent?: number;
      stripe_payout_multiple?: number;
    };
    Relationships: [];
  };
  currency_rate_snapshots: {
    Row: {
      exchange_rate: number | null;
      fee_minor: number | null;
      id: string;
      net_minor: number | null;
      observed_at: string | null;
      presentment_amount_minor: number | null;
      presentment_currency: string | null;
      provider_balance_transaction_id: string | null;
      provider_evidence_id: string | null;
      settled_amount_minor: number | null;
      settlement_currency: string | null;
      tenant_id: string | null;
    };
    Insert: {
      exchange_rate?: number | null;
      fee_minor?: number | null;
      id?: string;
      net_minor?: number | null;
      observed_at?: string | null;
      presentment_amount_minor?: number | null;
      presentment_currency?: string | null;
      provider_balance_transaction_id?: string | null;
      provider_evidence_id?: string | null;
      settled_amount_minor?: number | null;
      settlement_currency?: string | null;
      tenant_id?: string | null;
    };
    Update: {
      exchange_rate?: number | null;
      fee_minor?: number | null;
      id?: string;
      net_minor?: number | null;
      observed_at?: string | null;
      presentment_amount_minor?: number | null;
      presentment_currency?: string | null;
      provider_balance_transaction_id?: string | null;
      provider_evidence_id?: string | null;
      settled_amount_minor?: number | null;
      settlement_currency?: string | null;
      tenant_id?: string | null;
    };
    Relationships: [
      {
        foreignKeyName: "currency_rate_snapshots_presentment_currency_fkey";
        columns: ["presentment_currency"];
        isOneToOne: false;
        referencedRelation: "currency_metadata";
        referencedColumns: ["code"];
      },
      {
        foreignKeyName: "currency_rate_snapshots_settlement_currency_fkey";
        columns: ["settlement_currency"];
        isOneToOne: false;
        referencedRelation: "currency_metadata";
        referencedColumns: ["code"];
      },
      {
        foreignKeyName: "currency_rate_snapshots_tenant_id_fkey";
        columns: ["tenant_id"];
        isOneToOne: false;
        referencedRelation: "tenants";
        referencedColumns: ["id"];
      },
    ];
  };
};

export type CurrencyMetadataRow =
  CurrencyFoundationTables["currency_metadata"]["Row"];
export type CurrencyRateSnapshotRow =
  CurrencyFoundationTables["currency_rate_snapshots"]["Row"];
