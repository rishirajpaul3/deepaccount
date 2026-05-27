# DeepAccount — Claude Context

## What this is
B2B account intelligence SaaS. Drop a company URL + ICP → get fit score, buyer contacts, personalized first line.

## Stack
- **Frontend**: React + Vite + TypeScript, CSS Modules, React Router v6
- **Auth**: Clerk (Google OAuth) — `@clerk/clerk-react` on frontend, `@clerk/backend` in API routes
- **DB**: Neon (serverless Postgres) — connected via `pg` Pool in `api/db.js`
- **AI**: Anthropic Claude (`claude-sonnet-4-5`) called directly from browser with user's own API key
- **Scraping**: Firecrawl (`api/scrape.js` proxy)
- **Contacts**: Apollo.io (`api/people.js` proxy)
- **Billing**: Stripe — Pro plan $19/month (`api/checkout.js`, `api/webhook.js`)
- **Hosting**: Vercel (frontend + serverless API routes)

## Design system
Matches SaravaSales signature UX: cream `#FAF8F3` background, Playfair Display serif headings, Inter body, amber `#C17B2A` accent, CSS Modules, pill buttons (border-radius: 100px). CSS vars in `src/index.css`.

## Folder structure
```
api/            Vercel serverless functions
  auth.js       Clerk JWT verification helper (requireUser)
  db.js         pg Pool — import and use directly
  analyses.js   GET list / POST create+increment usage
  usage.js      GET usage (upserts row on first call)
  checkout.js   Stripe checkout session
  webhook.js    Stripe webhook (flips plan in DB)
  portal.js     Stripe billing portal
  scrape.js     Firecrawl proxy
  people.js     Apollo contacts proxy
db/
  schema.sql    Plain Postgres schema — run once on Neon
src/
  lib/
    types.ts    Shared TS types (Analysis, UserUsage, Plan)
    api.ts      apiGet/apiPost helpers (attach Clerk JWT)
  contexts/
    AuthContext.tsx  Thin Clerk wrapper — exports useAuth() with {user, loading, signOut, getToken}
  components/
    Header.tsx        Sticky nav with usage pill
    AnalysisForm.tsx  URL + ICP + Anthropic key form
    ResultsView.tsx   Full brief: score, flags, contacts, first line
  pages/
    Landing.tsx   Marketing page (redirects to /dashboard if signed in)
    Login.tsx     Google OAuth via Clerk useSignIn
    Dashboard.tsx Main app — sidebar history + analysis flow
    Settings.tsx  API key, usage bar, Stripe upgrade
```

## Key env vars (all in Vercel, never commit)
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- `CLERK_SECRET_KEY` — Clerk backend key
- `DATABASE_URL` — Neon connection string
- `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- `APP_URL` — https://deepaccount.vercel.app
- `FIRECRAWL_API_KEY`, `APOLLO_API_KEY` — already in Vercel

## Rules
- Never commit .env or any key. All secrets via Vercel env vars only.
- Always push to GitHub after changes, then `vercel --prod`.
- User's Anthropic key stored in localStorage only — never sent to our API.
- Free plan: 10 analyses/month. Pro: unlimited.
