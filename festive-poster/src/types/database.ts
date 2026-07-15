// ─── Database Types ──────────────────────────────────────────────────────────
// TypeScript types matching the Supabase Postgres schema

export interface Company {
  id: string;
  user_id: string;
  name: string;
  tagline: string | null;
  short_description: string | null;
  logo_url: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  brand_colors: string[];
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  active_months: number[];
  color_palette: string[];
  motif_set: string[];
  sample_greeting_copy: GreetingCopy[];
  created_at: string;
}

export interface GreetingCopy {
  title: string;
  message: string;
  language?: string;
}

export interface Template {
  id: string;
  occasion_id: string;
  name: string;
  preview_image_url: string | null;
  layout_json: LayoutJson;
  illustration_asset_url: string | null;
  created_at: string;
}

export interface Poster {
  id: string;
  company_id: string;
  template_id: string;
  occasion_id: string;
  title: string;
  message: string | null;
  customizations: PosterCustomizations;
  generated_image_url: string | null;
  size_variants: SizeVariant[];
  created_at: string;
}

// ─── Layout JSON Schema ─────────────────────────────────────────────────────

export interface LayoutJson {
  version: number;
  background: LayoutBackground;
  elements: LayoutElement[];
  decorations?: LayoutDecoration[];
}

export interface LayoutBackground {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: { from: string; to: string; angle?: number };
  imageUrl?: string;
}

export type LayoutElementType = 'logo' | 'tagline' | 'title' | 'message' | 'illustration' | 'footer';

export interface LayoutElement {
  type: LayoutElementType;
  x: number; // 0–1 normalized
  y: number; // 0–1 normalized
  width?: number;
  height?: number;
  fontSize?: number; // normalized
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  anchor?: 'center' | 'left' | 'right';
  lineHeight?: number;
  fields?: string[]; // for footer: which contact fields to show
}

export interface LayoutDecoration {
  type: 'motif';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center';
  asset: string;
  opacity?: number;
  width?: number;
  height?: number;
}

// ─── Poster Customizations ──────────────────────────────────────────────────

export interface PosterCustomizations {
  colorOverrides?: Record<string, string>;
  visibleContactFields?: string[];
  logoScale?: number;
  logo?: {
    scale?: number;
    x?: number;
    y?: number;
  };
  tagline?: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    x?: number;
    y?: number;
  };
  title?: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    x?: number;
    y?: number;
  };
  message?: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    x?: number;
    y?: number;
  };
  footer?: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    x?: number;
    y?: number;
  };
}

export interface SizeVariant {
  name: string;
  width: number;
  height: number;
  url?: string;
}

// ─── Size Presets ────────────────────────────────────────────────────────────

export const SIZE_PRESETS: SizeVariant[] = [
  { name: 'Square Post', width: 1080, height: 1080 },
  { name: 'Story', width: 1080, height: 1920 },
  { name: 'Landscape', width: 1920, height: 1080 },
];

// ─── Company Form Data ──────────────────────────────────────────────────────

export interface CompanyFormData {
  name: string;
  tagline: string;
  short_description: string;
  website: string;
  email: string;
  phone: string;
  brand_colors: string[];
}
