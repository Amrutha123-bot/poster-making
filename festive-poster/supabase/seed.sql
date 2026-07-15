-- ─── Database Seed: Occasions & Templates ───────────────────────────────────
-- Run this in your Supabase SQL editor to populate templates and occasions.

-- 1. Insert Occasions
INSERT INTO public.occasions (id, name, slug, active_months, color_palette, motif_set, sample_greeting_copy) VALUES
(
  'a3a89047-920f-48d6-96a6-f18c21345422',
  'Diwali',
  'diwali',
  '{10,11}',
  '["#FF9933", "#FFCC00", "#800020", "#3E1B0F"]'::jsonb,
  '{"hanging-diya", "sparklers", "mandala"}',
  '[
    {"title": "Happy Diwali", "message": "May the light of the diyas guide you on the path of happiness and success. Wishing you and your family a very happy and prosperous Diwali!"},
    {"title": "Shubh Deepavali", "message": "Wishing you a Diwali filled with sweet moments, bright memories, and endless joy. Have a safe and blessed celebration!"}
  ]'::jsonb
),
(
  'b7d938b8-4c9f-4311-bf3a-e8f0a0d6cb25',
  'Christmas',
  'christmas',
  '{12}',
  '["#D32F2F", "#388E3C", "#FFFFFF", "#112233"]'::jsonb,
  '{"snowflake", "hanging-bells", "christmas-tree"}',
  '[
    {"title": "Merry Christmas", "message": "May your holidays be filled with warmth, laughter, and the love of family. Wishing you a season of peace and joy!"},
    {"title": "Season Greetings", "message": "Wishing you a wonderful Christmas and a prosperous New Year. Thank you for your continued partnership and trust."}
  ]'::jsonb
),
(
  'c625890e-b873-4ea2-9f37-124b89e34e56',
  'Ramzan Eid',
  'eid',
  '{3,4,5}',
  '["#005F4B", "#C5A059", "#003A2F", "#F5F5DC"]'::jsonb,
  '{"crescent-moon", "mosque-minaret", "stars"}',
  '[
    {"title": "Eid Mubarak", "message": "May the blessings of Allah fill your life with happiness, success, and peace. Wishing you and your loved ones a beautiful Eid celebration!"},
    {"title": "Happy Eid-ul-Fitr", "message": "Sending you warm wishes on Eid. May this festive occasion bring abundance, harmony, and joy to your business and home."}
  ]'::jsonb
),
(
  'd4e8b394-0cf9-42b7-849c-d2c6e6b8f362',
  'Holi',
  'holi',
  '{3}',
  '["#FF1493", "#00BFFF", "#32CD32", "#FF8C00", "#8A2BE2"]'::jsonb,
  '{"color-splash", "water-gun", "gulal-bowls"}',
  '[
    {"title": "Happy Holi", "message": "May your life be painted with the vibrant colors of joy, success, and prosperity. Wishing you a color-filled and joyful Holi!"},
    {"title": "Holi Hai!", "message": "Wishing you and your family a safe, colorful, and fun-filled Holi. May this festival mark the beginning of bright and positive endeavors!"}
  ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  active_months = EXCLUDED.active_months,
  color_palette = EXCLUDED.color_palette,
  motif_set = EXCLUDED.motif_set,
  sample_greeting_copy = EXCLUDED.sample_greeting_copy;

-- 2. Insert Templates with Normalized layoutJson skeletons
-- All x, y, width, height, and font sizes are normalized (0 to 1) relative to canvas size.

-- Diwali Template 1: Classic Mandala
INSERT INTO public.templates (id, occasion_id, name, preview_image_url, layout_json, illustration_asset_url) VALUES
(
  'e2b4f91d-728b-4b6c-8c1d-15f0d9c4b8b6',
  'a3a89047-920f-48d6-96a6-f18c21345422',
  'Classic Mandala Gold',
  NULL,
  '{
    "version": 1,
    "background": {
      "type": "gradient",
      "gradient": { "from": "#3E1B0F", "to": "#1D0C07", "angle": 45 }
    },
    "elements": [
      { "type": "logo", "x": 0.5, "y": 0.08, "width": 0.18, "height": 0.08, "anchor": "center" },
      { "type": "tagline", "x": 0.5, "y": 0.14, "fontSize": 0.016, "fontFamily": "Inter", "fill": "#A89EC2", "anchor": "center" },
      { "type": "title", "x": 0.5, "y": 0.26, "fontSize": 0.065, "fontFamily": "Playfair Display", "fill": "#FFCC00", "stroke": "#D4AF37", "strokeWidth": 1, "anchor": "center" },
      { "type": "message", "x": 0.5, "y": 0.38, "fontSize": 0.024, "fontFamily": "Inter", "fill": "#F5F5DC", "anchor": "center", "lineHeight": 1.6 },
      { "type": "illustration", "x": 0.5, "y": 0.65, "width": 0.45, "height": 0.35, "anchor": "center" },
      { "type": "footer", "x": 0.5, "y": 0.94, "fontSize": 0.018, "fill": "#FFCC00", "anchor": "center", "fields": ["website", "email", "phone"] }
    ],
    "decorations": [
      { "type": "motif", "position": "top-left", "asset": "hanging-diya", "opacity": 0.8, "width": 0.15, "height": 0.2 },
      { "type": "motif", "position": "top-right", "asset": "hanging-diya", "opacity": 0.8, "width": 0.15, "height": 0.2 }
    ]
  }'::jsonb,
  'mandala.png'
),
-- Diwali Template 2: Minimalist Sparklers
(
  'f3c4a02e-839c-4d7d-9d2e-26a1e8d5c9c7',
  'a3a89047-920f-48d6-96a6-f18c21345422',
  'Midnight Sparkler',
  NULL,
  '{
    "version": 1,
    "background": {
      "type": "solid",
      "color": "#0C0714"
    },
    "elements": [
      { "type": "logo", "x": 0.12, "y": 0.08, "width": 0.15, "height": 0.06, "anchor": "left" },
      { "type": "title", "x": 0.5, "y": 0.25, "fontSize": 0.07, "fontFamily": "Playfair Display", "fill": "#FF9933", "anchor": "center" },
      { "type": "message", "x": 0.5, "y": 0.36, "fontSize": 0.026, "fontFamily": "Inter", "fill": "#FFFFFF", "anchor": "center", "lineHeight": 1.5 },
      { "type": "illustration", "x": 0.5, "y": 0.68, "width": 0.55, "height": 0.4, "anchor": "center" },
      { "type": "footer", "x": 0.5, "y": 0.95, "fontSize": 0.016, "fill": "#A89EC2", "anchor": "center", "fields": ["website", "phone"] }
    ]
  }'::jsonb,
  'sparkler.png'
),
-- Christmas Template 1: Holiday Snowfall
(
  'c2e4f01d-938b-4c5c-9c1d-15f0d9c4b8b6',
  'b7d938b8-4c9f-4311-bf3a-e8f0a0d6cb25',
  'Nordic Pine Christmas',
  NULL,
  '{
    "version": 1,
    "background": {
      "type": "gradient",
      "gradient": { "from": "#0F2027", "to": "#203A43", "angle": 90 }
    },
    "elements": [
      { "type": "logo", "x": 0.5, "y": 0.08, "width": 0.16, "height": 0.07, "anchor": "center" },
      { "type": "title", "x": 0.5, "y": 0.24, "fontSize": 0.075, "fontFamily": "Playfair Display", "fill": "#FFFFFF", "anchor": "center" },
      { "type": "message", "x": 0.5, "y": 0.35, "fontSize": 0.025, "fontFamily": "Inter", "fill": "#E2E8F0", "anchor": "center", "lineHeight": 1.5 },
      { "type": "illustration", "x": 0.5, "y": 0.65, "width": 0.4, "height": 0.4, "anchor": "center" },
      { "type": "footer", "x": 0.5, "y": 0.94, "fontSize": 0.018, "fill": "#A0AEC0", "anchor": "center", "fields": ["website", "email", "phone"] }
    ],
    "decorations": [
      { "type": "motif", "position": "top-left", "asset": "snowflake", "opacity": 0.6, "width": 0.1, "height": 0.1 },
      { "type": "motif", "position": "top-right", "asset": "snowflake", "opacity": 0.6, "width": 0.1, "height": 0.1 }
    ]
  }'::jsonb,
  'christmas-tree.png'
),
-- Eid Template 1: Emerald Crescent
(
  'e6f0892c-c825-4ea2-9f37-124b89e34e56',
  'c625890e-b873-4ea2-9f37-124b89e34e56',
  'Emerald Minaret',
  NULL,
  '{
    "version": 1,
    "background": {
      "type": "gradient",
      "gradient": { "from": "#003A2F", "to": "#001D17", "angle": 135 }
    },
    "elements": [
      { "type": "logo", "x": 0.5, "y": 0.08, "width": 0.18, "height": 0.07, "anchor": "center" },
      { "type": "tagline", "x": 0.5, "y": 0.14, "fontSize": 0.016, "fontFamily": "Inter", "fill": "#C5A059", "anchor": "center" },
      { "type": "title", "x": 0.5, "y": 0.26, "fontSize": 0.07, "fontFamily": "Playfair Display", "fill": "#C5A059", "anchor": "center" },
      { "type": "message", "x": 0.5, "y": 0.38, "fontSize": 0.024, "fontFamily": "Inter", "fill": "#FFFFFF", "anchor": "center", "lineHeight": 1.6 },
      { "type": "illustration", "x": 0.5, "y": 0.66, "width": 0.45, "height": 0.38, "anchor": "center" },
      { "type": "footer", "x": 0.5, "y": 0.94, "fontSize": 0.018, "fill": "#C5A059", "anchor": "center", "fields": ["website", "email", "phone"] }
    ]
  }'::jsonb,
  'crescent.png'
),
-- Holi Template 1: Splashes of Joy
(
  'e3e4f9b8-d2cf-42b7-849c-d2c6e6b8f362',
  'd4e8b394-0cf9-42b7-849c-d2c6e6b8f362',
  'Splash of Color',
  NULL,
  '{
    "version": 1,
    "background": {
      "type": "solid",
      "color": "#FAF9F6"
    },
    "elements": [
      { "type": "logo", "x": 0.5, "y": 0.08, "width": 0.18, "height": 0.07, "anchor": "center" },
      { "type": "title", "x": 0.5, "y": 0.22, "fontSize": 0.08, "fontFamily": "Playfair Display", "fill": "#FF1493", "anchor": "center" },
      { "type": "message", "x": 0.5, "y": 0.34, "fontSize": 0.025, "fontFamily": "Inter", "fill": "#333333", "anchor": "center", "lineHeight": 1.5 },
      { "type": "illustration", "x": 0.5, "y": 0.65, "width": 0.5, "height": 0.4, "anchor": "center" },
      { "type": "footer", "x": 0.5, "y": 0.94, "fontSize": 0.018, "fill": "#666666", "anchor": "center", "fields": ["website", "email", "phone"] }
    ]
  }'::jsonb,
  'colors.png'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  layout_json = EXCLUDED.layout_json,
  illustration_asset_url = EXCLUDED.illustration_asset_url;
