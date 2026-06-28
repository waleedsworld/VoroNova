"use client"

import type { HabitatReport, MetricStatus } from "@/lib/habitat-analysis"
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, ArrowUpRight } from "lucide-react"

const STATUS_COLOR: Record<MetricStatus, string> = {
  excellent: "#34d399",
  good: "#4ade80",
  adequate: "#fbbf24",
  marginal: "#fb923c",
  critical: "#f87171",
}

function scoreColor(score: number): string {
  if (score >= 88) return STATUS_COLOR.excellent
  if (score >= 74) return STATUS_COLOR.good
  if (score >= 58) return STATUS_COLOR.adequate
  if (score >= 40) return STATUS_COLOR.marginal
  return STATUS_COLOR.critical
}

// Big radial gauge for the overall readiness score.
function ScoreGauge({ score, grade }: { score: number; grade: string }) {
  const size = 200
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100
  const color = scoreColor(score)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 10px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tabular-nums text-foreground" style={{ color }}>
          {score}
        </span>
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground mt-1">Readiness</span>
        <span className="mt-2 rounded-full border border-border/60 bg-background/40 px-3 py-0.5 text-sm font-semibold" style={{ color }}>
          Grade {grade}
        </span>
      </div>
    </div>
  )
}

// Custom SVG radar chart across the 5 metrics.
function RadarChart({ report }: { report: HabitatReport }) {
  const size = 300
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - 46
  const metrics = report.metrics
  const n = metrics.length
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const point = (i: number, rFrac: number) => {
    const a = angleFor(i)
    return [cx + Math.cos(a) * maxR * rFrac, cy + Math.sin(a) * maxR * rFrac]
  }
  const rings = [0.25, 0.5, 0.75, 1]
  const dataPoints = metrics.map((m, i) => point(i, m.score / 100))
  const polygon = dataPoints.map((p) => p.join(",")).join(" ")

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
      {rings.map((rf, ri) => (
        <polygon
          key={ri}
          points={metrics.map((_, i) => point(i, rf).join(",")).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth={1}
        />
      ))}
      {metrics.map((_, i) => {
        const [x, y] = point(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.09)" strokeWidth={1} />
      })}
      <polygon points={polygon} fill="rgba(251,146,60,0.18)" stroke="#fb923c" strokeWidth={2} style={{ filter: "drop-shadow(0 0 6px rgba(251,146,60,0.4))" }} />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={scoreColor(metrics[i].score)} stroke="#0b0f1a" strokeWidth={1.5} />
      ))}
      {metrics.map((m, i) => {
        const [x, y] = point(i, 1.19)
        const anchor = Math.abs(x - cx) < 4 ? "middle" : x > cx ? "start" : "end"
        const words = m.label.split(" ")
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="fill-muted-foreground" style={{ fontSize: 10, fontWeight: 600 }}>
            {words.length > 1 ? (
              <>
                <tspan x={x} dy="-0.4em">{words[0]}</tspan>
                <tspan x={x} dy="1.1em">{words.slice(1).join(" ")}</tspan>
              </>
            ) : (
              m.label
            )}
          </text>
        )
      })}
    </svg>
  )
}

const SEVERITY_META = {
  critical: { icon: ShieldAlert, color: "#f87171", label: "Critical" },
  warn: { icon: AlertTriangle, color: "#fb923c", label: "Warning" },
  info: { icon: Info, color: "#60a5fa", label: "Info" },
  pass: { icon: CheckCircle2, color: "#34d399", label: "Pass" },
} as const

const PRIORITY_COLOR = { high: "#f87171", medium: "#fbbf24", low: "#60a5fa" } as const

export function AnalysisReport({ report }: { report: HabitatReport }) {
  const d = report.derived
  return (
    <div className="space-y-6">
      {/* Hero: gauge + radar + verdict */}
      <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] items-center rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-md">
        <div className="flex justify-center">
          <ScoreGauge score={report.overall} grade={report.grade} />
        </div>
        <div className="space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Habitat Readiness Report
          </div>
          <h2 className="text-2xl font-bold text-foreground">{report.verdict}</h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Scored against NASA habitability heuristics for a crew of {d.crewCount} on a{" "}
            {d.missionDays >= 500 ? "permanent" : `${d.missionDays}-day`} {report.config.destination || "mission"}.
            Weighting reflects your stated priority: <span className="text-foreground font-medium">{report.config.priority || "balanced"}</span>.
          </p>
        </div>
        <div className="flex justify-center">
          <RadarChart report={report} />
        </div>
      </div>

      {/* Derived stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Crew", value: String(d.crewCount) },
          { label: "Duration", value: d.missionDays >= 500 ? "Perm." : `${d.missionDays}d` },
          { label: "NHV / crew", value: `${d.estimatedNhvPerCrew} m³` },
          { label: "Target / crew", value: `${d.requiredNhvPerCrew} m³` },
          { label: "Volume margin", value: `${d.volumeMarginPct >= 0 ? "+" : ""}${d.volumeMarginPct}%` },
          { label: "Mass index", value: `${(d.launchMassIndex / 1000).toFixed(1)} t` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/40 bg-card/30 p-3 text-center">
            <div className="text-lg font-bold tabular-nums text-foreground">{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Metric breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {report.metrics.map((m) => {
          const color = scoreColor(m.score)
          return (
            <div key={m.key} className="rounded-xl border border-border/50 bg-card/30 p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-foreground">{m.label}</h3>
                <span className="text-lg font-bold tabular-nums" style={{ color }}>
                  {m.score}
                  <span className="text-xs text-muted-foreground font-normal">/100</span>
                </span>
              </div>
              <div className="mt-2 mb-2 flex items-center gap-2">
                <span className="text-xs font-medium capitalize" style={{ color }}>{m.status}</span>
                <span className="text-xs text-muted-foreground">· {m.headline}</span>
              </div>
              <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: color, transition: "width 0.9s ease" }} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{m.detail}</p>
            </div>
          )
        })}
      </div>

      {/* Findings + Recommendations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Findings</h3>
          <ul className="space-y-3">
            {report.findings.map((f, i) => {
              const meta = SEVERITY_META[f.severity]
              const Icon = meta.icon
              return (
                <li key={i} className="flex gap-3">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: meta.color }} />
                  <div>
                    <div className="text-xs font-medium text-foreground">{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.detail}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/30 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Recommendations</h3>
          <ul className="space-y-3">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex gap-3">
                <ArrowUpRight className="h-4 w-4 mt-0.5 shrink-0" style={{ color: PRIORITY_COLOR[r.priority] }} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{r.title}</span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                      style={{ color: PRIORITY_COLOR[r.priority], backgroundColor: `${PRIORITY_COLOR[r.priority]}1a` }}
                    >
                      {r.priority}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
