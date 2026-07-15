-- ─── Database Migration: Initial Schema ───────────────────────────────────────
-- Run this in your Supabase SQL editor.

-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  short_description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  brand_colors JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create Occasions Table (Global, Read-Only for Users)
CREATE TABLE IF NOT EXISTS public.occasions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  active_months INTEGER[] DEFAULT '{}'::INTEGER[],
  color_palette JSONB DEFAULT '[]'::jsonb,
  motif_set TEXT[] DEFAULT '{}'::TEXT[],
  sample_greeting_copy JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create Templates Table (Global, Read-Only for Users)
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  occasion_id UUID REFERENCES public.occasions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  preview_image_url TEXT,
  layout_json JSONB NOT NULL,
  illustration_asset_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create Posters Table (User Created)
CREATE TABLE IF NOT EXISTS public.posters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE NOT NULL,
  occasion_id UUID REFERENCES public.occasions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  customizations JSONB DEFAULT '{}'::jsonb,
  generated_image_url TEXT,
  size_variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Companies
CREATE POLICY "Users can view their own company profile"
  ON public.companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own company profile"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company profile"
  ON public.companies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. RLS Policies for Occasions (Public Select, Admin Write/Edit)
CREATE POLICY "Anyone can view occasions"
  ON public.occasions FOR SELECT
  TO authenticated, anon
  USING (true);

-- 8. RLS Policies for Templates (Public Select, Admin Write/Edit)
CREATE POLICY "Anyone can view templates"
  ON public.templates FOR SELECT
  TO authenticated, anon
  USING (true);

-- 9. RLS Policies for Posters (Scoped by Company access)
CREATE POLICY "Users can view posters belonging to their company"
  ON public.posters FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create posters for their company"
  ON public.posters FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update posters for their company"
  ON public.posters FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete posters for their company"
  ON public.posters FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- 10. Storage Buckets and Policies (Execute if bucket features are available)
-- Note: Supabase Storage Buckets are configured through SQL in storage.buckets / storage.objects if wanted,
-- but usually setup in the Supabase UI. Here are SQL policies to enable storage.

-- Create storage buckets if needed:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT (id) DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('illustrations', 'illustrations', true) ON CONFLICT (id) DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('generated-posters', 'generated-posters', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies can be created as follows:
-- (For simplicity, users can create 'logos', 'illustrations', and 'generated-posters' buckets in UI and set public access,
-- or use these standard policies):

-- SELECT policies:
-- CREATE POLICY "Logos are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
-- CREATE POLICY "Templates are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'illustrations');
-- CREATE POLICY "Generated posters are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'generated-posters');

-- INSERT/UPDATE/DELETE policies:
-- CREATE POLICY "Users can manage their own logos" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Users can manage their own generated posters" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'generated-posters' AND (storage.foldername(name))[1] = auth.uid()::text);
