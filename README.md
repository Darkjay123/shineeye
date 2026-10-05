# ShineEye

Paste a forwarded investment pitch and see the Ponzi warning signs, with the money math, in English or Pidgin.

**Try it:** https://darkjay123.github.io/shineeye/ (runs entirely in your browser; the message you paste never leaves your phone)

Built for Devpost's [Build With AI: Basics](https://learn-ai-basics.devpost.com/) with the Devpost Learn skill pack. The planning documents are in [`devpost/`](devpost/): [scope](devpost/scope.md), [PRD](devpost/prd.md), [spec](devpost/spec.md) and the [build checklist](devpost/checklist.md).

## What it does

- Finds the return the pitch promises ("double your money every month", "30% weekly", "invest 50k get 100k after 14 days") and shows what ₦100,000 would become in 12 months at that rate, and how many new people would have to pay in to fund that one payout.
- Flags nine classic warning signs (guaranteed returns, referral rewards, urgency, vague trading stories, withdrawal conditions, payment into a personal account or wallet, CAC registration used as proof, payout testimonies, returns above 10% a month). Every flag quotes the exact words from the pitch and highlights them.
- Gives a verdict: High risk, Be careful, or No obvious red flags. It never says a scheme is safe.
- Pidgin and English, and a one-tap "Copy for WhatsApp" summary to send back to the group.
- Optional AI second look (server mode with a Gemini key): Gemini can suggest extra warning signs, but any suggestion whose quote isn't word for word in the message is thrown away.

## Run it locally

Requires Node.js 20 or newer. No dependencies to install.

```bash
node server.js        # http://localhost:8080
node --test           # 13 tests
```

To enable the optional AI second look, copy `.env.example` to `.env` and set `GEMINI_API_KEY`. Without it the app runs on its rules alone.

## How it's built

- `public/lib/money.js`: finds the promised return and does the compounding math (a month is treated as 30 days).
- `public/lib/flags.js`: the red-flag rules, English and Pidgin phrasings.
- `public/lib/check.js`: combines them into a verdict. The same code runs in the browser and on the server.
- `src/ai.js`: optional Gemini call with quote validation (server only).
- `server.js`: zero-dependency Node server: static files plus `POST /api/check`.
- `public/`: the page (vanilla HTML, CSS, JS; no build step). Deployed to GitHub Pages by `.github/workflows/pages.yml`, which runs the tests first.

## Limits

ShineEye only finds warning signs in the text. It can't verify a company, and a message with no flags can still be a scam. Check any investment platform on the SEC Nigeria register: https://sec.gov.ng/cmos

Example pitches in the app and tests are made up, modelled on publicly reported scheme patterns; they don't name real companies.

## License

MIT
