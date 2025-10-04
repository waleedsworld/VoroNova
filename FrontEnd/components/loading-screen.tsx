"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface LoadingScreenProps {
  onComplete: () => void
}

// Pre-defined star positions to avoid hydration mismatch
const starPositions = [
  { left: "8.36%", top: "6.01%", delay: "0.67s", duration: "2.84s" },
  { left: "91.10%", top: "76.75%", delay: "0.48s", duration: "3.23s" },
  { left: "0.59%", top: "4.50%", delay: "2.26s", duration: "2.34s" },
  { left: "68.43%", top: "56.52%", delay: "2.70s", duration: "3.09s" },
  { left: "13.09%", top: "6.24%", delay: "1.50s", duration: "2.48s" },
  { left: "14.64%", top: "38.20%", delay: "0.70s", duration: "3.30s" },
  { left: "98.40%", top: "87.49%", delay: "0.30s", duration: "3.47s" },
  { left: "26.52%", top: "20.92%", delay: "2.80s", duration: "3.08s" },
  { left: "24.71%", top: "22.36%", delay: "1.93s", duration: "3.38s" },
  { left: "43.64%", top: "29.40%", delay: "0.77s", duration: "3.27s" },
  { left: "96.49%", top: "1.73%", delay: "1.01s", duration: "3.61s" },
  { left: "49.50%", top: "1.45%", delay: "0.03s", duration: "3.24s" },
  { left: "38.52%", top: "21.81%", delay: "2.19s", duration: "3.60s" },
  { left: "3.14%", top: "66.76%", delay: "2.70s", duration: "2.56s" },
  { left: "18.89%", top: "35.57%", delay: "2.82s", duration: "3.28s" },
  { left: "37.07%", top: "57.34%", delay: "0.27s", duration: "3.40s" },
  { left: "30.01%", top: "64.78%", delay: "0.73s", duration: "2.68s" },
  { left: "31.27%", top: "71.72%", delay: "1.90s", duration: "2.70s" },
  { left: "91.49%", top: "58.29%", delay: "0.53s", duration: "3.18s" },
  { left: "89.74%", top: "70.88%", delay: "2.48s", duration: "2.85s" }
]

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentText, setCurrentText] = useState("Initializing Voronova...")
  const [showLogo, setShowLogo] = useState(false)
  const [showText, setShowText] = useState(false)

  const loadingTexts = [
    "Initializing Voronova...",
    "Loading AI Systems...",
    "Preparing Engineering Tools...",
    "Calibrating Neural Networks...",
    "Ready for Takeoff!"
  ]

  useEffect(() => {
    // Show logo after 200ms
    const logoTimer = setTimeout(() => setShowLogo(true), 200)
    
    // Show text after 400ms
    const textTimer = setTimeout(() => setShowText(true), 400)

    // Complete loading after 2 seconds
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 2000)

    // Text cycling (faster)
    const textInterval = setInterval(() => {
      setCurrentText(prev => {
        const currentIndex = loadingTexts.indexOf(prev)
        return loadingTexts[(currentIndex + 1) % loadingTexts.length]
      })
    }, 400)

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(textTimer)
      clearTimeout(completeTimer)
      clearInterval(textInterval)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-orange-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }} />
        
        {/* Animated Stars */}
        {starPositions.map((star, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}

        {/* Orbital Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-96 h-96">
            {/* Orbit Rings */}
            <div className="absolute inset-0 rounded-full border border-primary/10 animate-spin-slow" />
            <div className="absolute inset-8 rounded-full border border-orange-500/10 animate-spin-reverse" />
            <div className="absolute inset-16 rounded-full border border-cyan-500/10 animate-spin-slow" />
            
            {/* Centered Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Image 
                  src="/logo.png" 
                  alt="Voronova" 
                  width={80} 
                  height={80} 
                  className="h-16 w-16 sm:h-20 sm:w-20 drop-shadow-2xl animate-pulse-glow" 
                />
                {/* Glow effect */}
                <div className="absolute inset-0 h-16 w-16 sm:h-20 sm:w-20 bg-primary/30 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
            
            {/* Orbiting Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-slow">
              <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 animate-orbit-reverse">
              <div className="w-2 h-2 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50" />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 animate-orbit-slow" style={{ animationDelay: "1s" }}>
              <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50" />
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 animate-orbit-reverse" style={{ animationDelay: "1.5s" }}>
              <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Brand Name with Letter-by-Letter Color Animation - Positioned under orbit */}
        <div className={`mt-96 transition-all duration-500 delay-200 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl sm:text-5xl font-bold">
            <span className="inline-block animate-color-load" style={{ animationDelay: "0.1s" }}>V</span>
            <span className="inline-block animate-color-load" style={{ animationDelay: "0.15s" }}>O</span>
            <span className="inline-block animate-color-load" style={{ animationDelay: "0.2s" }}>R</span>
            <span className="inline-block animate-color-load" style={{ animationDelay: "0.25s" }}>O</span>
            <span className="inline-block animate-color-load" style={{ animationDelay: "0.3s" }}>N</span>
            <span className="inline-block animate-color-load" style={{ animationDelay: "0.35s" }}>O</span>
            <span className="inline-block animate-color-load" style={{ animationDelay: "0.4s" }}>V</span>
            <span className="inline-block animate-color-load" style={{ animationDelay: "0.45s" }}>A</span>
          </h1>
        </div>

        {/* Loading Text */}
        <div className={`mt-4 transition-all duration-300 delay-300 ${showText ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-lg sm:text-xl text-muted-foreground text-center animate-fade-in-out">
            {currentText}
          </p>
        </div>
      </div>
    </div>
  )
}
