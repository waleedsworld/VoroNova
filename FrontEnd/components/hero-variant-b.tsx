import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OrbitSystem } from "@/components/orbit-system"
import { Rocket, Compass, Layers3, Cpu } from "lucide-react"

/**
 * Hero — Variant B ("Mission Control")
 *
 * An A/B alternative to the default <Hero />, activated with ?variant=b.
 * Distinct from the control on all three axes the experiment measures:
 *   - Headline:  outcome-led ("Design the places humanity will live in space")
 *                vs. the control's aspirational "Think Beyond Earth".
 *   - Layout:    single centered column with the orbit system as a full-bleed
 *                backdrop, vs. the control's two-column desktop split.
 *   - CTA:       one dominant "Launch the Studio" action + capability pills,
 *                vs. the control's dual "Explore More / Watch Demo" buttons.
 *
 * Reuses the shared design tokens (primary/orange gradient, card, border,
 * muted-foreground) so it stays on-brand while reading as a different page.
 */
export function HeroVariantB() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 sm:px-6">
      {/* Full-bleed orbit backdrop */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25 sm:opacity-40 lg:opacity-60">
        <div className="scale-110 sm:scale-125 lg:scale-150">
          <OrbitSystem />
        </div>
      </div>

      {/* Radial focus glow behind the copy */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--background)/0.85)_35%,_transparent_75%)]" />

      <div className="container relative z-20 mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-gradient-to-r from-primary/20 to-orange-500/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur-md shadow-lg sm:text-sm">
          <Rocket className="h-4 w-4" />
          <span>NASA Space Apps · AI Design Studio</span>
        </div>

        {/* Headline — outcome-led, single focal statement */}
        <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
          Design the places{" "}
          <span className="bg-gradient-to-r from-primary via-orange-400 to-orange-500 bg-clip-text text-transparent">
            humanity will live in space
          </span>
        </h1>

        <div className="mx-auto mt-6 h-1 w-28 rounded-full bg-gradient-to-r from-primary to-orange-500" />

        {/* Subhead */}
        <p className="text-pretty mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
          Describe a mission. Get a NASA-grade habitat floor plan in seconds —
          then explore it in interactive 2D and 3D. No CAD, no PhD required.
        </p>

        {/* Single dominant CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group h-14 bg-gradient-to-r from-primary to-orange-500 px-8 text-base font-semibold text-primary-foreground shadow-xl hover:from-primary/90 hover:to-orange-500/90"
          >
            <Link href="/app">
              Launch the Studio
              <Rocket className="ml-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            or see how it works ↓
          </a>
        </div>

        {/* Capability pills replace the control's stat grid */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: Cpu, label: "AI-generated layouts" },
            { icon: Layers3, label: "Instant 2D → 3D" },
            { icon: Compass, label: "Mission-driven design" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:border-primary/40"
            >
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
