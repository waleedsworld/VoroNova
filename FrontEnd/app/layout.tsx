import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { SkipLink } from "@/components/skip-link"
import { StructuredData } from "@/components/structured-data"
import "./globals.css"
import "./robustness.css"

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
  authors: [{ name: "Waleed Ajmal", url: "https://github.com/waleedsworld" }],
  creator: "Waleed Ajmal",
  publisher: "Waleed Ajmal",
  applicationName: "VoroNova",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "https://voronova.waleeds.world",
    title: "VoroNova — AI-Powered Space Habitat Design",
    description:
      "Design, visualize and optimize space habitats with AI trained on authentic NASA schematics.",
    siteName: "VoroNova",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VoroNova — AI-Powered Space Habitat Design Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoroNova — AI-Powered Space Habitat Design",
    description:
      "Design, visualize and optimize space habitats with AI trained on authentic NASA schematics.",
    images: ["/og-image.png"],
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
        <SkipLink />
        <StructuredData />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
