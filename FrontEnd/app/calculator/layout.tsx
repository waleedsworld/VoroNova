import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Habitat Volume Calculator",
  description:
    "Estimate the net habitable volume a space-habitat crew needs from crew size, mission duration and destination — with a live launch-vehicle fairing fit check.",
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
