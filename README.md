<p align="center">
  <img src="public/tdc-logo.svg" alt="TDC Matchmaker" width="280" />
</p>

<p align="center">
  <em>An editorial workspace for The Date Crew — built for the decision, not the profile.</em>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" /></a>
  <a href="https://www.framer.com/motion"><img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" /></a>
  <img src="https://img.shields.io/badge/AI-Groq-F55036?style=flat-square&logo=groq&logoColor=white" alt="Groq" />
  <img src="https://img.shields.io/badge/AI-OpenRouter-FF7F50?style=flat-square" alt="OpenRouter" />
  <img src="https://img.shields.io/badge/license-MIT-22C55E?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="#what-it-does">What it does</a> · <a href="#quick-start">Quick start</a> · <a href="#stack">Stack</a> · <a href="./WRITEUP.md">Writeup</a>
</p>

---

## What it does

A matchmaker's morning workspace, designed as a *brief* — not a CRM.

- **Today's Brief** — magazine-front dashboard. Three priority actions ranked by stage urgency × days in stage × engagement. Yesterday digest, full pipeline below.
- **Case Files** — A/B compare canvas. Four prose explanations for the dimensions that matter, six other dimensions as a glance strip. Notes, journey, and a horizontal match rail.
- **Send Match Composer** — structured email with the AI's job bounded to one sentence. The salutation, intro, and sign-off are hardcoded JSX; AI only injects the reason.
- **Matching Engine** — 10-dimension weighted scoring with gender-specific logic. Deterministic fallback, always works offline.
- **Mobile-first** — every surface adapts. Customer rows collapse, match rails become horizontal strips, the composer stacks.
- **Dark mode** — warm off-black, same paper-texture feel as light mode.

## Quick start

```bash
git clone https://github.com/srivtx/tdc-matchmaker-2
cd tdc-matchmaker-2
npm install
cp .env.example .env.local   # add your Groq/OpenRouter keys
npm run dev
```

Open <http://localhost:3000> and sign in with `priya.sharma` / `tdc2024`.

The app works without API keys — the matching engine and UI are fully deterministic. Add keys in `.env.local` to enable AI explanations and email drafts.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | [Next.js 14](https://nextjs.org) (App Router) | SSR shell, file-based routing, edge-ready |
| Language | [TypeScript 5](https://www.typescriptlang.org) | Type safety end-to-end, no `any` in the matching engine or AI layer |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) + CSS custom properties | Tokens drive both themes; `data-theme="dark"` on `<html>` swaps the palette |
| Type | [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) · [Inter](https://rsms.me/inter) · [JetBrains Mono](https://www.jetbrains.com/lp/mono) | Editorial serif headlines, neutral sans body, tabular mono for numerics |
| Motion | [Framer Motion](https://www.framer.com/motion) | Card reveals, score bars, theme toggle rotation. Respects `prefers-reduced-motion` |
| Icons | Custom 1.25px-stroke SVG glyphs | `components/Glyph.tsx` — 23 hand-drawn marks tuned to the type's voice. No lucide, no Material |
| AI (client) | [Groq](https://groq.com) · [OpenRouter](https://openrouter.ai) | Sub-second email drafts, per-match explanations. Both call from the browser |
| AI (server) | [OpenRouter](https://openrouter.ai) via `/api/match` | Batch match scoring, server-side only |
| Sound | [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | No audio files shipped. Click, success, error feedback |
| Auth | localStorage | Mock auth — the brief is a UI shell, not a backend |

## Design system

**Color.** Two surfaces, one accent. Warm beige (`#FAF8F3`) / warm off-black (`#14110A`); ember terracotta (`#C84A2E`) for things the user must click.

**Type.** Instrument Serif for the headlines, Inter for the body, JetBrains Mono for the metadata. Small caps mono labels with wide tracking (`0.16-0.22em`) for the magazine feel.

**Icons.** All in `components/Glyph.tsx`. Custom 1.25px sharp strokes, no fills, no rounded caps. Sizing tuned to the type's x-height so icons sit in the same visual rhythm as the text.

**Motion.** Subtle. Card reveals on initial load, score bars filling, theme toggle rotation. All easings use a custom `[0.2, 0.8, 0.2, 1]` curve.

**Surface.** Subtle paper texture — fixed radial-gradient dot grid at 2.5% opacity so the surface feels printed, not flat.

## License

MIT — see [LICENSE](./LICENSE).

## Credits

Built for [The Date Crew](https://github.com/srivtx/tdc-matchmaker) as v2 of the original workspace. The matching engine, scoring logic, and AI integration are reused from v1; the design system, layout, and most components are new.
