import { Card } from "@/components/ui/card"
import { Brain, Zap, Shield, Rocket } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Driven Habitat Generation",
    description:
      "Generative AI creates floor plans and 3D models based on your inputs and real space design guidelines.",
  },
  {
    icon: Zap,
    title: "Instant Visualization",
    description: "See your ideas take shape in seconds with interactive layouts and 3D exploration.",
  },
  {
    icon: Shield,
    title: "Safe & Reliable",
    description: "Built with mission-critical considerations like life support, zoning, and crew well-being.",
  },
  {
    icon: Rocket,
    title: "Always Evolving",
    description: "Regular updates bring new materials, layouts, and planetary surface scenarios.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="mb-12 sm:mb-16 text-center">
          <h2 className="mb-4 text-balance text-3xl sm:text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Our <span className="text-primary bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base sm:text-lg text-muted-foreground">
            Smart tools that accelerate space habitat design and make problem-solving simple yet powerful.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border bg-card/50 p-4 sm:p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="mb-4 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-orange-500/20 text-primary transition-transform group-hover:scale-110 group-hover:rotate-6">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mb-2 text-lg sm:text-xl font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              <div className="absolute -right-6 -top-6 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-primary/5 to-orange-500/5 blur-2xl transition-all group-hover:from-primary/10 group-hover:to-orange-500/10" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
