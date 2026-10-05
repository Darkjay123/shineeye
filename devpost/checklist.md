---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast (John asked for speed; approved under his delegation, 5 Oct 2026)

## Slices

- [x] **1. Paste a pitch and see the money math, quoted red flags and a verdict**
  Becomes usable: Running server; pasting a pitch on the page returns verdict, the 12-month money math and each red flag with its quoted words.
  Why now: This is the unique kernel. Everything else is presentation around it, so it goes first and gets the tests.
  PRD ref: `prd.md > Money math (the kernel)`, `prd.md > Red flags`, `prd.md > Verdict`
  Spec ref: `spec.md > Return detector and money math (src/money.js)`, `spec.md > Flag rules (src/flags.js)`, `spec.md > Verdict (src/check.js)`, `spec.md > File Structure`
  Build: Scaffold per file structure, write money.js, flags.js, check.js, server.js with POST /api/check, a plain page that shows the raw result, and fixture tests mixing English and Pidgin.
  Verify (mechanical): `node --test` passes; POST a fixture to /api/check and confirm verdict, math and quotes.
  Learner check: Run `node server.js`, open localhost:8080, paste the example, see High risk and the ₦409.6 million line.
  Commit: `Add money math, red-flag rules and check endpoint`

- [ ] **2. The real phone-first page: Pidgin/English, highlights, Copy for WhatsApp**
  Becomes usable: The full designed result card, language toggle, highlighted message and one-tap WhatsApp summary.
  Why now: Turns the working kernel into the product the video shows.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Screens and Layout`, `prd.md > Look and Feel`, `prd.md > Copy for WhatsApp`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Copy (public/copy.js)`, `spec.md > Page (public/index.html, public/app.js, public/style.css)`, `spec.md > Look and Feel`
  Build: copy.js with every string in en and pcm, app.js rendering, style.css, example chips, empty/short states, clipboard copy.
  Verify (mechanical): Render the page in a headless browser at phone width for both examples and both languages; inspect screenshots; copy text built from result matches PRD format.
  Learner check: Toggle Pidgin/English on a result, tap a flag, tap Copy for WhatsApp and paste it somewhere.
  Commit: `Add phone-first result page with Pidgin and WhatsApp copy`

- [ ] **3. Optional AI second look that can't invent evidence**
  Becomes usable: With GEMINI_API_KEY set, extra flags appear marked "AI"; without it, nothing changes.
  Why now: Coverage on top of a kernel already proven; last because the app must stand without it.
  PRD ref: `prd.md > States and Boundaries`
  Spec ref: `spec.md > AI second look (src/ai.js)`, `spec.md > Important Failure Modes`
  Build: ai.js with prompt, 8s timeout, verbatim-quote validation, overlap removal; merge in check route.
  Verify (mechanical): Unit test with a stubbed model response containing one real quote and one invented quote; only the real one survives. No key → identical result.
  Learner check: Add a key to .env, check a pitch, see any AI flag show its quote.
  Commit: `Add optional Gemini second look with quote validation`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review completed

## Code Tour and App Map

- [ ] Learning wrap-up and app map completed

## Revisions
