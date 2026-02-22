/*
  # Create calendar entries table

  1. New Tables
    - `calendar_entries`
      - `id` (uuid, primary key) - Unique identifier for each entry
      - `date` (date) - The date of the entry
      - `time_slot` (text) - Time slot (07:00, 12:00, or 18:00)
      - `is_completed` (boolean) - Whether the task is completed
      - `created_at` (timestamptz) - When the entry was created
      - `updated_at` (timestamptz) - When the entry was last updated
  
  2. Security
    - Enable RLS on `calendar_entries` table
    - Add policy for public access (anyone can read/write)
  
  3. Indexes
    - Add unique constraint on (date, time_slot) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS calendar_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time_slot text NOT NULL CHECK (time_slot IN ('07:00', '12:00', '18:00')),
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(date, time_slot)
);

ALTER TABLE calendar_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view calendar entries"
  ON calendar_entries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert calendar entries"
  ON calendar_entries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update calendar entries"
  ON calendar_entries FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete calendar entries"
  ON calendar_entries FOR DELETE
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_calendar_entries_date ON calendar_entries(date);
CREATE INDEX IF NOT EXISTS idx_calendar_entries_date_time ON calendar_entries(date, time_slot);