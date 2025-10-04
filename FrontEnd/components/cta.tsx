import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="relative py-24 px-6">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/50 to-secondary/10 p-12 backdrop-blur-sm lg:p-16">
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Ready to Shape the Future of Space Living?
            </h2>
            <p className="mb-8 text-pretty text-lg text-muted-foreground">
              Join learners, dreamers, and experts experimenting with next-generation space habitats.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground hover:from-primary/90 hover:to-orange-500/90 group shadow-xl">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10">
                Schedule Demo
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
        </div>
      </div>
    </section>
  )
}
