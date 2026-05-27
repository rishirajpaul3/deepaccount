# DeepAccount

B2B account intelligence for sales reps. Paste a company URL and your ICP — get a structured account brief in seconds, powered by Claude and Firecrawl.

**Live → [deepaccount.vercel.app](https://deepaccount.vercel.app)**

---

## What it does

DeepAccount scrapes a company's public pages (homepage, pricing, about, careers, blog), sends the content to Claude alongside your ICP description, and returns a full account plan:

| Output | Description |
|---|---|
| Fit Score | 0–100 score with visual indicator (red / yellow / green) |
| Green Flags | 3 reasons this account fits your ICP |
| Red Flags | 3 risks or mismatches to watch |
| Champion Profile | Job title most likely to champion internally, and what to say |
| Decision Maker Profile | Who holds budget and how to loop them in |
| First Line | One personalized cold outreach opener — copy with one click |
| Next Step | Recommended action to move the deal forward |

---

## Getting started

1. Open the [live app](https://deepaccount.vercel.app)
2. Click **API Key** in the top right
3. Add your [Anthropic API key](https://console.anthropic.com) — that's all you need
4. Paste a company URL, describe your ICP, and hit Analyze

Your key is saved in your browser's localStorage. Website scraping is handled server-side — you never need a Firecrawl key.

**Shortcut:** `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows) to run the analysis.

---

## Self-hosting

```bash
git clone https://github.com/rishirajpaul3/deepaccount.git
cd deepaccount
```

Add your Firecrawl key as an environment variable, then deploy:

```bash
vercel env add FIRECRAWL_API_KEY
vercel --prod
```

The scraping proxy (`api/scrape.js`) reads `FIRECRAWL_API_KEY` from the environment. Users of your deployment only need their own Anthropic key.

---

## Features

- **History** — recent analyses saved locally, one click to restore
- **Share link** — every brief gets a shareable URL (encoded in the hash, no server needed)
- **Copy brief** — exports the full brief as clean plain text for Slack, email, or Notion
- **One key only** — scraping is proxied server-side, users only need an Anthropic key

## Stack

- Vanilla HTML, CSS, JavaScript — single file frontend
- [Vercel](https://vercel.com) — hosting + serverless scraping proxy
- [Claude Sonnet](https://anthropic.com) — account analysis and structured output
- [Firecrawl](https://firecrawl.dev) — website scraping (server-side)

---

## Built by

[Rishiraj Paul](https://github.com/rishirajpaul3) — GTM engineer building AI-powered sales tools.
