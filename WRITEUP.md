# tdc-matchmaker-2

V2 of the TDC matchmaker workspace. The v1 was a dark glassmorphism dashboard; v2 is an editorial-grade redesign — the same matching engine, the same data, the same AI, but with a new visual system, mobile-first layout, and a custom icon family. Built on the same Next.js + TypeScript + Tailwind stack as v1, with the original's scoring engine and AI integration reused rather than rewritten.

---

## What changed from v1

V1 solved the matching problem. V2 solves the *reading* problem.

V1's dashboard treated the matchmaker like an operator — a glass panel with neon score bars, dense KPI strips, and a global search field. The matchmaker's actual job is different. She opens the app once in the morning, looks at 3 to 5 customer cards, makes a few calls, and then spends the rest of the day on the phone. The dashboard is read-heavy, decision-heavy, and rarely needs an action button. V1's design made the operator's job feel like scrolling a CRM.

V2 reframes the dashboard as a **morning brief**. The page is structured like a magazine front cover: masthead with the date, an editorial headline that names the matchmaker and the day, three priority stats, and a "lead stories" section with the three customers most likely to need her attention. Below the fold is a "the full pipeline" section with the rest of her book, filterable but not the focus. The hierarchy is real, not cosmetic — the lead stories are picked by a scoring function over stage urgency, time in stage, and engagement signals, not by alphabetical order.

The case file gets the same treatment. The 3-column compare canvas is replaced with a 2-line headline ("Aarav → Ananya Sharma · #1 of 15"), a single A/B score block in the middle, and a structured prose explanation below. The key factors aren't 10 evenly-weighted bars — they're 4 dimensions with concrete reasoning ("Both vegetarian, both family-first") and 6 other dimensions shown as a glance strip. Notes, matches, and actions are all in the same view but each gets its own breathing room.

The mobile experience is built from the ground up. V1 had no mobile story; the 3-column layout simply broke at narrow widths. V2's customer row collapses from a 6-column table to a 2-row card. The match rail becomes a horizontal scroll strip on mobile. The composer stacks the dark reference panel above the light editor. The login page hides the editorial hero entirely on mobile — just the form.

---

## Tech

Same stack as v1, with one addition:

- **Next.js 14** (App Router) for the routing and SSR shell
- **TypeScript** end-to-end, no `any` in the matching engine or AI layer
- **Tailwind CSS** driving layout, with all colors, borders, and motion durations defined as CSS custom properties so dark mode is a token swap, not a media query
- **Framer Motion** for the small animations that matter (card reveals, score bars, theme toggle, dropdown menus) — not for showy transitions
- **Web Audio API** for click/success/error sound feedback (no audio files shipped)
- **Groq** as the primary AI provider, **OpenRouter** as fallback. Both called from the browser for sub-second responses; the server-side `/api/match` route uses OpenRouter for batch match scoring

No new state management, no new auth, no new data layer. V2 reuses the v1's data pipeline (seeded profile generation, scoring engine, AI client wrappers, sound provider) verbatim. The only new file in `lib/` is `theme.ts` for the dark/light token swap.

---

## Design system

**Type.** Three families. Instrument Serif for headlines and the customer's name, Inter for body text, JetBrains Mono for metadata and numerics. The mono labels are tiny (9-10px) with wide letter-spacing (0.16-0.22em) — that's the magazine small-caps effect, not a default Tailwind class. The serif headlines use tight letter-spacing (-0.01em to -0.02em) so the eye doesn't see the kerning, just the letterforms.

**Color.** Two surfaces, one accent. Warm beige (`#FAF8F3`) for light, warm off-black (`#14110A`) for dark. The accent is ember terracotta (`#C84A2E`) — used sparingly, only for things the user must click, the customer's name in the A/B score, the priority bar on lead-story cards, and the matchmaker's "now" indicator on the journey stepper. Stage status uses three secondary colors: honey for "stalled", moss for "verified", and a muted slate for "on hold". The full palette lives in `app/globals.css` as CSS custom properties so any change to the brand updates the entire app.

**Icons.** All icons in the app are custom 1.25px-stroke SVGs in `components/Glyph.tsx`. No lucide, no heroicons, no Material. The default icon libraries have 1.5px stroke with rounded line caps, which break the moment the typography becomes distinctive. The custom library uses 1.25px sharp strokes, no fills, sized to align with the type's x-height. Twenty-three glyphs total: arrow, chevron, check, cross, clock, hourglass, search, pen, send, message, phone, spark, warn, dot, heart, mail, document, trash, minus, plus, loader, and the editorial anchors.

**Motion.** Subtle. The page is read-mostly, so motion is reserved for: card reveals on initial load, score bars filling, the theme toggle rotation, and the dropdown menu. All easings use `[0.2, 0.8, 0.2, 1]` (a custom ease that slows into the rest). Reduced-motion users get the same content with no animation, by design.

**Surface treatment.** Subtle paper texture. The body has a fixed radial-gradient dot grid overlay at 2.5% opacity so the surface has a printed feel without being noisy. The dark mode uses the same pattern in screen blend mode with 2% white. This is the cheapest way to make a flat color look like a magazine page.

---

## Matching engine

V1's engine, unchanged. Ten dimensions, gender-specific weights, with a deterministic fallback when the AI is offline. The engine's output is the same, but the surface is different. V1 showed 10 score bars; V2 shows 4 prose explanations and 6 glance-only bars. The reasoning is the same: most matches are decided on 2-3 dimensions, the rest are signal. Showing all 10 with equal visual weight hides the signal.

---

## AI

Two call sites, both with graceful degradation:

**Match explanations** (server-side). The "Enhance with AI" button in the case file calls `enhanceMatchWithAI` via `/api/match`, which scores the match in prose using the dimension breakdown as input. The result is stored on the match object and rendered inline in the A/B card. If the call fails, the match shows the static fallback explanation generated by the deterministic engine.

**Email body drafts** (client-side). The "Draft with AI" button in the composer uses a two-call pattern: first generate a one-sentence reason, then use that reason as the seed for a short 2-sentence body. The composer is structured as JSX paragraphs (salutation, intro sentence, reason paragraph, reply instructions, sign-off) so the AI's job is small and bounded — it injects one specific sentence, not the whole email. "Regenerate" ignores any cached explanation and always hits the API for a fresh variant.

**Fallback.** If no key is set in `.env.local`, both features degrade silently: the match shows the static fallback, the composer shows the static starter paragraph. No error states, no upgrade nags, no broken UI.

---

## Mobile

The app is mobile-first. The 3-column layouts on the dashboard and case file collapse gracefully; the match rail becomes a horizontal scroll strip; the composer stacks; the login page hides the editorial hero. The customer row on the dashboard is the most-changed element: a 6-column table on desktop becomes a 2-row card (avatar+name+income+chevron on top, stage+city as a mono strip below) on mobile. Try opening the app on a phone.

---

## Running it

```bash
npm install
cp .env.example .env.local
# add your Groq and OpenRouter keys
npm run dev
```

Login: `priya.sharma` / `tdc2024`

---

## Submission

| | |
|---|---|
| **Live** | _vercel link TBD_ |
| **Repo** | https://github.com/srivtx/tdc-matchmaker-2 |
| **Demo** | `priya.sharma` / `tdc2024` |
