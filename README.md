# DeepAccount — B2B Account Intelligence

A single-page tool for B2B sales reps. Drop in a company URL and your ICP — get a full account intelligence brief in seconds.

**Live:** [deepaccount.vercel.app](https://deepaccount.vercel.app) *(update this once deployed)*

## What it does

1. Scrapes the company's homepage, pricing, about, careers, and blog pages via Firecrawl
2. Sends the content + your ICP description to Claude (Sonnet)
3. Returns a structured account plan:
   - **Fit Score** (0–100) with visual indicator
   - **3 Green Flags** — why this account fits your ICP
   - **3 Red Flags** — risks or mismatches
   - **Champion Profile** — who to build internal momentum with
   - **Decision Maker Profile** — who holds budget and how to loop them in
   - **Suggested First Line** — one personalized cold outreach opener
   - **Recommended Next Step**

## Usage

Open the live link → click **API Keys** (top right) → paste your Anthropic and Firecrawl keys → analyze any account.

You'll need:
- [Anthropic API key](https://console.anthropic.com) — for Claude Sonnet
- [Firecrawl API key](https://firecrawl.dev) — for website scraping

Keys are saved in your browser's localStorage. Nothing is sent to any server other than Anthropic and Firecrawl directly.

## Stack

Vanilla HTML, CSS, JavaScript — single file, no build step, no dependencies.
