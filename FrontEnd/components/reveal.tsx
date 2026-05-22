"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  /** Stagger delay in ms before the reveal animation starts. */
  delay?: number
  className?: string
}

/**
 * Scroll-triggered entrance wrapper. Fades and lifts its children into
 * place the first time they enter the viewport. Honours the global
 * prefers-reduced-motion rule (the CSS transition is neutralised there),
 * so content is always visible regardless of motion settings.
 */
export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  )
}
