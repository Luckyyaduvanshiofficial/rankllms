# RankLLMs — GitHub Copilot Instructions

## Project Overview
RankLLMs is an open-source LLM leaderboard and comparison platform.
It ranks AI models across intelligence, coding, speed, and price benchmarks.
Think: open-source alternative to artificialanalysis.ai

## Tech Stack
- **Frontend**: Astro (SSR mode)
- **Styling**: Tailwind CSS + DaisyUI
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Language**: TypeScript everywhere

## Project Structure
```
src/
  pages/          → Astro pages (file-based routing)
  layouts/        → BaseLayout.astro wraps every page
  components/     → Reusable Astro/TS components
  lib/            → supabase.ts client, helpers
  types/          → TypeScript interfaces
```

## Coding Rules — ALWAYS Follow

### General
- Use TypeScript, never plain JavaScript
- Use `const` over `let`, never `var`
- Always handle null/undefined — Supabase can return null
- No inline styles — use Tailwind classes only
- Component names: PascalCase (ModelCard.astro)
- File names: kebab-case (model-detail.astro)

### Astro Specific
- Fetch ALL data server-side in the frontmatter (---) block
- Never expose SUPABASE_SERVICE_KEY to client
- Use only SUPABASE_ANON_KEY on client-side if needed
- Prefer `.astro` components over React unless interactivity needed
- Use `Astro.props` with TypeScript interface always

### Supabase Rules
- Always use the supabase client from `src/lib/supabase.ts`
- Always destructure `{ data, error }` and handle error
- Never do `SELECT *` — always specify columns needed
- Use `.order()` and `.limit()` on every list query

### DaisyUI + Tailwind Rules
- Use DaisyUI component classes first (btn, card, table, badge)
- Theme: `data-theme="rankllms"` set on <html>
- Dark mode is default — always design dark-first
- Responsive: mobile-first, use sm: md: lg: breakpoints

## Database — Main Tables

### model_metrics (primary table)
Key columns to know:
- `model_name` — display name
- `creator` — who made it (OpenAI, Google, Anthropic...)
- `provider` — who hosts it
- `rankllms_intelligence_index` — main ranking score (INT)
- `median_tokens_s` — speed score
- `input_price_usd`, `output_price_usd` — pricing (DECIMAL)
- All benchmark columns are DECIMAL(5,2) — percentage as number (41.5 not "41%")

### blogs
- `id`, `title`, `slug`, `content`, `published_at`, `is_published`

## Data Fetching Pattern — Always Use This
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
)

// In any .astro page frontmatter:
const { data: models, error } = await supabase
  .from('model_metrics')
  .select('model_name, creator, rankllms_intelligence_index, input_price_usd, median_tokens_s')
  .order('rankllms_intelligence_index', { ascending: false })
  .limit(50)

if (error) console.error(error)
```

## What This Site Is NOT
- Not a blog-only site
- Not a portfolio
- Not a SaaS with user accounts (yet)
- No client-side data fetching for leaderboard (always SSR)

## Naming Conventions
- Pages: `src/pages/index.astro`, `src/pages/models/[slug].astro`
- Components: `src/components/ModelTable.astro`, `src/components/BenchmarkChart.astro`
- Types: `src/types/model.ts` → export interface `ModelMetric`
- Env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`

## DO NOT
- Do not use React unless chart library requires it
- Do not install Redux, Zustand, or any state library
- Do not use CSS modules or styled-components
- Do not hardcode any data — always fetch from Supabase
- Do not use `any` type in TypeScript