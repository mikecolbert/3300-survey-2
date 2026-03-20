# Undergraduate Hobbies Survey

## Description

A lightweight, frontend-only survey web app built for BAIS:3300 that collects background and hobby data from undergraduate business students. It writes responses directly to a Supabase PostgreSQL database and presents live aggregated results as interactive bar charts. The app is anonymous, accessible (WCAG 2.1 AA), and deployable as an Azure Static Web App with no backend server required.

## Badges

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)
![License MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat)
![Deploy](https://img.shields.io/badge/Deploy-Azure%20Static%20Web%20Apps-0078D4?style=flat&logo=microsoftazure&logoColor=white)

## Features

- Fill out a short 4-question survey (hometown, state, year in college, hobbies) and submit anonymously
- "Other" hobby free-text entries appear as individual, normalized bars in the results chart — not lumped together
- Inline validation highlights missing or incomplete fields instantly, with keyboard focus moved to the first error
- A post-submission summary card confirms exactly what was recorded before redirecting to results
- Live results page shows total response count, year-in-college distribution, hobby popularity ranking, and top-10 states
- All charts update in real time — every new submission immediately appears in the results
- Fully keyboard-navigable form with correct ARIA roles, labels, and error descriptions for screen readers
- Deploys to Azure Static Web Apps with zero server configuration

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI component framework |
| TypeScript 5 | Static typing across the entire codebase |
| Vite 6 | Dev server and production bundler |
| Tailwind CSS 4 | Utility-first styling |
| wouter 3 | Lightweight client-side routing (`/`, `/survey`, `/results`) |
| Supabase JS 2 | Database client — reads/writes directly from the browser |
| Recharts 2 | Bar chart visualizations on the Results page |
| Azure Static Web Apps | Hosting with SPA fallback routing via `staticwebapp.config.json` |

## Getting Started

### Prerequisites

- Node.js 18 or later — https://nodejs.org/
- pnpm 9 or later — https://pnpm.io/installation
- A Supabase project with the `hobby_survey_results` table created (SQL below)

### Installation

1. Clone the repo and enter the workspace root.

2. Install all workspace dependencies:

```bash
pnpm install
```

3. Create Replit Secrets (or a `.env` file) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

4. In your Supabase SQL Editor, run the table setup SQL:

```sql
create table hobby_survey_results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  hometown text not null,
  state text not null,
  year_in_college text not null,
  hobbies text[] not null,
  other_hobby text
);

alter table hobby_survey_results enable row level security;

create policy "Anyone can insert"
  on hobby_survey_results for insert
  with check (true);

create policy "Anyone can read"
  on hobby_survey_results for select
  using (true);
```

5. Start the dev server (defaults to `PORT` env var):

```bash
pnpm --filter @workspace/survey-app run dev
```

6. Open `http://localhost:<PORT>/` in your browser.

## Usage

- `/` — Home page: landing screen with "Take the Survey" and "View Results" buttons
- `/survey` — 4-question survey form; submits to Supabase on completion
- `/results` — Live aggregated bar charts: year distribution, hobby rankings, top-10 states
- Build: `pnpm --filter @workspace/survey-app run build` → `artifacts/survey-app/dist/public/`
- Deploy: push `dist/public/` to Azure SWA; `public/staticwebapp.config.json` handles SPA routing

## Azure Deployment

This app is designed to be deployed to [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/) as a frontend-only SPA. No backend server is required.

### Required Environment Variables

Before deploying, set the following variables in the Azure portal under your Static Web App → **Settings → Environment variables**:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://your-project-ref.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key |

Do **not** commit real values to source control. See `.env.example` for the expected format.

### Supabase CORS Configuration

Azure Static Web Apps serves your app from a domain such as `https://your-app-name.azurestaticapps.net`. You must allow this origin in your Supabase project:

1. Go to your [Supabase project dashboard](https://app.supabase.com/).
2. Navigate to **Project Settings → API → CORS**.
3. Add your Azure Static Web App domain to the allowed origins list.

Without this step the browser will block all Supabase requests.

### GitHub Actions Setup

A ready-to-use GitHub Actions workflow is included at `.github/workflows/azure-static-web-apps.yml`. To activate it:

1. Provision an Azure Static Web App resource in the [Azure portal](https://portal.azure.com/).
2. Copy the **Deployment Token** from the Azure portal (found under your Static Web App → **Overview → Manage deployment token**).
3. Add it as a GitHub repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as additional GitHub repository secrets (used during the CI build step).
5. Push to `main` — the workflow will build and deploy automatically.

### BASE_PATH

When deploying to Azure Static Web Apps at the root domain (e.g. `https://your-app.azurestaticapps.net/`), no `BASE_PATH` configuration is needed — it defaults to `/`. If you serve the app from a sub-path, set `BASE_PATH` to that sub-path in your Azure environment variables.

## Project Structure

```
artifacts/survey-app/
├── public/
│   ├── favicon.svg                # App favicon
│   ├── opengraph.jpg              # Open Graph image for social sharing
│   └── staticwebapp.config.json   # Azure SWA SPA routing fallback
├── src/
│   ├── components/
│   │   └── ui/                    # shadcn/ui primitive components
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Responsive breakpoint hook
│   │   └── use-toast.ts           # Toast notification hook
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client + shared TypeScript interfaces
│   │   └── utils.ts               # Tailwind class-merging utility
│   ├── pages/
│   │   ├── home.tsx               # Landing page (/)
│   │   ├── not-found.tsx          # 404 fallback page
│   │   ├── results.tsx            # Live results charts (/results)
│   │   └── survey.tsx             # 4-question survey form (/survey)
│   ├── App.tsx                    # Root component with wouter routing
│   ├── index.css                  # Global Tailwind CSS entry point
│   └── main.tsx                   # Vite entry — mounts React app
├── components.json                # shadcn/ui component registry config
├── index.html                     # HTML shell; Vite injects JS bundle here
├── package.json                   # Workspace package config + dependencies
├── tsconfig.json                  # TypeScript compiler config
└── vite.config.ts                 # Vite build config (host, port, alias)
```

## Changelog

### v1.0.0 — 2026-03-20

- Initial release
- 4-question anonymous survey form with full inline validation
- Supabase PostgreSQL backend (direct browser client, no server)
- Live results page with three Recharts bar charts
- "Other" hobby responses normalized and displayed as individual chart bars
- Azure Static Web App routing config included
- WCAG 2.1 AA accessibility: ARIA labels, error linkage, keyboard focus management

## Known Issues / TO-DO

- [ ] No duplicate-submission guard — the same user can submit the form multiple times
- [ ] Results page has no empty-state illustration when zero responses exist
- [ ] The "Other" hobby free-text field is not trimmed server-side, so case variations (e.g. "Gaming" vs "gaming") can produce separate bars
- [ ] No loading skeleton on the Results page — a spinner shows but no placeholder charts

## Roadmap

- Add a unique session token (stored in `sessionStorage`) to prevent accidental repeat submissions
- Allow filtering results by year in college or state via dropdown controls on the Results page
- Add a pie/donut chart for state distribution alongside the horizontal bar chart
- Export results as a CSV download for offline analysis
- Dark mode support using Tailwind's `dark:` variant

## Contributing

This is a course project for BAIS:3300 at the University of Iowa. External contributions are welcome for learning purposes. Fork the repo, create a feature branch, and open a pull request with a clear description of your changes.

1. Fork the repository on GitHub
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against the `main` branch

## License

MIT License. See [LICENSE](LICENSE) for full text.

## Author

Mike Colbert — University of Iowa, BAIS:3300, Spring 2026

## Contact

https://github.com/mcolbert

## Acknowledgements

- [Supabase Docs](https://supabase.com/docs) — database setup and RLS policy reference
- [Recharts](https://recharts.org/) — composable chart library for React
- [Vite](https://vite.dev/) — fast dev server and bundler
- [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS framework
- [wouter](https://github.com/molefrog/wouter) — tiny React router
- [shields.io](https://shields.io/) — badge generation
- [Azure Static Web Apps docs](https://learn.microsoft.com/en-us/azure/static-web-apps/) — SPA routing config reference
- [Replit](https://replit.com/) — cloud development environment
- Claude (Anthropic) — AI assistant used during development
