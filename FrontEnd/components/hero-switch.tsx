"use client"

import { useEffect, useState } from "react"
import { Hero } from "@/components/hero"
import { HeroVariantB } from "@/components/hero-variant-b"

type Variant = "a" | "b"

/**
 * A/B switcher for the landing hero.
 *
 * The variant is chosen from the `?variant=` query string, read client-side so
 * it works with Next's static export (`output: 'export'`). Anything other than
 * `b` falls through to the control (variant A / the original <Hero />).
 *
 *   /            → control  (variant A)
 *   /?variant=b  → treatment (variant B, "Mission Control")
 *
 * A small floating pill lets a visitor (or a reviewer) flip between the two
 * without editing the URL by hand, and shows which arm is currently live.
 */
export function HeroSwitch() {
  const [variant, setVariant] = useState<Variant>("a")

  // Read the initial arm from the URL on mount (works on fresh loads and
  // shared /?variant=b links under static export).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setVariant(params.get("variant") === "b" ? "b" : "a")
  }, [])

  // Also react to browser back/forward.
  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search)
      setVariant(params.get("variant") === "b" ? "b" : "a")
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const choose = (next: Variant) => {
    setVariant(next)
    // Keep the URL shareable without a full reload.
    const url = next === "b" ? "/?variant=b" : "/"
    window.history.pushState({}, "", url)
  }

  const pill = (arm: Variant, label: string) => (
    <button
      type="button"
      onClick={() => choose(arm)}
      aria-pressed={variant === arm}
      className={
        "rounded-full px-3 py-1 transition-colors " +
        (variant === arm
          ? "bg-gradient-to-r from-primary to-orange-500 text-primary-foreground"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {label}
    </button>
  )

  return (
    <>
      {variant === "b" ? <HeroVariantB /> : <Hero />}

      {/* Discoverable A/B toggle */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border border-border/60 bg-card/70 p-1 text-xs font-medium backdrop-blur-md shadow-lg">
        <span className="px-2 text-muted-foreground">Hero</span>
        {pill("a", "A")}
        {pill("b", "B")}
      </div>
    </>
  )
}
