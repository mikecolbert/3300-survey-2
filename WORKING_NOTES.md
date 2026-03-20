# Working Notes — Undergraduate Hobbies Survey

> **Internal document. Not public-facing. Do not commit sensitive credentials here.**
> Update this file at the end of every working session before closing.

---

## How to Use This File (For AI Assistants)

1. Read this entire file before writing any code or making any suggestions.
2. Read `README.md` in this same folder for public-facing context, setup SQL, and usage details.
3. Do not change the folder structure, file naming conventions, or routing design without discussing it first.
4. Follow all conventions in the **Conventions** section exactly — do not introduce new patterns.
5. Do not suggest anything listed in **What Was Tried and Rejected**; those decisions were deliberate.
6. Ask before making any large structural changes (new routing library, new state management, new DB schema columns, replacing Recharts, etc.).
7. This project was AI-assisted. Refactor conservatively — prefer targeted edits over wholesale rewrites.
8. The accent color `#8A3BDB` is used only for interactive elements and data viz. Never use it for body text (WCAG contrast).

---

## Current State

**Last Updated:** 2026-03-20

The app is complete and functional. All three pages (Home, Survey, Results) are built and wired to a live Supabase database. Documentation (README.md) is current. Azure Static Web App deployment config is in place.

### What Is Working

- [x] Home page (`/`) with "Take the Survey" and "View Results" navigation
- [x] Survey form (`/survey`) — 4 questions: hometown (text), state (dropdown), year in college (radio), hobbies (checkboxes + "Other" free text)
- [x] Inline form validation with keyboard focus moved to first error field
- [x] Post-submission thank-you screen with summary card showing what was recorded
- [x] Results page (`/results`) — live bar charts: year distribution, hobby popularity, top-10 states
- [x] "Other" hobby free-text entries normalized (lowercased for dedup, title-cased for display) and shown as individual bars
- [x] Supabase client with startup error thrown if env vars are missing
- [x] Error message on Results page distinguishes missing table (PostgreSQL code 42P01) from other errors
- [x] Azure SWA SPA fallback routing via `public/staticwebapp.config.json`
- [x] Footer on all pages: "Survey by Mike Colbert, BAIS:3300 - spring 2026."
- [x] WCAG 2.1 AA accessibility: ARIA roles, labels, error linkage, keyboard navigation
- [x] README.md with all 16 required sections
- [x] WORKING_NOTES.md (this file)

### What Is Partially Built

- [ ] Dark mode — Tailwind `dark:` variant is configured in `index.css` but no dark styles are applied to any page component

### What Is Not Started

- [ ] Duplicate-submission guard (sessionStorage token)
- [ ] Filter controls on Results page (by year or state)
- [ ] CSV export of results
- [ ] Pie/donut chart for state distribution
- [ ] Empty-state illustration on Results page when zero responses exist

---

## Current Task

All planned tasks are complete as of 2026-03-20. The last work done was rewriting `README.md` to match the user's updated 16-section specification (Task #5) and setting up Azure Static Web App deployment configuration (Task #4).

**Next step:** No active task. Pick any item from the "What Is Not Started" checklist above or start a new feature from the Roadmap.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 18 | Standard for component-based UI; strong ecosystem |
| TypeScript | 5 | Catches bugs at compile time; required for the workspace |
| Vite | 6 | Fast dev server; reads `PORT` env var; outputs to `dist/public/` |
| Tailwind CSS | 4 | Rapid styling without leaving JSX; v4 uses `@import "tailwindcss"` |
| wouter | 3 | Tiny SPA router; no server needed; avoids React Router v6 complexity |
| Supabase JS | 2 | Direct browser-to-database client; no backend server required |
| Recharts | 2 | Composable React-native chart library; straightforward bar chart API |
| Azure Static Web Apps | — | Serverless hosting for static SPA; supports SPA fallback routing |
| Inter (Google Fonts) | — | Clean, legible sans-serif; loaded via `<link>` in `index.html` |

---

## Project Structure Notes

```
artifacts/survey-app/
├── public/
│   ├── favicon.svg                # SVG favicon; no .ico needed for modern browsers
│   ├── opengraph.jpg              # OG image for social sharing
│   └── staticwebapp.config.json   # Azure SWA: rewrites all non-asset paths to /index.html
├── src/
│   ├── components/
│   │   └── ui/                    # shadcn/ui primitives — installed but largely unused by this app
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Breakpoint hook (unused in current pages, came with scaffold)
│   │   └── use-toast.ts           # Toast hook (unused in current pages, came with scaffold)
│   ├── lib/
│   │   ├── supabase.ts            # Creates + exports Supabase client; throws on missing env vars
│   │   └── utils.ts               # cn() helper: clsx + tailwind-merge
│   ├── pages/
│   │   ├── home.tsx               # Landing page — navigation only, no data fetching
│   │   ├── not-found.tsx          # 404 fallback rendered by wouter's catch-all <Route>
│   │   ├── results.tsx            # Fetches all rows on mount; aggregates + renders 3 charts
│   │   └── survey.tsx             # Controlled form; all state is local useState; submits via supabase.insert
│   ├── App.tsx                    # WouterRouter with BASE_URL base path; wraps QueryClientProvider
│   ├── index.css                  # Tailwind v4 entry; CSS custom properties for shadcn/ui theme
│   └── main.tsx                   # ReactDOM.createRoot; mounts <App />
├── components.json                # shadcn/ui CLI config — do not edit manually
├── index.html                     # HTML shell; loads Inter font; sets OG meta tags
├── package.json                   # Workspace package (@workspace/survey-app)
├── tsconfig.json                  # Strict mode; paths alias "@" → "src/"
└── vite.config.ts                 # PORT env var required in dev; base = BASE_PATH env var
```

### Non-obvious decisions

- **`BASE_PATH` env var:** Vite reads `process.env.BASE_PATH` (default `/`) and passes it as `base`. `App.tsx` strips the trailing slash before passing to `WouterRouter base=`. This keeps routing correct when deployed under a subpath.
- **`@tanstack/react-query` is installed** (came with scaffold) but is not used by any page component. Supabase queries are plain `async/await` inside `useEffect`. Do not refactor to React Query without discussion.
- **shadcn/ui components are installed** but current pages build their form elements from raw HTML (`<input>`, `<select>`, `<label>`) with Tailwind. This is intentional — the form needed precise ARIA control.
- **`components/` and `hooks/` scaffold files** (`use-mobile.tsx`, `use-toast.ts`) are unused but must not be deleted — they are referenced by shadcn/ui components that may be added later.

### Files / folders that must not be changed without discussion

- `public/staticwebapp.config.json` — changing this breaks Azure SWA SPA routing
- `src/lib/supabase.ts` — changing the env var names breaks both dev and deployed environments
- `vite.config.ts` — `base`, `outDir`, `allowedHosts`, and `PORT` logic are load-bearing
- `tsconfig.json` — path alias `"@/*"` is used throughout; changing breaks all imports

---

## Data / Database

**Provider:** Supabase (PostgreSQL). Direct browser client — no backend API server.

### Table: `hobby_survey_results`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Yes (auto) | `gen_random_uuid()` default; primary key |
| `created_at` | `timestamptz` | Yes (auto) | `now()` default; not displayed in UI |
| `hometown` | `text` | Yes | Free text; trimmed before insert |
| `state` | `text` | Yes | One of 50 US state names; validated by dropdown |
| `year_in_college` | `text` | Yes | One of: "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year or More" |
| `hobbies` | `text[]` | Yes | Array; values from HOBBY_OPTIONS: Read, Run, Hike, Bike, Swim, Other |
| `other_hobby` | `text` | No | Nullable; only set when "Other" is in `hobbies`; trimmed before insert |

### Row Level Security

Two policies on `hobby_survey_results`:
- `"Anyone can insert"` — `for insert with check (true)` — anonymous inserts allowed
- `"Anyone can read"` — `for select using (true)` — anonymous reads allowed

The anon key is used — no auth required. RLS must remain enabled or the policies are bypassed.

---

## Conventions

### Naming conventions

- **Files:** `kebab-case.tsx` for pages and components (e.g., `not-found.tsx`, `use-mobile.tsx`)
- **Components:** PascalCase exports matching the file name (e.g., `export default function Survey()`)
- **CSS classes:** Tailwind utility classes only; no custom class names except when unavoidable
- **Supabase column names:** `snake_case` (e.g., `year_in_college`, `other_hobby`)
- **React state / variables:** `camelCase` (e.g., `yearInCollege`, `otherHobby`)

### Code style

- TypeScript strict mode — all types must be explicit; no `any`
- Interfaces over type aliases for object shapes (e.g., `interface FormState`, `interface SurveyRow`)
- `const` by default; `let` only when reassignment is needed
- No default exports from `lib/` files — use named exports
- Supabase client is a singleton exported from `src/lib/supabase.ts`; never instantiate it elsewhere
- Accent color is hardcoded as `#8A3BDB` inline (e.g., `text-[#8A3BDB]`) — do not use for body text

### Framework patterns

- **Routing:** wouter v3 `<Switch>` + `<Route>`. Use `<Link href="...">` — never nest `<a>` inside `<Link>` (wouter v3 renders its own `<a>`)
- **Form state:** All form state is local `useState` in `survey.tsx` — no form library (react-hook-form is installed but not used here)
- **Data fetching:** Plain `async/await` in `useEffect` on mount — no React Query, no SWR
- **Error handling:** Set local `error` state string; render inline alert `role="alert"` — no toast
- **Validation:** Client-side only; validate on submit; move focus to first error element via `el?.focus()`
- **Accessibility:** `tabIndex={-1}` on radio/checkbox group containers so `el.focus()` can target the group without adding it to tab order; pair with `outline-none` class

### Git commit style

Conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `refactor:` code change that doesn't fix a bug or add a feature
- `style:` formatting, whitespace
- `chore:` tooling, config, dependencies

---

## Decisions and Tradeoffs

- **No backend server.** The Supabase JS client runs entirely in the browser. This exposes the anon key in the bundle, which is acceptable because the anon key only grants what RLS policies allow (insert + select). Do not suggest adding a backend API server unless a feature genuinely requires it.
- **wouter over React Router.** wouter is ~2 KB vs React Router's ~50 KB. The app has 3 routes; the complexity of React Router is unnecessary. Do not suggest migrating.
- **Raw HTML form elements over shadcn/ui form components.** shadcn/ui's `<Form>` uses react-hook-form and adds abstraction layers that make ARIA wiring harder to inspect. Raw elements give full control. Do not suggest switching to shadcn form components for the survey form.
- **"Other" hobby normalization at read time, not write time.** `other_hobby` is stored as-is from the user's input (trimmed but not lowercased). Normalization (lowercase → group → title-case) happens in `aggregateData()` in `results.tsx`. This preserves the original response in the database while still grouping near-duplicates in the chart. Do not move normalization to the insert path.
- **No auth / no user accounts.** The survey is anonymous by design. Adding auth would change the product's nature. Do not suggest it unless the user explicitly asks.
- **Accent color hardcoded, not a CSS variable.** `#8A3BDB` is used directly in Tailwind arbitrary-value classes (e.g., `bg-[#8A3BDB]`). This is intentional to avoid dependency on the shadcn/ui CSS variable system for a non-shadcn color.
- **`tabIndex={-1}` on group containers.** Radio and checkbox groups have `id="yearInCollege"` and `id="hobby-group"` with `tabIndex={-1}`. This allows `document.getElementById(id).focus()` to move focus to the group on validation error without adding the container to the natural tab order. The `outline-none` class prevents the focus ring from appearing on the container.

---

## What Was Tried and Rejected

- **Grouping all "Other" hobby entries into a single "Other" bar.** The original chart lumped all free-text "Other" responses under one bar. The user explicitly rejected this — each unique "other" value must appear as its own bar, normalized by lowercase. Do not suggest reverting to a single "Other" bar.
- **"Submit Another Response" button on the thank-you screen.** An early version of the post-submission screen had two buttons: "Submit Another Response" and "View Results". The user removed "Submit Another Response" — only "View Results" remains. Do not add it back.
- **`## GitHub Contact` as the Contact section heading.** An earlier README version used `## GitHub Contact`. The user's spec says `## Contact`. Do not use `## GitHub Contact` again.
- **`## Prerequisites` and `## Installation` as separate flat top-level sections.** An earlier README split Getting Started into two peer `##` sections. The correct structure is one `## Getting Started` section with `### Prerequisites` and `### Installation` as subsections. Do not flatten them again.
- **`## Metadata` table in the README.** Added by an AI assistant during a review cycle; the user's spec has exactly 16 sections and does not include a Metadata table. Removed in the final version. Do not add it back.
- **React Query for Supabase data fetching.** `@tanstack/react-query` is installed in the scaffold but was not used — plain `useEffect` + `async/await` is simpler and sufficient for a single fetch-on-mount pattern. Do not introduce React Query without discussion.

---

## Known Issues and Workarounds

**Issue 1: No duplicate-submission guard**
A user can fill out and submit the form multiple times in the same browser session. There is no deduplication check. A planned fix (sessionStorage token set after submit, checked on mount) is listed in the Roadmap but not yet built. Do not add any server-side dedup logic without discussion — the preference is a client-side guard.

**Issue 2: "Other" hobby case sensitivity**
`other_hobby` is stored trimmed but not lowercased. If two users type "Gaming" and "gaming", they produce two separate bars in the results chart. The `aggregateData()` function in `results.tsx` lowercases before grouping, so near-identical entries in the same case do merge — but different capitalizations do not. This is a known limitation; do not "fix" it by lowercasing at insert time without discussion.

**Issue 3: No loading skeleton on Results page**
While Supabase data loads, the Results page shows a text spinner ("Loading results…") with no placeholder chart shapes. This is intentional for simplicity. A skeleton was considered and deferred to the Roadmap. Do not add a third-party skeleton library without discussion.

**Issue 4: Dark mode infrastructure exists but is unused**
`index.css` defines a `dark` custom variant and CSS custom properties for dark colors (from the shadcn/ui scaffold). No page component applies `dark:` variants. The infrastructure is there but the feature is not built. Do not apply dark styles piecemeal — implement it fully or not at all.

---

## Browser / Environment Compatibility

### Front-end

- **Tested in:** Chrome 120+, Firefox 122+, Safari 17+, Edge 120+
- **Expected support:** All modern evergreen browsers
- **Not supported:** Internet Explorer (any version); no polyfills are included
- **Known incompatibility:** `accent-color` CSS property (used for radio/checkbox purple tint) is not supported in IE and older Safari — graceful degradation to default browser styling

### Back-end / Environment

- **Runtime:** Node.js 18+ (required by pnpm workspace)
- **Package manager:** pnpm 9 (workspace protocol used for cross-package deps)
- **Environment variables required at dev time:**
  - `PORT` — assigned by Replit; must be set; Vite throws if missing in dev mode
  - `VITE_SUPABASE_URL` — Supabase project URL; stored as a Replit Secret
  - `VITE_SUPABASE_ANON_KEY` — Supabase anon key; stored as a Replit Secret
- **Build output:** `artifacts/survey-app/dist/public/` — static files only; no Node.js runtime needed in production
- **Deployment target:** Azure Static Web Apps (serverless static hosting)

---

## Open Questions

- [ ] **Duplicate prevention strategy.** Should the duplicate guard be `sessionStorage` (blocks only in the same tab session), `localStorage` (blocks across tabs in same browser), or something else? Decide before building the guard.
- [ ] **"Other" hobby normalization strictness.** Should "Gaming" and "gaming" always merge into one bar (requires lowercasing at insert), or is the current read-time normalization sufficient? Decide before touching the insert path.
- [ ] **Results page real-time updates.** Currently data loads once on mount. Should the Results page poll or use a Supabase Realtime subscription to show new submissions without a page refresh? Decide before adding any subscription code.
- [ ] **LICENSE file.** `README.md` links to `[LICENSE](LICENSE)` but no `LICENSE` file exists in the repo. Should a `LICENSE` file be created, or should the README link be removed?

---

## Session Log

### 2026-03-20

**Accomplished:**
- Built the complete survey app from scratch (Home, Survey, Results pages)
- Wired Supabase client with env var guard and startup error
- Added WCAG 2.1 AA accessibility: ARIA roles, error linkage, `tabIndex={-1}` on group containers
- Removed "Submit Another Response" button; kept only "View Results" on thank-you screen
- Improved Results page error message to detect missing table (42P01)
- Set up Azure Static Web App routing config (`public/staticwebapp.config.json`)
- Wrote README.md (v1 through v7); final version has 16 sections in user-specified order with `## Getting Started` wrapping Prerequisites and Installation subsections
- Wrote WORKING_NOTES.md (this file)

**Left incomplete:**
- No duplicate-submission guard built
- No filter controls on Results page
- Dark mode not implemented

**Decisions made:**
- "Other" hobby normalization stays at read time (not write time)
- Plain `useEffect` + `async/await` for data fetching (not React Query)
- Raw HTML form elements (not shadcn/ui Form) for precise ARIA control

**Next step:** No active task. Candidate next items: duplicate-submission guard (sessionStorage), CSV export, or Results page filter controls.

---

## Useful References

- [Supabase JS v2 docs](https://supabase.com/docs/reference/javascript/introduction) — client API, insert, select, RLS
- [Supabase Row Level Security guide](https://supabase.com/docs/guides/auth/row-level-security) — policy syntax
- [Recharts docs](https://recharts.org/en-US/api) — BarChart, Bar, XAxis, YAxis, LabelList, Cell
- [wouter v3 README](https://github.com/molefrog/wouter) — `<Link>`, `<Route>`, `<Switch>`, `useLocation`, `base` prop
- [Tailwind CSS v4 docs](https://tailwindcss.com/docs) — v4 uses `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- [Azure Static Web Apps routing](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration) — `staticwebapp.config.json` `navigationFallback`
- [WCAG 2.1 AA quick reference](https://www.w3.org/WAI/WCAG21/quickref/) — contrast, focus, ARIA
- [shields.io](https://shields.io/) — badge URL builder
- **AI tools used:** Claude (Anthropic) via Replit Agent — used for initial build, all feature iterations, README drafts, and this WORKING_NOTES file. All AI output was reviewed and corrected by the developer.
