---
doc: prd
status: approved
---

# ShineEye — Product Requirements

A one-page checker for WhatsApp investment pitches, for Nigerians deciding whether to pay in. Source: `scope.md > Who It's For`, `scope.md > The Unique Kernel`.

## The Core Journey
1. User opens ShineEye on their phone. They see one big text box ("Paste the message wey dem send you"), a language toggle (English / Pidgin, Pidgin default) and a Check button. Two "Try an example" chips sit under the box.
2. They paste the pitch and tap Check.
3. A result card appears under the box: verdict badge, the money math line, the list of red flags, then "Before you pay" steps.
4. The pasted message is shown again with each flagged phrase highlighted; tapping a flag scrolls to its highlight.
5. They tap "Copy for WhatsApp" and get a short summary ready to paste back into the group.
6. They can switch language at any point; the result re-renders without re-checking.

## Screens and Layout
Single screen, mobile-first, one column:
- Header: ShineEye wordmark, one line "Check am before you pay."
- Input card: textarea, example chips, toggle, Check button
- Result card (hidden until checked): verdict badge, money math box, red flag list, highlighted message, "Before you pay" list, Copy for WhatsApp button
- Footer: "ShineEye no fit tell you say scheme safe. E only show warning signs." plus SEC link

## Look and Feel
Calm and trustworthy, not alarmist. Off-white background, deep green as the main colour (naira note green), red only for "High risk", amber for "Be careful". Big readable type, large tap targets. Copy is conversational. Avoid stock "cyber-security" styling (no shields, padlocks, hacker green-on-black).

## Features and Behavior

### Money math (the kernel)
- Detects a promised return: percentages with a period ("30% weekly", "5% daily", "40% in 30 days") and phrases ("double your money", "2x", "triple").
- Converts it to a monthly rate and compounds ₦100,000 over 12 months.
- Shows: the promised rate in the pitch's words, the 12-month figure, and a plain comparison ("Nigeria treasury bills pay roughly X% a year" is NOT included unless sourced; instead compare to the starting amount: "4,096 times your money").
- If no return is found: "Dem no talk how much you go gain. Ask dem in writing." and skip the math box.
- If a return is found but the 12-month multiple is under 1.5x, show the math without alarm.

### Red flags
Each flag has a name, the quoted words from the pitch, and a one-sentence why, in both languages:
- Guaranteed / risk-free returns
- Very high return (monthly rate above 10%)
- Referral rewards / "bring 3 people"
- Urgency: slots, deadlines, "today only"
- Trading bot / AI trading / forex / crypto arbitrage claims
- Withdrawal conditions ("withdraw after 30 days", "upgrade to withdraw")
- Pay into a personal account / crypto wallet
- Registration claims ("registered with CAC" used as proof of legitimacy)
- Testimonials / screenshots of payouts mentioned

### Verdict
- High risk: very high return OR guaranteed return, plus any other flag; or 3+ flags
- Be careful: 1–2 flags
- No obvious red flags: none found, with the line "This no mean say e safe."

### Copy for WhatsApp
3–5 lines in the chosen language: verdict, the money math line, top two flags, "Check SEC register: sec.gov.ng/cmos". Copies to clipboard and shows "Copied".

## States and Boundaries
- **Empty input** — Check button disabled; example chips available.
- **Very short input (<40 characters)** — "Paste the full message so I fit check am well."
- **AI unavailable** — rules-based result still shows; nothing breaks.
- **Nothing stored** — the pasted text is never saved or logged.

## Product Decisions
- Never say "safe" — a checker can only find warning signs. (Fo, delegated by John)
- Pidgin is default — it's the language the target group chat speaks. (Fo, delegated by John)
- Quotes over generic advice — the warning must point at this message's own words. (scope kernel)
- No storage — people paste messages from private family chats.

## What We're Building
One page that takes pasted text and returns verdict, money math, quoted red flags, highlighted message, before-you-pay steps and a copyable summary, in English and Pidgin.

## Deferred From the POC
- Screenshot/OCR input — most pitches arrive as text forwards; images later.
- WhatsApp bot — needs Meta setup and per-message costs.
- Scheme name lookup — needs a maintained list.

## Possible Later Enhancements
Share link for a result. Hausa and Yoruba. A "report this scheme" button feeding a public list.

## Non-Goals
- Verifying companies or people.
- Investment advice.
- Accounts, history, analytics.

## Open Questions
- Which LLM key is available (spec decides fallback either way). Can wait.
