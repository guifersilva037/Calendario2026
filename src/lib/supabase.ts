import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Account {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: string;
  name: string;
  created_at: string;
}

export interface AccountPlatform {
  id: string;
  account_id: string;
  platform_id: string;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  account_id: string;
  platform_id: string;
  slot_order: number;
  time: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarEntry {
  id: string;
  account_id: string;
  platform_id: string;
  date: string;
  time_slot: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}
