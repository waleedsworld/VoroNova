import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://voronova.waleeds.world"),
  title: {
    default: "VoroNova — AI-Powered Space Habitat Design",
    template: "%s · VoroNova",
  },
  description:
    "VoroNova turns complex space-habitat engineering into an interactive, AI-assisted design studio. Generate NASA-grade floor plans, visualize them in 2D/3D, and iterate in seconds — built for students, engineers, and dreamers alike.",
  keywords: [
    "space habitat design",
    "AI floor plan generator",
    "NASA space architecture",
    "2D to 3D habitat",
    "space engineering tools",
    "VoroNova",
  ],
  authors: [{ name: "Waleed Ajmal" }],
  creator: "Waleed Ajmal",
  applicationName: "VoroNova",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    title: "VoroNova — AI-Powered Space Habitat Design",
    description:
      "Design, visualize and optimize space habitats with AI trained on authentic NASA schematics.",
    siteName: "VoroNova",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "VoroNova" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoroNova — AI-Powered Space Habitat Design",
    description:
      "Design, visualize and optimize space habitats with AI trained on authentic NASA schematics.",
    images: ["/logo.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a14",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
