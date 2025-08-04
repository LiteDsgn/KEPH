-- Reports Data SQL
-- This file contains SQL for setting up the reports table and sample data
-- Based on the current implementation in /src/app/reports/page.tsx

-- First, let's ensure we have the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for tone_profile
CREATE TYPE tone_profile AS ENUM ('professional', 'casual', 'motivational', 'analytical', 'reflective');

-- Drop existing reports table if it exists (be careful with this in production)
-- DROP TABLE IF EXISTS public.reports CASCADE;

-- Create the reports table (simplified based on actual usage)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tone_profile tone_profile NOT NULL DEFAULT 'professional',
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  filters JSONB DEFAULT '{}',
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_date_range ON public.reports(date_range_start, date_range_end);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);



-- Users can insert their own reports
CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- No sample data included - reports will be populated from actual user data

-- Create a function to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL ON public.reports TO authenticated;
-- GRANT ALL ON public.reports TO service_role;

-- Helpful queries for testing:

-- View all reports
-- SELECT id, title, tone_profile, date_range_start, date_range_end, created_at FROM public.reports ORDER BY created_at DESC;

-- Get user's reports
-- SELECT * FROM public.reports WHERE user_id = auth.uid() ORDER BY created_at DESC;

/*
Usage Instructions:
1. Run this SQL in your Supabase SQL editor or via psql to set up the reports table
2. The RLS policies ensure users can only access their own reports
3. The updated_at trigger automatically maintains timestamp accuracy
4. Reports will be populated from actual user data through the application

Note: This simplified schema matches the current implementation in:
- /src/app/reports/page.tsx (timeline interface)
- /src/components/keph/report-generator.tsx (form fields)
- /src/app/api/reports/route.ts (API endpoints)
*/