# Landing Hero — A/B Variants

VoroNova's landing hero ships in two variants so the headline, layout, and
call-to-action can be compared as a live A/B experiment. The arm is selected
from the `?variant=` query string and resolved on the client, so it works with
the site's Next.js static export (`output: 'export'`).

| URL              | Arm            | Component                          |
| ---------------- | -------------- | ---------------------------------- |
| `/`              | A — control    | `components/hero.tsx`              |
| `/?variant=b`    | B — treatment  | `components/hero-variant-b.tsx`    |

Any value other than `b` falls through to the control.

## How the two arms differ

The variants are intentionally distinct on all three axes the experiment
measures — not just cosmetic tweaks:

| Axis      | A — control ("Think Beyond Earth")                 | B — treatment ("Mission Control")                          |
| --------- | -------------------------------------------------- | ---------------------------------------------------------- |
| Headline  | Aspirational: *"Think Beyond Earth, Imagine the Future"* | Outcome-led: *"Design the places humanity will live in space"* |
| Layout    | Two-column desktop split (copy left, orbit right)  | Single centered column, orbit system as a full-bleed backdrop |
| CTA       | Dual actions: *Explore More* + *Watch Demo*, plus a 3-cell stat grid | One dominant *Launch the Studio* action + a row of capability pills |

Both arms reuse the shared design tokens (the primary→orange gradient, `card`,
`border`, `muted-foreground`, the `OrbitSystem`), so B stays on-brand while
reading as a genuinely different page.

## How it's wired

- `components/hero-variant-b.tsx` — the treatment hero (new, self-contained).
- `components/hero-switch.tsx` — `"use client"` switcher. Reads `?variant=` on
  mount, listens for `popstate` (back/forward), and renders `Hero` or
  `HeroVariantB`. It also renders a small floating **A / B toggle pill**
  (bottom-right) so a visitor or reviewer can flip arms without editing the URL;
  clicking a pill updates state and pushes a shareable URL via
  `history.pushState` — no full reload.
- `app/page.tsx` — the only shared-file change: `<Hero />` was replaced with
  `<HeroSwitch />`.

## Testing locally

```bash
cd FrontEnd
npm install
npm run build        # static export → FrontEnd/dist
npx serve dist       # or any static server
# visit /            → variant A (control)
# visit /?variant=b  → variant B (treatment)
# or use the A/B pill in the bottom-right corner
```

Verified with a headless Chromium run: `/` renders the control headline and
dual CTA; `/?variant=b` renders the treatment headline and *Launch the Studio*;
the toggle pill switches arms client-side and rewrites the URL.
