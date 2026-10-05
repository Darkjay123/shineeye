---
doc: spec
status: approved
---

# ShineEye — Technical Spec

## How This Works, In Plain Language
ShineEye is one web page and one small Node server.
- The **page** has the text box, the toggle and the result card. It sends the pasted text to the server and draws whatever comes back.
- The **checker** is a plain JavaScript module on the server. It reads the message with hand-written rules: it finds the promised return and does the money math, and it finds red-flag phrases and remembers exactly where in the message each one sits. Same input, same answer, every time, with no internet needed.
- The **AI second look** is optional. If a Gemini key is set, the server also asks Gemini to point out any extra warning signs, but Gemini must quote the exact words it is pointing at. The server throws away any flag whose quote is not actually in the message, so the AI cannot invent evidence.
- **Copy text** for both languages is written by hand, not generated, so the Pidgin reads like a person.

Why this shape: the kernel (the math and the quotes) must be right every time on camera, so it lives in rules we can test. AI adds coverage, never the verdict's backbone.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.
1. User opens `/` → server sends `public/index.html`.
2. User pastes and taps Check → page POSTs `{ text }` to `/api/check`.
3. Server runs `check(text)` → finds return promise → `moneyMath()` → finds flags with character positions → computes verdict.
4. If `GEMINI_API_KEY` is set → `aiFlags(text)` asks Gemini for extra flags as JSON with quotes → server keeps only quotes found verbatim in the text and not already flagged → merges, re-computes verdict.
5. Server returns `{ verdict, math, flags[{id, quote, start, end, source}], }` (language-neutral ids).
6. Page renders the card in the chosen language from `public/copy.js`; toggle re-renders from the same result without calling the server.
7. Copy for WhatsApp builds the summary from the same result and writes it to the clipboard.

## Stack
- Node.js 22, no framework: `node:http` server. Rationale: one route and one static page do not need Express or Hono; zero dependencies keeps the repo readable for reviewers.
- Tests: `node:test` + `node:assert` (built in).
- Front end: one HTML file, vanilla JS, hand-written CSS. No build step.
- Optional AI: Google Gemini API, model `gemini-2.5-flash`, REST `generateContent` with JSON response. Docs: https://ai.google.dev/gemini-api/docs. Unverified until a key is tested in the build; the app must work fully without it.

## Where It Runs and How Someone Tries It
- Local: `node server.js` → open http://localhost:8080 (phone-width window for the demo recording).
- Env: optional `GEMINI_API_KEY` in `.env` (never committed; `.env.example` lists it empty).
- Deployment optional; not planned for the POC.

## Look and Feel
From `prd.md > Look and Feel`: off-white `#FAF8F3` background, naira green `#0B6E4F` primary, red `#C0392B` high risk, amber `#D68910` be careful. System font stack, 18px base, 48px tap targets, single column max 560px. Highlighted phrases use a soft yellow marker background. Friendly conversational copy. No shields, padlocks or dark hacker styling.

## Components

### Return detector and money math (`src/money.js`)
Finds: `N% (per|a|every) (day|daily|week|weekly|month|monthly)`, `N% in N days/weeks`, `double/2x/triple/3x (your money) (in N days|every month|monthly)`.
Converts to a monthly rate: daily d → (1+d)^30−1; weekly w → (1+w)^(30/7)−1 (a month is treated as 30 days throughout); N% in D days → (1+p)^(30/D)−1; double monthly → 100%.
12-month multiple = (1+r)^12. Output: promised phrase + position, monthly rate, ₦100,000 after 12 months, and newcomers needed to fund that one payout at ₦100,000 each = (final − 100,000) / 100,000.
PRD ref: `prd.md > Money math (the kernel)`.

### Flag rules (`src/flags.js`)
One entry per PRD flag: id, regex list (English + common Pidgin spellings), returns matches with start/end. Very-high-return flag comes from `money.js` (monthly rate > 10%).
PRD ref: `prd.md > Red flags`.

### Verdict (`src/check.js`)
Combines money + flags, applies PRD verdict rules, returns the result object.
PRD ref: `prd.md > Verdict`.

### AI second look (`src/ai.js`)
Prompt asks for up to 4 extra warning signs as JSON `[{label, quote, why}]`, quotes copied exactly. Validates each quote with `text.indexOf(quote)`; drops misses and overlaps with rule flags. 8s timeout; any error → returns [].

### Copy (`public/copy.js`)
All UI strings and per-flag explanations in `en` and `pcm`.

### Page (`public/index.html`, `public/app.js`, `public/style.css`)
Input, examples, toggle, result card, highlight view, copy button.
PRD ref: `prd.md > Screens and Layout`.

## Data Model
Nothing persists. Request in, result out. Language choice lives in page memory (and `localStorage` so a refresh keeps it). The server does not log pasted text.

## File Structure
```
bwai/
├── server.js            # http server: static files + POST /api/check
├── src/
│   ├── money.js         # return detection + money math
│   ├── flags.js         # red-flag rules
│   ├── ai.js            # optional Gemini second look
│   └── check.js         # combines everything, verdict
├── public/
│   ├── index.html
│   ├── app.js
│   ├── copy.js          # English + Pidgin strings
│   └── style.css
├── test/
│   ├── money.test.js
│   ├── flags.test.js
│   └── fixtures.js      # example pitches (written for testing, modelled on reported patterns)
├── .env.example
├── README.md
└── devpost/             # planning docs
```

## External Services and Dependencies
- Gemini `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=KEY`, body with `contents` and `generationConfig.responseMimeType: application/json`. Free tier is enough for a demo; test pitches are made-up text. Optional.
- SEC Nigeria register: linked only (https://sec.gov.ng/cmos), never called.

## Important Failure Modes
- **Return phrased in a way the regex misses** ("your 50k go turn 100k next month") → math box says the pitch did not state a return clearly; flags still run. Fixtures cover the common phrasings.
- **Gemini slow, missing key, or bad JSON** → rules-only result, no error shown.
- **Huge numbers** (daily 10% compounding) → formatted with words (million, billion, trillion) and capped display beyond a quadrillion as "more than 1,000 trillion naira".

## What Was Simplified and Why
- **Paste text only** instead of screenshots — most forwards are text; OCR would double the build.
- **Rules first, AI optional** instead of an AI-only checker — the demo must be repeatable and every quote provable.
- **Fixed ₦100,000 example** instead of user-entered amounts — one clear number reads faster in a video.

## Decisions and Open Issues
- John delegated planning choices to Fo ("bro answer all questions and lets move on", 5 Oct 2026); all choices above are Fo's, pending John's approval.
- Genuine uncertainty: how well regex catches Pidgin phrasings of returns. Investigation in build: write 8+ fixture pitches mixing English and Pidgin and test detection before building the UI.
- Open: whether a Gemini key is available. Not blocking.

Approval: John delegated all planning decisions to Fo on 5 Oct 2026 ("bro answer all questions and lets move on"); scope, PRD and spec approved under that delegation.
