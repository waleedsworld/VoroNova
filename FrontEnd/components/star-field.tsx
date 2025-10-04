"use client"

import type React from "react"

// Pre-defined star positions to avoid hydration mismatch
const starPositions = [
  { left: "8.36%", top: "6.01%", size: 1.2, delay: "0.67s", duration: "2.84s" },
  { left: "91.10%", top: "76.75%", size: 1.8, delay: "0.48s", duration: "3.23s" },
  { left: "0.59%", top: "4.50%", size: 1.1, delay: "2.26s", duration: "2.34s" },
  { left: "68.43%", top: "56.52%", size: 2.0, delay: "2.70s", duration: "3.09s" },
  { left: "13.09%", top: "6.24%", size: 1.5, delay: "1.50s", duration: "2.48s" },
  { left: "14.64%", top: "38.20%", size: 1.3, delay: "0.70s", duration: "3.30s" },
  { left: "98.40%", top: "87.49%", size: 1.9, delay: "0.30s", duration: "3.47s" },
  { left: "26.52%", top: "20.92%", size: 1.4, delay: "2.80s", duration: "3.08s" },
  { left: "24.71%", top: "22.36%", size: 1.6, delay: "1.93s", duration: "3.38s" },
  { left: "43.64%", top: "29.40%", size: 1.7, delay: "0.77s", duration: "3.27s" },
  { left: "96.49%", top: "1.73%", size: 1.1, delay: "1.01s", duration: "3.61s" },
  { left: "49.50%", top: "1.45%", size: 1.8, delay: "0.03s", duration: "3.24s" },
  { left: "38.52%", top: "21.81%", size: 1.2, delay: "2.19s", duration: "3.60s" },
  { left: "3.14%", top: "66.76%", size: 1.9, delay: "2.70s", duration: "2.56s" },
  { left: "18.89%", top: "35.57%", size: 1.5, delay: "2.82s", duration: "3.28s" },
  { left: "37.07%", top: "57.34%", size: 1.3, delay: "0.27s", duration: "3.40s" },
  { left: "30.01%", top: "64.78%", size: 1.6, delay: "0.73s", duration: "2.68s" },
  { left: "31.27%", top: "71.72%", size: 1.4, delay: "1.90s", duration: "2.70s" },
  { left: "91.49%", top: "58.29%", size: 1.7, delay: "0.53s", duration: "3.18s" },
  { left: "89.74%", top: "70.88%", size: 1.8, delay: "2.48s", duration: "2.85s" },
  { left: "47.44%", top: "78.43%", size: 1.1, delay: "0.27s", duration: "3.39s" },
  { left: "4.46%", top: "42.57%", size: 1.9, delay: "0.02s", duration: "2.72s" },
  { left: "22.58%", top: "68.91%", size: 1.3, delay: "0.11s", duration: "3.87s" },
  { left: "31.03%", top: "43.98%", size: 1.6, delay: "2.27s", duration: "3.32s" },
  { left: "88.51%", top: "31.18%", size: 1.4, delay: "1.30s", duration: "3.62s" },
  { left: "26.63%", top: "79.40%", size: 1.7, delay: "2.48s", duration: "2.01s" },
  { left: "93.79%", top: "25.47%", size: 1.2, delay: "1.44s", duration: "4.21s" },
  { left: "67.41%", top: "53.97%", size: 1.8, delay: "2.96s", duration: "3.57s" },
  { left: "70.57%", top: "20.93%", size: 1.5, delay: "1.28s", duration: "4.23s" },
  { left: "25.26%", top: "11.71%", size: 1.3, delay: "0.94s", duration: "4.48s" },
  { left: "95.32%", top: "98.30%", size: 1.9, delay: "1.42s", duration: "4.16s" },
  { left: "1.56%", top: "76.32%", size: 1.1, delay: "0.17s", duration: "3.97s" },
  { left: "11.56%", top: "61.30%", size: 1.6, delay: "1.75s", duration: "3.85s" },
  { left: "13.85%", top: "74.49%", size: 1.4, delay: "2.62s", duration: "2.76s" },
  { left: "94.41%", top: "66.15%", size: 1.7, delay: "1.03s", duration: "2.76s" },
  { left: "44.12%", top: "3.39%", size: 1.2, delay: "2.14s", duration: "3.18s" },
  { left: "48.08%", top: "99.67%", size: 1.8, delay: "1.27s", duration: "4.92s" },
  { left: "2.39%", top: "80.41%", size: 1.5, delay: "1.78s", duration: "3.98s" },
  { left: "44.03%", top: "47.60%", size: 1.3, delay: "0.29s", duration: "2.54s" },
  { left: "48.97%", top: "38.52%", size: 1.6, delay: "1.53s", duration: "4.02s" }
]

export function StarField() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {starPositions.map((star, i) => (
        <div
          key={i}
          className="star-twinkle absolute rounded-full bg-white"
          style={
            {
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              "--twinkle-duration": star.duration,
              animationDelay: star.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
