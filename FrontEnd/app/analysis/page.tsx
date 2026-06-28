"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { analyzeHabitat, MISSION_STORAGE_KEY, type MissionConfig } from "@/lib/habitat-analysis"
import { AnalysisReport } from "@/components/analysis/analysis-report"
import { ArrowLeft, Download, Printer, RefreshCw, SlidersHorizontal, Rocket } from "lucide-react"

const OPTIONS = {
  destination: ["Mars Transit", "Lunar Surface", "Deep Space", "Asteroid Mining"],
  crewSize: ["Two", "Four", "Six", "Eight+"],
  missionDuration: ["30 Days", "90 Days", "180 Days", "Long-Term"],
  structureType: ["Inflatable", "Metallic", "Hybrid"],
  fairingSize: ["4.5m", "8.4m", "10m+", "Custom"],
  priority: ["Mass", "Volume", "Task Performance", "Crew Health/Safety"],
}

const ALL_ZONES = ["Residential", "Commercial", "Industrial", "Research", "Medical", "Agricultural"]

const DEFAULT_CONFIG: MissionConfig = {
  destination: "Mars Transit",
  crewSize: "Four",
  missionDuration: "180 Days",
  structureType: "Hybrid",
  fairingSize: "8.4m",
  priority: "Crew Health/Safety",
  selectedZones: ["Residential", "Research", "Medical", "Agricultural"],
  zoneConfigurations: [],
}

function OptionRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
              value === o
                ? "border-primary bg-primary/15 text-primary font-medium"
                : "border-border/50 bg-card/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  const [config, setConfig] = useState<MissionConfig>(DEFAULT_CONFIG)
  const [loadedFromStudio, setLoadedFromStudio] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(MISSION_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as MissionConfig
        if (parsed && parsed.selectedZones) {
          setConfig({ ...DEFAULT_CONFIG, ...parsed })
          setLoadedFromStudio(true)
          return
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setShowConfig(true)
  }, [])

  const report = useMemo(() => analyzeHabitat(config), [config])

  const update = (key: keyof MissionConfig, value: string) =>
    setConfig((c) => ({ ...c, [key]: value }))

  const toggleZone = (z: string) =>
    setConfig((c) => ({
      ...c,
      selectedZones: c.selectedZones.includes(z)
        ? c.selectedZones.filter((x) => x !== z)
        : [...c.selectedZones, z],
    }))

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `voronova-readiness-${report.overall}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-lg print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/app" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Studio</span>
            </Link>
            <div className="h-5 w-px bg-border" />
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="VoroNova" width={28} height={28} className="h-7 w-7" />
              <span className="text-sm font-bold tracking-wide text-foreground hidden sm:inline">VORONOVA</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="border-border/60 bg-transparent" onClick={() => setShowConfig((s) => !s)}>
              <SlidersHorizontal className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">{showConfig ? "Hide" : "Mission"}</span>
            </Button>
            <Button size="sm" variant="outline" className="border-border/60 bg-transparent" onClick={downloadJson}>
              <Download className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">JSON</span>
            </Button>
            <Button size="sm" variant="outline" className="border-border/60 bg-transparent" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Design Analysis
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loadedFromStudio
              ? "Analyzing the mission you configured in the studio. Adjust parameters to explore trade-offs."
              : "No studio mission found — using a sample configuration. Tune the parameters below to score your own concept."}
          </p>
        </div>

        {/* Config panel */}
        {showConfig && (
          <div className="mb-6 rounded-2xl border border-border/50 bg-card/40 p-5 backdrop-blur-md print:hidden">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <OptionRow label="Destination" value={config.destination} options={OPTIONS.destination} onChange={(v) => update("destination", v)} />
              <OptionRow label="Crew Size" value={config.crewSize} options={OPTIONS.crewSize} onChange={(v) => update("crewSize", v)} />
              <OptionRow label="Duration" value={config.missionDuration} options={OPTIONS.missionDuration} onChange={(v) => update("missionDuration", v)} />
              <OptionRow label="Structure" value={config.structureType} options={OPTIONS.structureType} onChange={(v) => update("structureType", v)} />
              <OptionRow label="Fairing" value={config.fairingSize} options={OPTIONS.fairingSize} onChange={(v) => update("fairingSize", v)} />
              <OptionRow label="Priority" value={config.priority} options={OPTIONS.priority} onChange={(v) => update("priority", v)} />
            </div>
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Zones</div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_ZONES.map((z) => (
                  <button
                    key={z}
                    onClick={() => toggleZone(z)}
                    className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                      config.selectedZones.includes(z)
                        ? "border-primary bg-primary/15 text-primary font-medium"
                        : "border-border/50 bg-card/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-border/60 bg-transparent" onClick={() => setConfig(DEFAULT_CONFIG)}>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Reset sample
              </Button>
              <Link href="/app">
                <Button size="sm" className="bg-gradient-to-r from-primary to-orange-500">Open Studio</Button>
              </Link>
            </div>
          </div>
        )}

        <AnalysisReport report={report} />

        <p className="mt-8 text-center text-[11px] text-muted-foreground/70 max-w-2xl mx-auto">
          Scores are engineering estimates derived from published NASA habitability heuristics (net habitable volume
          curves, functional zoning, and launch-mass proxies) and are intended for conceptual design exploration, not
          flight certification.
        </p>
      </main>
    </div>
  )
}
