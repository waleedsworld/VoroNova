import { Button } from "@/components/ui/button"
import { OrbitSystem } from "@/components/orbit-system"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 pt-20 overflow-hidden">
      {/* Background Orbit System - only for mobile and tablet (not desktop) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 sm:opacity-50 md:opacity-70 lg:hidden">
        <div className="scale-75 sm:scale-90 md:scale-100">
          <OrbitSystem />
        </div>
      </div>

      {/* Content overlay */}
      <div className="container relative z-20 mx-auto">
        {/* Mobile and Tablet Layout */}
        <div className="lg:hidden flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-2xl mx-auto px-4">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-gradient-to-r from-primary/20 to-orange-500/20 px-5 py-3 text-sm font-medium text-primary w-fit backdrop-blur-md shadow-lg">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="font-semibold">AI-Powered Space Habitat Design</span>
          </div>

          {/* Enhanced Title with better mobile spacing */}
          <div className="space-y-4">
            <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter text-foreground">
              Think Beyond Earth, <br />
              <span className="text-primary bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                Imagine the Future
              </span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-orange-500 mx-auto rounded-full"></div>
          </div>

          {/* Enhanced Description */}
          <p className="text-pretty text-base sm:text-lg leading-relaxed text-muted-foreground max-w-lg bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50">
            Empower your journey with intelligent tools built for learners and professionals alike. Transform complex 
            habitat challenges into innovative space-ready solutions.
          </p>

          {/* Enhanced Buttons */}
          <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:gap-4">
            <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground hover:from-primary/90 hover:to-orange-500/90 group backdrop-blur-sm shadow-lg w-full sm:w-auto">
              Explore More
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>

          {/* Enhanced Stats with better mobile design */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 w-full">
            <div className="text-center bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Concepts</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Designed</div>
              <div className="text-xs text-muted-foreground mt-1">Endless possibilities for shaping future habitats.</div>
            </div>
            <div className="text-center bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Layouts</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Explored</div>
              <div className="text-xs text-muted-foreground mt-1">Interactive tools to test multiple configurations.</div>
            </div>
            <div className="text-center bg-card/30 backdrop-blur-sm p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">User</div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">Experience</div>
              <div className="text-xs text-muted-foreground mt-1">Accessible for all ages—fun for students, powerful for professionals.</div>
            </div>
          </div>

          {/* Mobile-specific call to action */}
          <div className="pt-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">Ready to shape the future of space living?</p>
            <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground hover:from-primary/90 hover:to-orange-500/90 shadow-xl">
              Start Your Journey
            </Button>
          </div>
        </div>

        {/* Desktop Layout - Original side-by-side layout */}
        <div className="hidden lg:grid grid-cols-2 gap-16">
          {/* Left content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-gradient-to-r from-primary/20 to-orange-500/20 px-4 py-2 text-sm font-medium text-primary w-fit backdrop-blur-sm shadow-lg">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>AI-Powered Space Habitat Design</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-5xl font-bold leading-tight tracking-tighter text-foreground lg:text-7xl">
                Think Beyond Earth, <br />
                <span className="text-primary bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  Imagine the Future
                </span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-orange-500 rounded-full"></div>
            </div>

            <p className="text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl max-w-2xl">
              Empower your journey with intelligent tools built for learners and professionals alike. Transform complex 
              habitat challenges into innovative space-ready solutions.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground hover:from-primary/90 hover:to-orange-500/90 group shadow-xl">
                Explore More
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10">
                Watch Demo
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">Concepts</div>
                <div className="text-sm text-muted-foreground">Designed</div>
                <div className="text-xs text-muted-foreground mt-1">Endless possibilities for shaping future habitats.</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">Layouts</div>
                <div className="text-sm text-muted-foreground">Explored</div>
                <div className="text-xs text-muted-foreground mt-1">Interactive tools to test multiple configurations.</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">User</div>
                <div className="text-sm text-muted-foreground">Experience</div>
                <div className="text-xs text-muted-foreground mt-1">Accessible for all ages—fun for students, powerful for professionals.</div>
              </div>
            </div>
          </div>

          {/* Right content - Orbit System */}
          <div className="relative flex items-center justify-center">
            <OrbitSystem />
          </div>
        </div>
      </div>
    </section>
  )
}
