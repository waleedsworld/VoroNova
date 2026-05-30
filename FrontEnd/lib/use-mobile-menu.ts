"use client"

import { useEffect } from "react"

/**
 * Robustness helper for full-screen mobile menu overlays.
 *
 * When `open` is true it:
 *  - locks background scroll (prevents the page scrolling behind the overlay,
 *    including iOS rubber-band / scroll-chaining), and
 *  - closes the menu on the Escape key.
 *
 * The scroll position is preserved and restored on close, and everything is
 * cleaned up on unmount so a menu left open during navigation never leaves the
 * page in a frozen state.
 */
export function useMobileMenu(open: boolean, onClose: () => void) {
  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  // Lock background scroll while open, restore afterwards.
  useEffect(() => {
    if (!open) return
    if (typeof document === "undefined") return

    const body = document.body
    const scrollY = window.scrollY
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }

    // position: fixed keeps the visual scroll position frozen on iOS Safari,
    // where `overflow: hidden` alone is not honored.
    body.style.overflow = "hidden"
    body.style.position = "fixed"
    body.style.top = `-${scrollY}px`
    body.style.width = "100%"

    return () => {
      body.style.overflow = prev.overflow
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.width = prev.width
      window.scrollTo(0, scrollY)
    }
  }, [open])
}
