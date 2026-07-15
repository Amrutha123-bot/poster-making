-- ─── Database Migration: Generation Stats ──────────────────────────────────
-- Track the count of AI image generation calls made per month.

CREATE TABLE IF NOT EXISTS public.generation_stats (
  id SERIAL PRIMARY KEY,
  month_year TEXT NOT NULL UNIQUE, -- format: "YYYY-MM"
  count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.generation_stats ENABLE ROW LEVEL SECURITY;

-- Policies for generation_stats
-- Allow authenticated users to view the current month's count
CREATE POLICY "Authenticated users can select stats"
  ON public.generation_stats FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role (admin) to modify statistics (no policy needed as service role bypasses RLS)
