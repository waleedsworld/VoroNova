"use client"

import { useEffect, useState } from "react"

/**
 * A thin orbital-fuel gauge pinned to the very top of the viewport.
 * Fills with the logo gradient as the reader travels down the page —
 * a quiet "mission progress" cue that reinforces the space theme.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-primary via-orange-500 to-primary shadow-[0_0_12px_rgba(255,140,60,0.7)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}
