---
doc: scope
status: approved
---

# ShineEye

Paste a forwarded investment pitch, see in seconds whether it smells like a Ponzi, and why, in English or Pidgin.

## The Unique Kernel
It does the money math the pitch hopes you won't. It pulls the promised return out of the message ("double your money every month", "30% weekly") and shows what that promise means over a year and how many new people would have to pay in to keep it going. Every red flag it raises is quoted straight from the pitch, so the warning is about *this* message, not generic advice.

## Who It's For
A 20 to 40 year old Nigerian on WhatsApp who just got a "join before slots close" broadcast from a friend or family group and is tempted. Today they ask someone in the group, Google the name, or just pay.
Second user: the person in the family who always gets asked "is this one real?" and wants something to forward back.

## The Core Loop
Copy the pitch from WhatsApp → paste → read the verdict, the quoted red flags and the money math → copy the short Pidgin or English summary and send it back to the group. They come back every time a new scheme goes round.

## Inspiration & Identity
Feels like a calm friend who knows money, not a police warning. Nigerian voice, Pidgin first-class (not a translation afterthought). Phone-first: most users will paste from WhatsApp on Android.
Reference events: CBEX (froze withdrawals 14 Apr 2025, promised to double money monthly), MMM Nigeria (collapsed 2016, 30% in 30 days).

## Why This Matters to the Learner
John's work is translating hard money and tech topics for young Africans. Scheme collapses hit exactly that audience, and a tool you can forward back into the group chat is the translation, packaged.

## What "Working" Looks Like
Open the page on a phone, paste a real-style "double your money in 30 days, refer 3 people, guaranteed" message, tap Check. Within a few seconds:
- verdict "High risk" in red
- each red flag with the exact words it came from highlighted
- the money math: "₦100,000 doubling every month becomes ₦409.6 million in 12 months. To pay that, the scheme needs thousands of new people paying in."
- a one-tap "Copy for WhatsApp" summary in Pidgin
The "oh" beat is the money math line.

## The POC Boundary
- Paste text in, one page
- Detect promised return + period, compute the 12-month figure
- Red flags with quotes (guaranteed returns, referral rewards, urgency/slots, unregistered/"not SEC", crypto/forex "trading bot", withdraw-only-after, testimonials)
- Verdict: High risk / Be careful / No obvious red flags (never "safe")
- English/Pidgin toggle
- Copy-for-WhatsApp summary
- Points to the SEC's own registration check (sec.gov.ng/cmos)

## Later
Screenshot upload with OCR. A WhatsApp bot you forward pitches to. A shared list of reported scheme names.

## Explicitly Cut
- Telling anyone a scheme is safe: no tool can verify that, and saying so would be harmful.
- Checking company registration live: the SEC portal is not an API; we link to it instead.
- Accounts/history: not needed to prove the kernel.
