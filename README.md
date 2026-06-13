<p align="center">
  <img src="public/tdc-logo.svg" alt="TDC Matchmaker" width="320" />
</p>

<p align="center">
  <em>The substrate matchmaking pipelines grow on.</em>
</p>

<br/>

An editorial-grade internal workspace for **The Date Crew**, a matchmaker studio. Today's brief, case files, and a 10-dimension matching engine — built for the decision, not the profile.

```bash
npm install && npm run dev
```

Login with `priya.sharma` / `tdc2024`.

---

**What's inside**

- **Today's Brief** — a magazine front page. Three priority actions ranked by stage urgency × days in stage × engagement, a yesterday digest, the full pipeline below.
- **Case Files** — A/B compare canvas, four key factors with concrete reasoning, six other dimensions as a glance strip, matchmaker notes. Keyboard-navigable match rail on the right.
- **Send Match Composer** — side-by-side reference + editor. Structured email body (the AI injects one sentence, the rest is hardcoded JSX).
- **Matching Engine** — 10-dimension weighted scoring with gender-specific logic. Works offline; AI optional.
- **Dark mode** — warm off-black `#14110A`, same paper-texture feel as light mode.
- **Mobile-first** — every surface adapts. Customer rows collapse, match rails become horizontal strips, the composer stacks.

**AI** — [Groq](https://console.groq.com) for fast email drafts, [OpenRouter](https://openrouter.ai) for match explanations and server-side scoring. Both optional, both fall back to deterministic scoring when no key is set. Add them to `.env.local`:

```env
NEXT_PUBLIC_GROQ_API_KEY=***
N...=***
```

**Stack** — Next.js 14 (App Router) · TypeScript · Tailwind 3 with CSS-variable design tokens · Instrument Serif · Inter · JetBrains Mono · Framer Motion · custom 1.25px-stroke glyph icons (no lucide, no material).

**License** — MIT
