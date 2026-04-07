# RankLLMs – PRD & Progress

## Problem Statement
Build a production-grade website for rankllms.com — an AI-first platform that ranks LLMs, provides detailed comparisons, and publishes blog content. Design quality on par with Vercel, Stripe, and Vellum.

## Architecture

### Tech Stack
- **Frontend**: Astro 5.18.1 + React 19 islands + Tailwind CSS 4.2.2
- **Backend**: FastAPI + Motor (async MongoDB) + JWT auth
- **Database**: MongoDB (local, managed by supervisor)
- **Deployment**: Kubernetes-managed Emergent environment

### Key Directories
- `/app/frontend/` — Astro frontend (supervisor: yarn start → astro dev port 3000)
- `/app/backend/` — FastAPI backend (supervisor: uvicorn port 8001)
- `/app/backend/server.py` — Main API with all endpoints

### Astro Config Notes
- `server.allowedHosts: true` required for Emergent preview domain
- Astro 5 used (Astro 6 requires Node 22, only Node 20 available)
- Blog detail page uses `export const prerender = false` for SSR

## Pages & Components

### Pages
- `/` → redirect to `/leaderboard`
- `/leaderboard` — Main LLM leaderboard (dark theme)
- `/blog` — Blog listing (light cream theme)
- `/blog/[slug]` — Blog detail (SSR, fetches from API)
- `/admin` — Admin dashboard

### React Components
- `LeaderboardPage.tsx` — Full leaderboard with mini charts, compare widget, model table, glossary
- `BlogListPage.tsx` — Blog listing with category filter and pagination
- `AdminApp.tsx` — Admin dashboard with auth and CRUD for models + posts

### Astro Components
- `Navbar.astro` — Fixed dark navbar with logo, nav links, CTA
- `Footer.astro` — Dark footer with 4-column links

## Core Features Implemented (Feb 2026)

### LLM Leaderboard
- [x] Hero section with gradient title, model count badge
- [x] 6 mini bar charts (Best in Coding, Reasoning, Math, Overall, Multilingual, Visual)
- [x] Fastest/Cheapest models section (3 cards: speed, latency, cost)
- [x] Compare Models widget with 2 model selectors + horizontal bar charts
- [x] Full model comparison table (15 models, sortable, searchable, provider filter)
- [x] Benchmark Glossary (6 benchmark definitions)

### Blog System
- [x] Blog listing with 3-column card grid
- [x] Category filter tabs (All, Comparisons, News, Guides, LLM Basics)
- [x] 9 seed blog posts with real content and Unsplash images
- [x] Blog detail page with SSR (slug-based routing)
- [x] Article layout with hero image, category badge, author

### Admin Dashboard
- [x] JWT-based admin authentication
- [x] Model management (CRUD: add/edit/delete LLM models)
- [x] Blog management (CRUD: create/edit/delete posts)
- [x] Auto-seed on startup (15 models, 9 blog posts)

### Backend API
- [x] GET /api/models — all models sorted by overall score
- [x] GET /api/models/{slug}
- [x] POST/PUT/DELETE /api/admin/models
- [x] GET /api/blog — published posts with optional category filter
- [x] GET /api/blog/{slug}
- [x] GET/POST/PUT/DELETE /api/admin/blog
- [x] POST /api/auth/login + GET /api/auth/me

## Seed Data
- 15 LLM models: o3, Claude Opus 4.5, GPT-4.1, Gemini 2.5 Pro, Claude Sonnet 4.5, GPT-4o, Grok 3, DeepSeek R1, o4-mini, DeepSeek V3, Gemini 2.5 Flash, Mistral Large 2, Llama 4 Scout, Claude Haiku 4.5, Llama 3.3 70B
- 9 Blog posts: Comparisons, News, Guides, LLM Basics categories

## Test Results (Iteration 1)
- Backend: 100% passing
- Frontend: 90% passing (minor test selector issues, functionality works)

## Design
- Dark theme: #1a1a1a bg, #222 surface, #f26e2a orange accent, #14b8a6 teal
- Light blog: #F8F7F4 bg, dark footer
- Typography: Inter (body), JetBrains Mono (numbers)
- CSS-only bar charts, no external chart libraries

## Prioritized Backlog

### P1 (Next iteration)
- [ ] Responsive mobile design improvements
- [ ] Sort indicator improvements in table (click feedback)
- [ ] Real-time model data from official APIs (Artificial Analysis etc.)
- [ ] Newsletter subscription form

### P2 (Future)
- [ ] Model detail pages (/models/[slug])
- [ ] User accounts + bookmarks
- [ ] API for external access
- [ ] Multi-provider pricing calculator
- [ ] Share comparison feature
- [ ] Model submission form (community-driven data)

### Backlog
- [ ] Dark mode toggle
- [ ] Export data (CSV/JSON)
- [ ] Side-by-side 3+ model comparison
- [ ] Real-time latency testing widget
