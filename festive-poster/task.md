# FestivePoster — Tasks

## Phase 1 — Scaffold + Auth + Company Profile [COMPLETED]

### Scaffold
- [x] Initialize Next.js project with TypeScript + Tailwind
- [x] Install dependencies (Supabase SSR, Konva, react-konva)
- [x] Set up `.env.local` with placeholder Supabase keys
- [x] Configure Tailwind theme with festive design tokens
- [x] Create root layout with Google Fonts + globals.css

### Supabase Integration
- [x] Create browser client utility (`lib/supabase/client.ts`)
- [x] Create server client utility (`lib/supabase/server.ts`)
- [x] Create middleware session refresh helper
- [x] Set up Next.js middleware for auth protection
- [x] Write database migration SQL (all tables + RLS + storage)

### Auth Pages
- [x] Build login page with premium glassmorphism design
- [x] Build signup page matching login aesthetic
- [x] Create auth callback route handler

### Dashboard Shell
- [x] Build authenticated dashboard layout (sidebar + topbar)
- [x] Create sidebar component with nav links
- [x] Create topbar with user menu + logout

### Company Profile
- [x] Build company profile form page
- [x] Create reusable UI components (button, input, card)
- [x] Build logo drag-and-drop uploader component
- [x] Build brand color picker component
- [x] Create server actions for profile CRUD + logo upload
- [x] Create TypeScript types for database models

### Verification
- [x] `npm run build` passes
- [x] `npm run dev` starts without errors
- [x] Auth flow works end-to-end

---

## Phase 2 — Occasion & Template Data [COMPLETED]
- [x] Create seed data SQL script for default occasions (Diwali, Christmas, Ramzan/Eid, Holi)
- [x] Create seed data SQL script for default templates with layoutJson skeletons
- [x] Build `/occasions` gallery page
- [x] Build `/templates` picker page
- [x] Implement database query functions to fetch occasions and templates

---

## Phase 3 — Illustration Asset Library [COMPLETED]
- [x] Source or create SVG illustrations for the initial 4 occasions (Diwali mandala, Christmas tree, Eid crescent, Holi colors)
- [x] Set up local static asset directories for public serving (`public/illustrations/`)
- [x] Save SVG vector images locally
- [x] Link and verify templates display the correct graphic design backgrounds in picker previews

---

## Phase 4 — Compositing Engine [COMPLETED]
- [x] Implement the Konva Canvas template generator helper that takes the template `layoutJson` + user details + text parameters and draws onto the canvas
- [x] Build layout scale functions to dynamically adjust text size and logo placement relative to output dimensions
- [x] Handle CORS / image loading for company logo from Supabase Storage

---

## Phase 5 — Poster Editor UI [COMPLETED]
- [x] Create `/editor` route page fetching template and company profile
- [x] Build side controls panel for text customization, brand color overrides, and logo scales
- [x] Handle responsive canvas container resizing logic

---

## Phase 6 — Export [COMPLETED]
- [x] Multi-size export (Square Post, Story, Landscape)
- [x] Pixel-ratio-adjusted canvas downloads (PNG/JPG format support)

---

## Phase 7 — History Dashboard [PENDING]
- [ ] Create `/history` dashboard gallery page displaying past posters
- [ ] Build server actions to save generated posters database records
- [ ] Store exported poster images in public Supabase storage bucket `generated-posters`
- [ ] Enable poster re-edit redirects from history entries
