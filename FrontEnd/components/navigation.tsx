"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Voronova" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">VORONOVA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </a>
            <Link
              href="/app"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Prompt Now
            </Link>
            <Link
              href="/results"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Results
            </Link>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden lg:flex">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground hover:bg-primary/10"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-lg" onClick={toggleMenu} />
          <div className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-primary/95 to-primary/90 backdrop-blur-lg shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-primary-foreground/20">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="Voronova" width={32} height={32} className="h-8 w-8" />
                  <span className="text-lg font-bold text-primary-foreground">VORONOVA</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={toggleMenu}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Mobile Menu Items */}
              <div className="flex-1 flex flex-col justify-center px-6 space-y-8">
                <Link
                  href="/"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
                <a
                  href="#features"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  How It Works
                </a>
                <Link
                  href="/app"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  Prompt Now
                </Link>
                <Link
                  href="/results"
                  className="text-xl font-semibold text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  onClick={toggleMenu}
                >
                  Results
                </Link>
              </div>

              {/* Mobile CTA */}
              <div className="p-6 border-t border-primary-foreground/20">
                <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg py-6">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
