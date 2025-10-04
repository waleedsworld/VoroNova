"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, Pencil, Ruler, Move, Maximize2, Check, X, GitCompare, Download, Save, Share, BarChart3, Menu } from "lucide-react"

export default function ResultsPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Voronova" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10" />
            </Link>
          </div>

          {/* Right side - Menu Button and Analyze Design Button */}
          <div className="flex items-center gap-2">
            {/* Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-primary/10"
              onClick={toggleMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* Analyze Design Button */}
            <Button className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground hover:from-primary/90 hover:to-orange-500/90">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Analyze Design</span>
              <span className="sm:hidden">Analyze</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Right Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-lg" onClick={toggleMenu} />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-primary/95 to-primary/90 backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
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

              {/* Navigation Items */}
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

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-primary-foreground/20">
                <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg py-6">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Tools & Suggestions */}
        <div className="w-full lg:w-80 border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-border/50 bg-card/50">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Design Analysis
            </h2>
            <p className="text-xs text-muted-foreground mt-1">AI-powered design optimization suggestions</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* AI Suggestions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
              
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/30 border border-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground">Optimize Solar Array</h4>
                </div>
                <p className="text-xs text-muted-foreground pl-8">
                  Relocate solar panels 15° clockwise for optimal sun exposure
                </p>
                <div className="flex gap-2 pl-8">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-border/50 bg-transparent">
                    Apply
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    Dismiss
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/30 border border-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground">Expand Living Quarters</h4>
                </div>
                <p className="text-xs text-muted-foreground pl-8">
                  Increase living quarters by 20% to meet crew requirements
                </p>
                <div className="flex gap-2 pl-8">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-border/50 bg-transparent">
                    Apply
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    Dismiss
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-card/30 p-3 space-y-2">
                <h4 className="text-sm font-medium text-foreground">Add Redundancy</h4>
                <p className="text-xs text-muted-foreground">
                  Consider adding backup power systems for critical operations
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-border/50 bg-transparent">
                    Apply
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>

            {/* Design Metrics */}
            <div className="pt-4 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-3">Design Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Efficiency Score</span>
                    <span className="text-foreground font-medium">87%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "87%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Safety Rating</span>
                    <span className="text-foreground font-medium">92%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Cost Optimization</span>
                    <span className="text-foreground font-medium">78%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/50 bg-card/50">
            <div className="flex flex-col gap-2">
              <Button className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 w-full">
                <Check className="h-4 w-4 mr-2" />
                Accept All Changes
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="border-primary/50 bg-transparent hover:bg-primary/10 flex-1">
                  <Pencil className="h-4 w-4 mr-2" />
                  Revise
                </Button>
                <Button variant="outline" className="border-primary/50 bg-transparent hover:bg-primary/10 flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <label htmlFor="image-upload">
                  <Button variant="outline" className="border-border/50 cursor-pointer bg-transparent" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Upload Design</span>
                      <span className="sm:hidden">Upload</span>
                    </span>
                  </Button>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

                <div className="flex items-center gap-1">
                  <Button
                    variant={activeTool === "pencil" ? "default" : "outline"}
                    size="icon"
                    className="border-border/50 h-8 w-8"
                    onClick={() => setActiveTool(activeTool === "pencil" ? null : "pencil")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={activeTool === "ruler" ? "default" : "outline"}
                    size="icon"
                    className="border-border/50 h-8 w-8"
                    onClick={() => setActiveTool(activeTool === "ruler" ? null : "ruler")}
                  >
                    <Ruler className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={activeTool === "move" ? "default" : "outline"}
                    size="icon"
                    className="border-border/50 h-8 w-8"
                    onClick={() => setActiveTool(activeTool === "move" ? null : "move")}
                  >
                    <Move className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={activeTool === "resize" ? "default" : "outline"}
                    size="icon"
                    className="border-border/50 h-8 w-8"
                    onClick={() => setActiveTool(activeTool === "resize" ? null : "resize")}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-border/50 bg-transparent"
                  onClick={() => setShowComparison(!showComparison)}
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{showComparison ? "Single View" : "Compare"}</span>
                  <span className="sm:hidden">{showComparison ? "Single" : "Compare"}</span>
                </Button>
                <Button variant="outline" className="border-border/50 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-gradient-to-br from-background to-primary/5 relative overflow-hidden">
            {/* Background stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-primary/20 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>

            {showComparison ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-full">
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Original Design</h3>
                  <div className="flex-1 rounded-lg border border-border/50 bg-card/30 flex items-center justify-center relative overflow-hidden">
                    {uploadedImage ? (
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">Upload your design</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Optimized Design</h3>
                  <div className="flex-1 rounded-lg border border-border/50 bg-card/30 flex items-center justify-center relative overflow-hidden">
                    {uploadedImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Revised"
                          className="w-full h-full object-contain opacity-90"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-primary/20 border-2 border-primary rounded-lg px-4 py-2">
                            <p className="text-xs text-primary font-medium">AI Optimizations Applied</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Optimized version will appear here</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-full flex items-center justify-center p-4">
                {uploadedImage ? (
                  <div className="relative w-full h-full max-w-4xl">
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Design"
                      className="w-full h-full object-contain"
                    />
                    {/* Annotation markers */}
                    <div className="absolute top-1/4 left-1/3 w-8 h-8 rounded-full bg-primary/30 border-2 border-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div className="absolute top-1/2 right-1/3 w-8 h-8 rounded-full bg-primary/30 border-2 border-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">Upload Your Habitat Design</p>
                      <p className="text-sm text-muted-foreground">
                        Upload an image to start analyzing and optimizing your space habitat design
                      </p>
                    </div>
                    <label htmlFor="image-upload-center">
                      <Button className="bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 cursor-pointer" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                    <input
                      id="image-upload-center"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-4 border-t border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                <Check className="h-4 w-4 mr-2" />
                Accept Design
              </Button>
              <Button size="lg" variant="outline" className="border-border/50 bg-transparent">
                <Pencil className="h-4 w-4 mr-2" />
                Request Revisions
              </Button>
              <Button size="lg" variant="outline" className="border-border/50 bg-transparent">
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
