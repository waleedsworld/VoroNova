import Image from "next/image"
import Link from "next/link"
import { Github, Rocket } from "lucide-react"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative z-20 border-t border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="VoroNova" width={36} height={36} className="h-9 w-9" />
              <span className="text-xl font-bold tracking-tight text-foreground">VORONOVA</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              An AI-powered design studio for space habitats — trained on authentic NASA schematics so
              anyone can dream up, visualize and refine life beyond Earth.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:gap-16">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Explore</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
                </li>
                <li>
                  <Link href="/app" className="transition-colors hover:text-foreground">Design Studio</Link>
                </li>
                <li>
                  <Link href="/results" className="transition-colors hover:text-foreground">Results</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Project</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://github.com/waleedsworld/VoroNova"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                  >
                    <Github className="h-4 w-4" /> Source
                  </a>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Rocket className="h-4 w-4 text-primary" /> NASA Space Apps
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} VoroNova. Crafted for the next generation of space explorers.</p>
          <p>Built with Next.js &amp; a Flask AI backend.</p>
        </div>
      </div>
    </footer>
  )
}
