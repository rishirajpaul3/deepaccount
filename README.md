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
| First Line | One personalized cold outreach opener — one click to copy |
| Next Step | Recommended action to move the deal forward |

---

## Getting started

1. Open the [live app](https://deepaccount.vercel.app)
2. Click **API Keys** in the top right
3. Add your keys:
   - [Anthropic API key](https://console.anthropic.com) — for Claude Sonnet
   - [Firecrawl API key](https://firecrawl.dev) — for website scraping
4. Paste a company URL, describe your ICP, and hit Analyze

Keys are saved in your browser's localStorage. Nothing is sent to any server other than Anthropic and Firecrawl directly.

**Shortcut:** `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows) to run the analysis.

---

## Self-hosting

No build step required. It's a single HTML file.

```bash
git clone https://github.com/rishirajpaul3/deepaccount.git
cd deepaccount
open index.html
```

To deploy your own version on Vercel:

```bash
npm i -g vercel
vercel --prod
```

---

## Stack

- Vanilla HTML, CSS, JavaScript — single file, zero dependencies
- [Claude Sonnet](https://anthropic.com) — account analysis and structured output
- [Firecrawl](https://firecrawl.dev) — website scraping

---

## Built by

[Rishiraj Paul](https://github.com/rishirajpaul3) — GTM engineer building AI-powered sales tools.
