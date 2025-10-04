"use client"

import type React from "react"

import { useRef } from "react"

export function OrbitSystem() {
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={canvasRef} className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full">
      {/* Central planet */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="pulse-glow relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 rounded-full bg-gradient-to-br from-primary via-orange-600 to-red-600 shadow-2xl shadow-primary/50">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-transparent" />
          {/* Surface details */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-500/30 to-transparent blur-sm" />
        </div>
      </div>

      {/* Orbit rings */}
      <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] sm:h-[250px] sm:w-[250px] md:h-[300px] md:w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20" />
      <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] sm:h-[350px] sm:w-[350px] md:h-[400px] md:w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
      <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] sm:h-[450px] sm:w-[450px] md:h-[500px] md:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5" />

      {/* Orbiting planets */}
      <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] sm:h-[250px] sm:w-[250px] md:h-[300px] md:w-[300px] -translate-x-1/2 -translate-y-1/2">
        <div
          className="orbit-path"
          style={{ "--orbit-radius": "100px", "--orbit-duration": "15s" } as React.CSSProperties}
        >
          <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50" />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] sm:h-[350px] sm:w-[350px] md:h-[400px] md:w-[400px] -translate-x-1/2 -translate-y-1/2">
        <div
          className="orbit-path-reverse"
          style={{ "--orbit-radius": "140px", "--orbit-duration": "20s" } as React.CSSProperties}
        >
          <div className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 shadow-lg shadow-cyan-400/50" />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] sm:h-[450px] sm:w-[450px] md:h-[500px] md:w-[500px] -translate-x-1/2 -translate-y-1/2">
        <div
          className="orbit-path"
          style={{ "--orbit-radius": "180px", "--orbit-duration": "25s" } as React.CSSProperties}
        >
          <div className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/50" />
        </div>
      </div>

      {/* Floating data points */}
      <div className="absolute left-[20%] top-[30%] float-animation">
        <div className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
      </div>
      <div className="absolute right-[25%] top-[40%] float-animation" style={{ animationDelay: "1s" }}>
        <div className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
      </div>
      <div className="absolute left-[30%] bottom-[35%] float-animation" style={{ animationDelay: "2s" }}>
        <div className="h-1 w-1 sm:h-2 sm:w-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
      </div>
    </div>
  )
}
