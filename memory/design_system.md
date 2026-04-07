# RankLLMs — Design System Reference
> Handoff document for personal AI coding agents

---

## 1. Brand Identity

| Token | Value |
|---|---|
| Brand Name | RankLLMs |
| Logo Mark | Letter "R", gradient #f26e2a → #14b8a6, rounded-lg |
| Tagline | "The most comprehensive LLM benchmark platform" |

---

## 2. Color Palette

### Dark Theme (Leaderboard, Admin)

| Name | Hex | Usage |
|---|---|---|
| Background | `#1a1a1a` | Page background |
| Surface | `#222222` | Cards, panels |
| Surface Hover | `#2a2a2a` | Hover state for cards |
| Surface Deep | `#1e1e1e` | Table headers, nav |
| Border | `rgba(255,255,255,0.08)` | Card borders, dividers |
| Border Hover | `rgba(255,255,255,0.20)` | Hover borders |
| Text Primary | `#ffffff` | Headings, key data |
| Text Secondary | `#a1a1aa` | Body, labels |
| Text Subtle | `#71717a` | Metadata, muted |
| Text Disabled | `#52525b` | Disabled, rank numbers |
| Orange (Primary) | `#f26e2a` | CTAs, accents, active states |
| Orange Hover | `#d95a1e` | Orange hover state |
| Teal (Secondary) | `#14b8a6` | Model B in compare, speed data |
| Blue | `#3b82f6` | Info, chart bar 3 |
| Purple | `#8b5cf6` | Chart bar 4 |
| Pink | `#ec4899` | Chart bar 5 |
| Green | `#22c55e` | Score ≥ 90, published status |
| Yellow | `#eab308` | Score 65–79 |
| Red | `#f87171` | Delete actions, errors |
| Overlay | `rgba(0,0,0,0.7)` | Modal backdrop |

### Light Theme (Blog Pages)

| Name | Hex | Usage |
|---|---|---|
| Background | `#F8F7F4` | Page background |
| Surface | `#FFFFFF` | Cards |
| Surface Hover | `#F3F4F6` | Hover |
| Border | `rgba(0,0,0,0.07)` | Card borders |
| Text Primary | `#111827` | Headings |
| Text Secondary | `#6B7280` | Body, descriptions |
| Text Muted | `#9CA3AF` | Metadata, dates |
| Footer BG | `#111111` | Always dark footer |

### Provider Badge Colors

| Provider | Background | Text | Border |
|---|---|---|---|
| Anthropic | `rgba(204,120,92,0.15)` | `#cc785c` | `rgba(204,120,92,0.3)` |
| OpenAI | `rgba(16,163,127,0.15)` | `#10a37f` | `rgba(16,163,127,0.3)` |
| Google | `rgba(66,133,244,0.15)` | `#4285f4` | `rgba(66,133,244,0.3)` |
| Meta | `rgba(59,89,152,0.15)` | `#5b8dee` | `rgba(59,89,152,0.3)` |
| DeepSeek | `rgba(0,188,212,0.15)` | `#00bcd4` | `rgba(0,188,212,0.3)` |
| Mistral | `rgba(255,112,67,0.15)` | `#ff7043` | `rgba(255,112,67,0.3)` |
| xAI | `rgba(255,255,255,0.08)` | `#e4e4e7` | `rgba(255,255,255,0.15)` |

### Chart Bar Colors (sequential)
```
1st: #f26e2a  2nd: #14b8a6  3rd: #3b82f6  4th: #8b5cf6  5th: #ec4899
```

### Score Color Scale
- `≥ 90` → `#22c55e` (green)
- `80–89` → `#f26e2a` (orange)
- `65–79` → `#eab308` (yellow)
- `< 65` → `#71717a` (muted)

---

## 3. Typography

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Headings (H1) | Inter | 900 (Black) | clamp(2.5rem, 5vw, 3.5rem) | tracking-tight, line-height 1.05 |
| Headings (H2) | Inter | 700 (Bold) | 1.5rem | Section titles |
| Headings (H3) | Inter | 600 (Semibold) | 1.125rem | Card titles |
| Body | Inter | 400 | 1rem / 0.875rem | leading-relaxed |
| Small/Meta | Inter | 400–500 | 0.75rem–0.875rem | color: text-muted |
| Data/Numbers | JetBrains Mono | 400–500 | 0.75rem | tabular-nums, always |
| Labels/Badges | Inter | 600 | 0.6875rem | uppercase, tracking-wider |

**Google Fonts import:**
```
Inter: 400, 500, 600, 700, 800, 900
JetBrains Mono: 400, 500
```

---

## 4. Spacing System (8px grid)

| Token | Value | Tailwind |
|---|---|---|
| xs | 8px | p-2 / gap-2 |
| sm | 16px | p-4 / gap-4 |
| md | 24px | p-6 / gap-6 |
| lg | 32px | p-8 / gap-8 |
| xl | 48px | p-12 |
| 2xl | 64px | p-16 |
| Section gap | 80px | space-y-20 |

**Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

---

## 5. Components

### Card (Dark)
- Background: `#222`
- Border: `1px solid rgba(255,255,255,0.08)`
- Border-radius: `rounded-2xl` (16px)
- Padding: `p-5` or `p-6`
- Hover: `border-color → rgba(255,255,255,0.20)`, `translateY(-2px)`
- Transition: `all 200ms`

### Card (Light / Blog)
- Background: `#FFFFFF`
- Border: `1px solid rgba(0,0,0,0.07)`
- Border-radius: `rounded-2xl`
- Shadow: `0 1px 4px rgba(0,0,0,0.06)`
- Hover: `translateY(-2px)`, shadow increases

### Button (Primary / Orange)
- Background: `#f26e2a`
- Hover: `#d95a1e`
- Text: `#ffffff`, `font-semibold`
- Padding: `px-4 py-2` or `px-6 py-3`
- Border-radius: `rounded-xl` (12px)
- Transition: `background-color 150ms`

### Button (Secondary / Ghost)
- Background: `rgba(255,255,255,0.06)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Text: `#a1a1aa`
- Hover text: `#ffffff`
- Border-radius: `rounded-xl`

### Badge (Category Pill)
```
Dark:  background: rgba(242,110,42,0.1), color: #f26e2a, border: rgba(242,110,42,0.2)
Light: same colors but on white card
Radius: rounded-full
Padding: px-3 py-1
Font: text-xs font-semibold uppercase tracking-wider
```

### Input / Select (Dark)
- Background: `#2a2a2a`
- Border: `1px solid rgba(255,255,255,0.1)`
- Text: `#ffffff`
- Placeholder: `#52525b`
- Border-radius: `rounded-xl` (on large) or `rounded-lg` (on small)
- No outline on focus (use border change instead)

### Table
- Header bg: `#1e1e1e`
- Header text: `#71717a`, `text-xs uppercase tracking-wider`
- Header border: `1px solid rgba(255,255,255,0.08)` bottom
- Row even: transparent
- Row odd: `rgba(255,255,255,0.02)`
- Row hover: `rgba(255,255,255,0.05)`
- Row divider: `1px solid rgba(255,255,255,0.04)`
- Numbers: right-aligned, `font-mono`, `tabular-nums`
- Overflow: `overflow-x-auto` (horizontal scroll on mobile)

### Score Progress Bar
```
Track:  background: rgba(255,255,255,0.08), height: 6px, rounded-full
Fill:   color from score scale, same height, transition: all
Label:  right side, text-xs font-mono, colored per score
```

### Mini Bar Chart (Vertical, Top Models per Task)
```
Container height: 64px
Bar colors: sequential CHART_COLORS array
Scores shown above each bar (text-[9px], font-mono)
Model names below (text-[9px], truncated)
No axes, no grid lines
```

### Provider Badge
```
Shape: w-8 h-8 rounded-lg
Content: First letter of provider name, font-bold
Colors: per PROVIDER_BADGE_COLORS table above
Border: 1px solid (border color from table)
```

### Navbar
- Fixed, z-50
- Background: `rgba(26,26,26,0.95)` with `backdrop-blur-md`
- Border bottom: `rgba(255,255,255,0.08)`
- Height: `h-16` (64px)
- Active nav link: `bg-white/10 text-white`
- Inactive nav link: `text-[#a1a1aa] hover:text-white hover:bg-white/5`

### Footer
- Background: `#111111`
- Border top: `rgba(255,255,255,0.06)`
- 4 columns: PRODUCT, RESOURCES, COMPANY, LEGAL
- Column heading: `text-xs font-semibold tracking-wider color: #52525b uppercase`
- Links: `text-sm color: #a1a1aa hover: #ffffff`
- Bottom row: copyright + "Updated Feb 2026" orange badge

---

## 6. Page Layouts

### Leaderboard (Dark)
```
Background: #1a1a1a
├── Navbar (fixed, dark blur)
├── Hero Section
│   ├── Orange pill badge (top-left)
│   ├── H1 "LLM Leaderboard" (gradient text on "Leaderboard")
│   ├── Description paragraph
│   └── Border-bottom separating from content
├── Content (max-w-7xl, space-y-20, py-16)
│   ├── Top Models per Task (2x3 grid of mini bar charts)
│   ├── Fastest & Most Affordable (1x3 grid)
│   ├── Compare Models (2 selectors + side-by-side panels)
│   ├── Model Comparison Table (search + provider filter + sortable table)
│   └── Benchmark Glossary (2x3 grid of info cards)
└── Footer (dark)
```

### Blog Listing (Light)
```
Background: #F8F7F4
├── Navbar (fixed, dark)
├── Hero (centered, H1 + subtitle)
├── Sticky Category Filter Bar (#F8F7F4/95 blur, border-bottom)
├── Posts Grid (max-w-7xl, 3-column, gap-6)
├── Pagination
└── Footer (dark)
```

### Blog Detail (Light + SSR)
```
Background: #F8F7F4
├── Navbar
├── Article (max-w-3xl mx-auto, py-16)
│   ├── Back link
│   ├── Category badge + date
│   ├── H1 title (text-4xl sm:text-5xl, font-black)
│   ├── Excerpt (text-xl)
│   ├── Hero image (16:9 rounded-2xl)
│   ├── Author row
│   └── Content (.blog-content HTML)
└── Footer
```

### Admin (Dark)
```
Background: #1a1a1a
├── Navbar
├── Login Card (centered, if not authenticated)
└── Dashboard (if authenticated)
    ├── Header (title + logout button)
    ├── Tab switcher (Models | Blog Posts)
    └── CRUD Table + Add/Edit Modal
```

---

## 7. Gradient Usage

### Hero Title Gradient
```css
background: linear-gradient(90deg, #f26e2a, #14b8a6)
-webkit-background-clip: text
-webkit-text-fill-color: transparent
```
Applied to: "Leaderboard" word in H1

### Logo Gradient
```css
background: linear-gradient(135deg, #f26e2a, #14b8a6)
```
Applied to: Logo mark square

---

## 8. Animation & Transitions

| Element | Animation |
|---|---|
| Cards | `transition-all 200ms`, hover: `translateY(-2px)` |
| Buttons | `transition-colors 150ms` |
| Table rows | `transition-colors` on hover |
| Score bars | `transition: all 500ms` (fill animation on load) |
| Loading spinner | `animate-spin`, `border-t-transparent` |
| Blog card image | `transition-transform 300ms`, hover: `scale-105` |
| Category filter | `transition-all 150ms` |

---

## 9. Data Formatting

| Data Type | Format | Example |
|---|---|---|
| Context Window | `${n/1000}K` or `${n/1M}M` | 128K, 1M, 10M |
| Token Cost | `$${n.toFixed(3)}/1M` | $0.075/1M, $15.00 |
| Speed | `${n} t/s` | 200 t/s |
| Latency | `${n}s` | 1.2s |
| Score | `0–100 integer` | 96 |
| Date | `Jan 28, 2026` | toLocaleDateString 'en-US' |
| Read time | `${n} min read` | 8 min read |

---

## 10. Blog Content Styles (.blog-content class)

```
h2: font-size 1.5rem, font-weight 700, color #111827, margin-top 2rem
p:  color #374151, line-height 1.8, margin-bottom 1.25rem, font-size 1.0625rem  
strong: color #111827, font-weight 600
```

---

## 11. Scrollbar (Custom)
- Width: 6px
- Track: transparent
- Thumb: `rgba(255,255,255,0.15)`, border-radius 3px
- Thumb hover: `rgba(255,255,255,0.25)`

---

## 12. Key Data Models

### LLM Model
```
id, name, provider, slug, context_window, input_cost, output_cost,
speed (t/s), latency (s), release_date, description,
scores: { coding, reasoning, math, multilingual, visual, overall } (all 0–100)
```

### Blog Post
```
id, title, slug, excerpt, content (HTML), image_url,
category (Comparisons|News|Guides|LLM Basics),
author, read_time (min), published_at (YYYY-MM-DD), is_published
```

---

## 13. API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/models | No | All models sorted by overall |
| GET | /api/models/{slug} | No | Single model |
| POST | /api/admin/models | JWT | Create model |
| PUT | /api/admin/models/{id} | JWT | Update model |
| DELETE | /api/admin/models/{id} | JWT | Delete model |
| GET | /api/blog | No | Published posts (optional ?category=) |
| GET | /api/blog/{slug} | No | Single post |
| GET | /api/admin/blog | JWT | All posts including drafts |
| POST | /api/admin/blog | JWT | Create post |
| PUT | /api/admin/blog/{id} | JWT | Update post |
| DELETE | /api/admin/blog/{id} | JWT | Delete post |
| POST | /api/auth/login | No | Login → JWT token |
| GET | /api/auth/me | JWT | Verify token |

---

## 14. File Structure

```
/app/
├── backend/
│   ├── server.py        ← FastAPI app, all routes, MongoDB, seed data
│   ├── requirements.txt
│   └── .env             ← MONGO_URL, DB_NAME, JWT_SECRET
└── frontend/
    ├── astro.config.mjs ← Astro 5 + React + Tailwind, allowedHosts: true
    ├── package.json     ← start: astro dev --port 3000 --host 0.0.0.0
    ├── tsconfig.json
    ├── .env             ← REACT_APP_BACKEND_URL
    └── src/
        ├── styles/global.css     ← @import tailwindcss + @theme tokens
        ├── layouts/BaseLayout.astro
        ├── components/
        │   ├── Navbar.astro
        │   ├── Footer.astro
        │   ├── LeaderboardPage.tsx  ← Main leaderboard React component
        │   ├── BlogListPage.tsx     ← Blog listing React component
        │   └── AdminApp.tsx         ← Admin dashboard React component
        └── pages/
            ├── index.astro          ← Redirects to /leaderboard
            ├── leaderboard.astro
            ├── blog/
            │   ├── index.astro
            │   └── [slug].astro     ← SSR: export const prerender = false
            └── admin/
                └── index.astro
```
