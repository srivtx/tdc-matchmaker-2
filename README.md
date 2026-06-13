<p align="center">
  <img src="public/tdc-logo.svg" alt="TDC Matchmaker" width="480" />
</p>

<h3 align="center"><em>The substrate matchmaking pipelines grow on.</em></h3>

<p align="center">An editorial-grade workspace for The Date Crew.<br/><em>Built for the decision, not the profile.</em></p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/AI-Groq-f472b6?style=flat" />
  <img src="https://img.shields.io/badge/AI-OpenRouter-FF6B6B?style=flat" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat" />
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &nbsp;·&nbsp;
  <a href="#todays-brief">Today's Brief</a> &nbsp;·&nbsp;
  <a href="#case-files">Case Files</a> &nbsp;·&nbsp;
  <a href="#ai">AI</a> &nbsp;·&nbsp;
  <a href="#design-system">Design System</a> &nbsp;·&nbsp;
  <a href="#mobile">Mobile</a> &nbsp;·&nbsp;
  <a href="#stack">Stack</a>
</p>

---

## Quick Start

```bash
npm install
cp .env.example .env.local   # paste your API keys
npm run dev
```

**Demo login:** `priya.sharma` / `tdc2024`

Open [http://localhost:3000](http://localhost:3000) — responsive, light + dark mode, no backend required.

---

## Today's Brief

The dashboard is a **magazine front page**, not a CRM. The matchmaker opens it and sees:

1. **The date** and a time-aware greeting (*Good morning, Priya.*)
2. **Three priority stats** — intros to send, follow-ups due, pipeline count
3. **§ 01 — Lead stories** — three featured cards ranked by priority score (stage urgency × days in stage × engagement). Each card: photo, name, age/city/job, stage blurb, one-sentence body, and a CTA
4. **Yesterday digest** — new matches suggested, families replied, intros awaiting reply
5. **§ 02 — The full pipeline** — every customer, filterable (Active / Stalled / All) and sortable (Urgency / Stage / Name)

The matchmaker glances, decides what to do in 5 seconds, and acts.

---

## Case Files

Click any customer → opens the **case file** in three columns:

- **Left rail** — the customer: photo, name, age/city/job, stage badge, full biodata (income, height, education, community, diet, languages, relocation), journey stepper
- **Center** — the compare canvas: A/B score for the selected match, four *key factors* that matter for this specific match with concrete reasoning (*"Both non-vegetarian, both family-first, both Chandigarh-based"*), six other dimensions as a glance strip, matchmaker notes
- **Right rail** — full match list with tier filters (All / Excellent / High / Good), keyboard navigation (`↑↓` to move, `⌘↵` to send)

Send match opens a **side-by-side composer**: dark reference panel on the left showing both people, light editor on the right with a structured email body. "Draft with AI" injects a one-sentence reason into the body — the rest of the email (salutation, intro, reply instructions, sign-off) is hardcoded JSX, so the AI does one job well instead of rewriting everything.

---

## AI

Two providers, both optional, both with graceful fallback to deterministic scoring:

| Provider | Speed | Free tier | Used for |
|---|---|---|---|
| [Groq](https://console.groq.com) | ~0.5s | 1,000 req/day | Email body drafts |
| [OpenRouter](https://openrouter.ai) | ~2s | Pay-as-you-go | Match explanations, server-side scoring |

Add one or both to `.env.local`:

```env
NEXT_PUBLIC_GROQ_API_KEY=***
N...=***      # server-only, used by /api/match
```

**Three AI features:**

- **Enhance with AI** — generates per-match one-sentence explanations via server-side API route
- **Draft with AI** — generates a one-sentence reason and injects it into the email skeleton
- **Regenerate** — always calls the API for a fresh variant, ignoring any cached explanation

No keys? UI degrades gracefully: explanations show the static fallback, the composer shows the starter paragraph.

---

## Design System

- **Editorial voice** — Instrument Serif for headlines (like *The New Yorker*), Inter for body, JetBrains Mono for numerics and metadata
- **Warm-neutral palette** — warm beige `#FAF8F3` (light) / warm off-black `#14110A` (dark), single ember terracotta accent `#C84A2E`
- **Paper texture** — fixed dot grid overlay on the body to evoke a printed page
- **Custom glyphs** — all icons are 1.25px stroke, sharp corners, no fills — drawn in-house to match the typography (no Material Design, no filled icons)
- **Section numbers** — `§ 01`, `§ 02` like a magazine, with em-dash separators
- **Drop caps** — first letter of featured card bodies rendered as a large serif initial

The whole thing feels like *opening a magazine*, not opening a SaaS dashboard.

---

## Mobile

Designed mobile-first. Open it on a phone:

- Dashboard stacks: featured cards go vertical, search/filter wraps, customer rows collapse from 6-col table to 2-row card
- Case file: left rail becomes a compact summary card, right rail becomes a horizontal scroll strip you swipe
- Composer: dark reference panel stacks above the light editor
- Login: editorial hero hides entirely, just the form

---

## Stack

| | |
|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) with CSS custom-property design tokens |
| Type | [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) · [Inter](https://rsms.me/inter) · [JetBrains Mono](https://www.jetbrains.com/lp/mono) |
| Motion | [Framer Motion](https://www.framer.com/motion) |
| Icons | Custom 1.25px-stroke SVG glyphs (`components/Glyph.tsx`) |
| AI | [Groq](https://groq.com) · [OpenRouter](https://openrouter.ai) |
| Hosting | [Vercel](https://vercel.com) |

---

## License

MIT
