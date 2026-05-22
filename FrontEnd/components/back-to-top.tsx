"use client"

import { useEffect, useState } from "react"
import { Rocket } from "lucide-react"

/**
 * A floating "return to orbit" thruster button. Appears once the reader
 * has scrolled past the first viewport and smooth-scrolls them home,
 * with a playful lift-off micro-interaction on hover.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      className={`group fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-card/70 text-primary backdrop-blur-md shadow-lg shadow-primary/20 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-primary/40 focus-visible:outline-none ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span className="absolute inset-0 rounded-full bg-primary/20 blur-md transition-opacity group-hover:opacity-100 opacity-0" />
      <Rocket className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-12" />
    </button>
  )
}
