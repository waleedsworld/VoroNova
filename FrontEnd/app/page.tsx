"use client"

import { HeroSwitch } from "@/components/hero-switch"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { StarField } from "@/components/star-field"
import { LoadingScreen } from "@/components/loading-screen"
import { ScrollProgress } from "@/components/scroll-progress"
import { BackToTop } from "@/components/back-to-top"
import { Reveal } from "@/components/reveal"
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
    <main id="main-content" tabIndex={-1} className="relative min-h-screen overflow-hidden bg-background">
      <ScrollProgress />
      <StarField />
      <Navigation />
      <HeroSwitch />
      <Reveal>
        <Features />
      </Reveal>
      <Reveal delay={80}>
        <HowItWorks />
      </Reveal>
      <Reveal delay={80}>
        <CTA />
      </Reveal>
      <Footer />
      <BackToTop />
    </main>
  )
}
