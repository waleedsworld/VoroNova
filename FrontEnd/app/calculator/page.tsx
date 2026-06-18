"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StarField } from "@/components/star-field"
import {
  Users,
  CalendarDays,
  Ruler,
  Rocket,
  ArrowLeft,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react"
import {
  DESTINATIONS,
  LAUNCH_VEHICLES,
  computeVolume,
  formatVolume,
} from "@/lib/habitat-volume"

export default function CalculatorPage() {
  const [crewSize, setCrewSize] = useState(4)
  const [durationDays, setDurationDays] = useState(180)
  const [destinationId, setDestinationId] = useState(DESTINATIONS[0].id)
  const [vehicleId, setVehicleId] = useState(LAUNCH_VEHICLES[0].id)

  const destination = DESTINATIONS.find((d) => d.id === destinationId)!
  const vehicle = LAUNCH_VEHICLES.find((v) => v.id === vehicleId)!

  const result = useMemo(
    () => computeVolume(crewSize, durationDays, destination.stressFactor),
    [crewSize, durationDays, destination.stressFactor],
  )

  const maxZoneVol = Math.max(...result.zones.map((z) => z.volumeM3))
  const fitsFairing = result.pressurizedOptimal <= vehicle.usableVolumeM3
  const modulesNeeded = Math.max(1, Math.ceil(result.pressurizedOptimal / vehicle.usableVolumeM3))

  const applyDestination = (id: string) => {
    setDestinationId(id)
    const d = DESTINATIONS.find((x) => x.id === id)
    if (d) setDurationDays(d.defaultDurationDays)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <StarField />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="VoroNova" width={36} height={36} className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight text-foreground">VORONOVA</span>
          </Link>
          <Button asChild variant="outline" size="sm" className="border-primary/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back home</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="container relative z-20 mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Title */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-gradient-to-r from-primary/20 to-orange-500/20 px-4 py-2 text-sm font-medium text-primary backdrop-blur-md">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Mission Sizing Tool</span>
          </div>
          <h1 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Habitat Volume{" "}
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Calculator
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base sm:text-lg text-muted-foreground">
            Estimate the net habitable volume your crew needs before you ever draw a floor plan.
            Tune the mission and watch the requirement — and fairing fit — update live.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* Inputs */}
          <Card className="border-border bg-card/50 p-6 backdrop-blur-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-card-foreground">
              <Gauge className="h-5 w-5 text-primary" /> Mission Parameters
            </h2>

            {/* Crew size */}
            <div className="mb-7">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="crew" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" /> Crew size
                </label>
                <span className="rounded-md bg-primary/15 px-2 py-0.5 text-sm font-semibold text-primary tabular-nums">
                  {crewSize} {crewSize === 1 ? "astronaut" : "astronauts"}
                </span>
              </div>
              <input
                id="crew"
                type="range"
                min={1}
                max={12}
                step={1}
                value={crewSize}
                onChange={(e) => setCrewSize(Number(e.target.value))}
                className="voro-range w-full"
                aria-label="Crew size"
              />
            </div>

            {/* Duration */}
            <div className="mb-7">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" /> Mission duration
                </label>
                <span className="rounded-md bg-primary/15 px-2 py-0.5 text-sm font-semibold text-primary tabular-nums">
                  {durationDays} days
                </span>
              </div>
              <input
                id="duration"
                type="range"
                min={7}
                max={1000}
                step={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="voro-range w-full"
                aria-label="Mission duration in days"
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>1 week</span>
                <span>~1.4 years</span>
                <span>~2.7 years</span>
              </div>
            </div>

            {/* Destination */}
            <div className="mb-7">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Rocket className="h-4 w-4 text-primary" /> Destination
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DESTINATIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => applyDestination(d.id)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      d.id === destinationId
                        ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
                        : "border-border/60 bg-card/40 hover:border-primary/40 hover:bg-card/70"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-foreground">{d.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
                {destination.blurb}
              </p>
            </div>

            {/* Vehicle */}
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Rocket className="h-4 w-4 text-primary" /> Launch vehicle
              </p>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-lg border border-border/60 bg-card/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                aria-label="Launch vehicle"
              >
                {LAUNCH_VEHICLES.map((v) => (
                  <option key={v.id} value={v.id} className="bg-background text-foreground">
                    {v.name} — {v.fairing} (~{v.usableVolumeM3} m³)
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {/* Headline volume */}
            <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card/50 to-orange-500/5 p-6 backdrop-blur-sm">
              <div className="relative z-10">
                <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Ruler className="h-4 w-4 text-primary" /> Recommended net habitable volume
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-bold tabular-nums text-foreground">
                    {formatVolume(result.totalOptimal)}
                  </span>
                  <span className="mb-1.5 text-xl font-semibold text-muted-foreground">m³</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  ≈ {formatVolume(result.perCrew.optimal)} m³ per crew member · optimal-wellbeing tier
                </p>

                {/* Comfort tiers */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { label: "Tolerable", value: result.totalTolerable, tone: "text-amber-400" },
                    { label: "Performance", value: result.totalPerformance, tone: "text-sky-400" },
                    { label: "Optimal", value: result.totalOptimal, tone: "text-primary" },
                  ].map((t) => (
                    <div key={t.label} className="rounded-lg border border-border/50 bg-card/40 p-3 text-center">
                      <div className={`text-lg font-bold tabular-nums ${t.tone}`}>{formatVolume(t.value)}</div>
                      <div className="text-[11px] text-muted-foreground">{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            </Card>

            {/* Fairing fit */}
            <Card className={`border p-5 backdrop-blur-sm ${fitsFairing ? "border-green-500/40 bg-green-500/5" : "border-amber-500/40 bg-amber-500/5"}`}>
              <div className="flex items-start gap-3">
                {fitsFairing ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {fitsFairing
                      ? `Fits in a single ${vehicle.name} launch`
                      : `Needs ${modulesNeeded} ${vehicle.name} launches`}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Estimated pressurized volume{" "}
                    <span className="font-medium text-foreground">
                      {formatVolume(result.pressurizedOptimal)} m³
                    </span>{" "}
                    vs. ~{vehicle.usableVolumeM3} m³ usable per {vehicle.name} fairing.
                  </p>
                </div>
              </div>
            </Card>

            {/* Zone breakdown */}
            <Card className="border-border bg-card/50 p-6 backdrop-blur-sm">
              <h2 className="mb-4 text-lg font-semibold text-card-foreground">Volume by function</h2>
              <div className="space-y-3">
                {result.zones.map(({ zone, volumeM3 }) => (
                  <div key={zone.id}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-foreground">{zone.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatVolume(volumeM3)} m³
                        <span className="ml-1.5 text-xs text-muted-foreground/70">
                          {Math.round(zone.share * 100)}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-300"
                        style={{ width: `${(volumeM3 / maxZoneVol) * 100}%` }}
                        title={zone.hint}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* CTA + disclaimer */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/40 to-secondary/10 p-6 text-center backdrop-blur-sm sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-base font-semibold text-foreground">Happy with the numbers?</p>
              <p className="text-sm text-muted-foreground">Turn this target into an AI-generated floor plan.</p>
            </div>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground hover:from-primary/90 hover:to-orange-500/90 shadow-lg">
              <Link href="/app">Open the Design Studio</Link>
            </Button>
          </div>
          <p className="mt-4 flex items-start gap-1.5 text-center text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Figures are early-concept engineering estimates based on published NASA habitability
            guidance (net-habitable-volume curves scaled by mission duration and environment). Use
            them to explore trade-offs, not for flight certification.
          </p>
        </div>
      </div>

      <style jsx>{`
        .voro-range {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 9999px;
          background: color-mix(in oklab, var(--muted) 70%, transparent);
          outline: none;
        }
        .voro-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: var(--primary);
          border: 2px solid var(--background);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 35%, transparent);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .voro-range::-webkit-slider-thumb:hover {
          transform: scale(1.12);
        }
        .voro-range::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: var(--primary);
          border: 2px solid var(--background);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 35%, transparent);
          cursor: pointer;
        }
      `}</style>
    </main>
  )
}
