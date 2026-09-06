# Community Solar Energy Bank

A demo platform that lets people and businesses donate their surplus solar
energy credits directly to low-income families served by NGOs in Brazil.

Built for the [DEV Weekend Challenge: Generosity Edition](https://dev.to/) hackathon.

> **This is a hackathon demo.** No real utility integration or energy
> transfer happens anywhere in this project — donors are not charged any
> money, since they're transferring energy credits they already have, not
> buying anything. The impact dashboard is also simulated.

## How it works

```
Brazil map (pick a state)
        ↓
Utility companies in that state (real data, partial coverage)
        ↓
NGOs linked to that utility (fictional, labeled "Demo NGO")
        ↓
Donation form (kWh of surplus solar credit)
        ↓
AI-researched checklist of what that utility typically requires → confirm transfer
        ↓
Donation saved + AI-generated impact summary + aggregated impact dashboard
```

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Prisma](https://www.prisma.io) + PostgreSQL, hosted on [Neon](https://neon.tech) (via the `@prisma/adapter-pg` driver adapter)
- [Tailwind CSS](https://tailwindcss.com)
- [Zod](https://zod.dev) for API input validation
- [Google Gemini](https://ai.google.dev) (`@google/genai`) for the donation impact summary and, with Google Search grounding, for the transfer requirements checklist — both fall back to static text when no API key is set

## Getting started

### Prerequisites

- Node.js (LTS). If you don't have it, install [nvm](https://github.com/nvm-sh/nvm) and run `nvm install --lts`.
- A PostgreSQL database — e.g. a free [Neon](https://neon.tech) project, or Vercel's Storage tab (Postgres, powered by Neon).

### Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection string, used by the app at runtime |
| `DATABASE_URL_UNPOOLED` | Yes | Direct (non-pooled) connection string, used only by `prisma migrate`/`prisma studio`. Neon and Vercel Postgres provide this alongside `DATABASE_URL`. |
| `GEMINI_API_KEY` | No | Enables real AI-generated impact summaries and the Google Search-grounded transfer requirements checklist. Without it — or if the request fails for any reason, e.g. exhausted quota/billing on the key — the app uses static fallback text, so the demo always works. Get a key at [Google AI Studio](https://aistudio.google.com/apikey). |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Builds the app for production |
| `npm run start` | Runs the production build (after `npm run build`) |
| `npm run lint` | Runs ESLint |
| `npx prisma studio` | Opens a GUI to inspect the database |

## About the data

- **States and regions** (`lib/data/states.json`): all 27 Brazilian states, real data.
- **Utility companies** (`lib/data/utilities.json`): **real** companies, but
  intentionally **partial** coverage for the demo — only these states have a
  registered utility:

  | State | Utility |
  |---|---|
  | RJ | Light |
  | SP, CE, GO | Enel |
  | MG | Cemig |
  | MA, PA, PI | Equatorial |
  | AM | Amazonas Energia |
  | RR | Roraima Energia |
  | PE | Neoenergia Pernambuco |

  Any other state shows a "no demo utility yet" empty state on the map and on
  its state page — this is a known, deliberate limitation of the demo dataset,
  not a bug.
- **NGOs** (`lib/data/ngos.json`): entirely **fictional**, created for this
  demo. Every NGO card and detail page shows a "Demo NGO" badge to make this
  clear.

## Deployment

Deploys to [Vercel](https://vercel.com): connect the repository, add a
Postgres database from the **Storage** tab (Neon-powered — this sets
`DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically), and deploy. The
`postinstall` script (`prisma generate`) runs automatically on every install,
including Vercel's build step — no manual step needed there.

For this demo, local development points at the same Neon database Vercel
uses in production (simplest for a hackathon timeline), so `npx prisma
migrate dev` run locally already applies to what's deployed. For a real
project you'd want separate databases per environment — point
`DATABASE_URL`/`DATABASE_URL_UNPOOLED` at a different Neon branch or project
for local dev, and apply migrations to production explicitly with `npx
prisma migrate deploy`.
