/*
  # Create accounts, platforms, and time slots tables

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `name` (text) - Account name (ex: Monetec, CorpoFit)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `platforms`
      - `id` (uuid, primary key)
      - `name` (text) - Platform name (Instagram, TikTok)
      - `created_at` (timestamptz)
    
    - `account_platforms`
      - `id` (uuid, primary key)
      - `account_id` (uuid, foreign key to accounts)
      - `platform_id` (uuid, foreign key to platforms)
      - `created_at` (timestamptz)
      - Unique constraint on (account_id, platform_id)
    
    - `time_slots`
      - `id` (uuid, primary key)
      - `account_id` (uuid, foreign key to accounts)
      - `platform_id` (uuid, foreign key to platforms)
      - `slot_order` (integer) - Position 1, 2, or 3
      - `time` (text) - Time in HH:MM format
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - Unique constraint on (account_id, platform_id, slot_order)
    
    - `calendar_entries` (updated)
      - `id` (uuid, primary key)
      - `account_id` (uuid, foreign key to accounts)
      - `platform_id` (uuid, foreign key to platforms)
      - `date` (date)
      - `time_slot` (text) - Time in HH:MM format
      - `is_completed` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - Unique constraint on (account_id, platform_id, date, time_slot)
  
  2. Security
    - Enable RLS on all tables
    - All tables allow public read/write access
  
  3. Indexes
    - Add indexes for frequently queried columns
*/

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS account_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(account_id, platform_id)
);

CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  slot_order integer NOT NULL CHECK (slot_order >= 1 AND slot_order <= 3),
  time text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, platform_id, slot_order)
);

DROP TABLE IF EXISTS calendar_entries CASCADE;

CREATE TABLE IF NOT EXISTS calendar_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_slot text NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(account_id, platform_id, date, time_slot)
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view accounts"
  ON accounts FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert accounts"
  ON accounts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update accounts"
  ON accounts FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete accounts"
  ON accounts FOR DELETE TO public USING (true);

CREATE POLICY "Anyone can view platforms"
  ON platforms FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert platforms"
  ON platforms FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can view account_platforms"
  ON account_platforms FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert account_platforms"
  ON account_platforms FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can delete account_platforms"
  ON account_platforms FOR DELETE TO public USING (true);

CREATE POLICY "Anyone can view time_slots"
  ON time_slots FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert time_slots"
  ON time_slots FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update time_slots"
  ON time_slots FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete time_slots"
  ON time_slots FOR DELETE TO public USING (true);

CREATE POLICY "Anyone can view calendar_entries"
  ON calendar_entries FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert calendar_entries"
  ON calendar_entries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update calendar_entries"
  ON calendar_entries FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete calendar_entries"
  ON calendar_entries FOR DELETE TO public USING (true);

CREATE INDEX IF NOT EXISTS idx_accounts_name ON accounts(name);
CREATE INDEX IF NOT EXISTS idx_platforms_name ON platforms(name);
CREATE INDEX IF NOT EXISTS idx_account_platforms_account ON account_platforms(account_id);
CREATE INDEX IF NOT EXISTS idx_account_platforms_platform ON account_platforms(platform_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_account_platform ON time_slots(account_id, platform_id);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_account_platform ON calendar_entries(account_id, platform_id);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date ON calendar_entries(date);
