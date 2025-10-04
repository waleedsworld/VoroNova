"use client"

import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { CTA } from "@/components/cta"
import { Navigation } from "@/components/navigation"
import { StarField } from "@/components/star-field"
import { LoadingScreen } from "@/components/loading-screen"
import { useState, useEffect } from "react"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // Reset loading on page refresh
  useEffect(() => {
    setIsLoading(true)
  }, [])

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <StarField />
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
    </main>
  )
}
