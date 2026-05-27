import { createClient } from '@supabase/supabase-js';

const url  = (import.meta as any).env.VITE_SUPABASE_URL  as string;
const anon = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anon);

export type Plan = 'free' | 'pro';

export interface UserUsage {
  user_id: string;
  plan: Plan;
  analyses_this_month: number;
  reset_at: string;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  company_url: string;
  company_name: string | null;
  icp: string | null;
  result: Record<string, any>;
  created_at: string;
}
