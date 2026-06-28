// Habitat Readiness Analysis Engine
// -----------------------------------------------------------------------------
// A deterministic, explainable scoring model for space-habitat designs.
//
// This replaces the previously hard-coded "Design Metrics" placeholders with a
// real analysis grounded in published NASA human-spaceflight habitability
// heuristics:
//   * Net Habitable Volume (NHV) targets that scale with mission duration,
//     anchored on the Celentano/NASA-STD-3001 performance & optimal curves
//     (~20 m3/crew short-duration performance limit -> ~40+ m3/crew for
//     long-duration/permanent habitats).
//   * Functional zoning best-practice: separation of "clean vs. dirty",
//     "quiet vs. noisy", and presence of life-critical functions
//     (life support / medical / food) as required by long-duration missions.
//   * Launch feasibility as a function of fairing diameter and structure type
//     (inflatable soft-goods deploy to larger volumes per unit launch mass than
//     rigid metallic pressure vessels).
//
// Everything here is pure and deterministic: the same MissionConfig always
// produces the same HabitatReport, so results are reproducible and testable.
// -----------------------------------------------------------------------------

export interface MissionConfig {
  destination: string
  crewSize: string
  missionDuration: string
  structureType: string
  fairingSize: string
  priority: string
  selectedZones: string[]
  zoneConfigurations?: Array<{
    zoneName: string
    interfaceCount: number
    separationNames: string[]
  }>
}

export type MetricStatus = "excellent" | "good" | "adequate" | "marginal" | "critical"

export interface MetricScore {
  key: string
  label: string
  score: number // 0-100
  status: MetricStatus
  headline: string
  detail: string
  unit?: string
}

export interface Finding {
  severity: "pass" | "info" | "warn" | "critical"
  title: string
  detail: string
}

export interface Recommendation {
  priority: "high" | "medium" | "low"
  title: string
  detail: string
}

export interface HabitatReport {
  generatedAt: string
  overall: number
  grade: string
  verdict: string
  metrics: MetricScore[]
  findings: Finding[]
  recommendations: Recommendation[]
  derived: {
    crewCount: number
    missionDays: number
    requiredNhvPerCrew: number
    requiredNhvTotal: number
    estimatedNhvTotal: number
    estimatedNhvPerCrew: number
    volumeMarginPct: number
    zoneCount: number
    compartmentCount: number
    fairingDiameter: number
    launchMassIndex: number
  }
  config: MissionConfig
}

// --- normalization helpers ---------------------------------------------------

function normCrew(v: string): number {
  const s = (v || "").toLowerCase()
  if (s.includes("two") || s.startsWith("2")) return 2
  if (s.includes("four") || s.startsWith("4")) return 4
  if (s.includes("six") || s.startsWith("6")) return 6
  if (s.includes("eight") || s.includes("8")) return 8
  const n = parseInt(s.replace(/[^0-9]/g, ""), 10)
  return Number.isFinite(n) && n > 0 ? n : 4
}

function normDays(v: string): number {
  const s = (v || "").toLowerCase()
  if (s.includes("long")) return 500
  const n = parseInt(s.replace(/[^0-9]/g, ""), 10)
  return Number.isFinite(n) && n > 0 ? n : 90
}

// Required Net Habitable Volume per crew member (m3), scaled by duration.
// Anchored on NASA habitability curves: ~20 m3/crew is the short-duration
// performance limit; long-duration and permanent habitats trend toward
// ~40 m3/crew for sustained crew performance and well-being.
function requiredNhvPerCrew(days: number): number {
  if (days <= 30) return 20
  if (days <= 90) return 27
  if (days <= 180) return 33
  if (days <= 365) return 38
  return 43
}

function normFairing(v: string): number {
  const s = (v || "").toLowerCase()
  if (s.includes("4.5")) return 4.5
  if (s.includes("8.4")) return 8.4
  if (s.includes("10")) return 10
  return 8.4 // Custom / unknown -> assume mainstream heavy-lift class
}

// Deployed pressurized volume proxy (m3) from fairing diameter + structure.
// Metallic modules are constrained by the rigid fairing envelope; inflatable
// soft-goods deploy well beyond the stowed diameter; hybrid sits between.
function pressurizedVolume(diameter: number, structure: string): number {
  const s = (structure || "").toLowerCase()
  // Base rigid module: cylinder ~2.2x diameter long, at fairing bore.
  const r = diameter / 2
  const rigid = Math.PI * r * r * (diameter * 2.2)
  if (s.includes("inflat")) return rigid * 2.4
  if (s.includes("hybrid")) return rigid * 1.6
  return rigid // metallic / default
}

// Fraction of pressurized volume that becomes usable Net Habitable Volume
// after subtracting structure, systems, stowage, and outfitting.
function nhvEfficiency(structure: string): number {
  const s = (structure || "").toLowerCase()
  if (s.includes("inflat")) return 0.62
  if (s.includes("hybrid")) return 0.58
  return 0.55 // metallic
}

function statusFromScore(score: number): MetricStatus {
  if (score >= 88) return "excellent"
  if (score >= 74) return "good"
  if (score >= 58) return "adequate"
  if (score >= 40) return "marginal"
  return "critical"
}

function gradeFromScore(score: number): string {
  if (score >= 93) return "A+"
  if (score >= 88) return "A"
  if (score >= 82) return "A-"
  if (score >= 76) return "B+"
  if (score >= 70) return "B"
  if (score >= 64) return "B-"
  if (score >= 57) return "C+"
  if (score >= 50) return "C"
  if (score >= 42) return "C-"
  if (score >= 34) return "D"
  return "F"
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n))
}

// Categorize a zone name into a functional role for zoning analysis.
function zoneRole(name: string): string {
  const s = (name || "").toLowerCase()
  if (s.includes("resid") || s.includes("living") || s.includes("sleep") || s.includes("crew")) return "living"
  if (s.includes("medic") || s.includes("infirm") || s.includes("health")) return "medical"
  if (s.includes("agri") || s.includes("green") || s.includes("food") || s.includes("hydro")) return "food"
  if (s.includes("research") || s.includes("lab") || s.includes("science")) return "research"
  if (s.includes("indust") || s.includes("workshop") || s.includes("mainten") || s.includes("storage")) return "work"
  if (s.includes("commerc") || s.includes("office") || s.includes("confer")) return "ops"
  return "other"
}

// -----------------------------------------------------------------------------
// Main entry point
// -----------------------------------------------------------------------------

export function analyzeHabitat(config: MissionConfig): HabitatReport {
  const crewCount = normCrew(config.crewSize)
  const missionDays = normDays(config.missionDuration)
  const diameter = normFairing(config.fairingSize)
  const zones = config.selectedZones || []
  const zoneCount = zones.length
  const roles = new Set(zones.map(zoneRole))

  const compartmentCount = (config.zoneConfigurations || []).reduce(
    (acc, z) => acc + (z.separationNames?.length || z.interfaceCount || 0),
    0,
  )

  // --- Volume adequacy -------------------------------------------------------
  const reqPer = requiredNhvPerCrew(missionDays)
  const reqTotal = reqPer * crewCount
  const pressurized = pressurizedVolume(diameter, config.structureType)
  const estNhvTotal = pressurized * nhvEfficiency(config.structureType)
  const estPer = estNhvTotal / crewCount
  const volumeRatio = estNhvTotal / reqTotal
  const volumeMarginPct = (volumeRatio - 1) * 100
  // 1.0x = meets requirement (score ~72); 1.5x+ = excellent; <0.7x = critical.
  const volumeScore = clamp(38 + (volumeRatio - 0.7) * 70)

  // --- Functional zoning & safety -------------------------------------------
  let zoningScore = 30
  const hasLiving = roles.has("living")
  const hasMedical = roles.has("medical")
  const hasFood = roles.has("food")
  const hasWork = roles.has("work") || roles.has("research") || roles.has("ops")
  if (hasLiving) zoningScore += 22
  if (hasWork) zoningScore += 14
  // Long missions need medical + food-production self-sufficiency.
  const needsSelfSufficiency =
    missionDays >= 180 ||
    config.destination.toLowerCase().includes("deep") ||
    config.destination.toLowerCase().includes("mars")
  if (hasMedical) zoningScore += needsSelfSufficiency ? 18 : 10
  if (hasFood) zoningScore += needsSelfSufficiency ? 16 : 8
  // Reward separation of clean(living/food) vs dirty(work) functions.
  if (hasLiving && hasWork) zoningScore += 8
  // Reward defined compartments (real internal separations).
  if (compartmentCount >= crewCount) zoningScore += 6
  zoningScore = clamp(zoningScore)

  // --- Life-support & resilience --------------------------------------------
  // Longer & farther missions demand closed-loop food + medical redundancy.
  let lifeSupportScore = 55
  if (hasFood) lifeSupportScore += needsSelfSufficiency ? 22 : 12
  else if (needsSelfSufficiency) lifeSupportScore -= 18
  if (hasMedical) lifeSupportScore += 12
  else if (needsSelfSufficiency) lifeSupportScore -= 10
  // Crew redundancy: very small crews are fragile on long missions.
  if (crewCount >= 4) lifeSupportScore += 6
  if (crewCount < 3 && missionDays >= 180) lifeSupportScore -= 8
  lifeSupportScore = clamp(lifeSupportScore)

  // --- Launch / mass feasibility --------------------------------------------
  // Larger fairings and inflatable soft-goods deliver more habitable volume per
  // unit launch mass. Metallic vessels are heaviest per m3.
  const s = (config.structureType || "").toLowerCase()
  const massPerM3 = s.includes("inflat") ? 6.5 : s.includes("hybrid") ? 9.5 : 13 // kg per m3 (proxy)
  const launchMassIndex = Math.round(pressurized * massPerM3)
  // Feasibility drops if required volume forces an oversized/over-mass build.
  let massScore = 84
  if (volumeRatio > 2.2) massScore -= 22 // grossly oversized for crew
  else if (volumeRatio > 1.7) massScore -= 10
  if (s.includes("inflat")) massScore += 8
  if (s.includes("metal")) massScore -= 6
  if (diameter >= 10) massScore -= 4 // super-heavy fairing availability risk
  massScore = clamp(massScore)

  // --- Crew well-being -------------------------------------------------------
  // Private volume per crew, presence of restorative/recreation-capable zones,
  // and crowding all drive long-duration psychological outcomes.
  let wellbeingScore = clamp(30 + (estPer / reqPer) * 45)
  if (roles.has("food") || roles.has("research")) wellbeingScore += 6 // meaningful activity
  if (hasLiving && compartmentCount >= crewCount) wellbeingScore += 10 // private crew quarters
  if (crewCount >= 8 && zoneCount < 4) wellbeingScore -= 8 // crowding without zoning
  if (missionDays >= 365 && !hasFood) wellbeingScore -= 6
  wellbeingScore = clamp(wellbeingScore)

  const metrics: MetricScore[] = [
    {
      key: "volume",
      label: "Volume Adequacy",
      score: Math.round(volumeScore),
      status: statusFromScore(volumeScore),
      headline: `${estPer.toFixed(1)} m³/crew vs ${reqPer} m³ target`,
      detail:
        `Estimated Net Habitable Volume is ${Math.round(estNhvTotal)} m³ total ` +
        `(${estPer.toFixed(1)} m³ per crew member). For a ${missionDays >= 500 ? "permanent" : missionDays + "-day"} ` +
        `mission NASA habitability curves target ~${reqPer} m³/crew, a ${reqTotal} m³ total requirement — ` +
        `giving a ${volumeMarginPct >= 0 ? "+" : ""}${volumeMarginPct.toFixed(0)}% margin.`,
      unit: "m³/crew",
    },
    {
      key: "zoning",
      label: "Zoning & Safety",
      score: Math.round(zoningScore),
      status: statusFromScore(zoningScore),
      headline: `${zoneCount} zones · ${roles.size} functional roles`,
      detail:
        `Design defines ${zoneCount} zone(s) covering ${roles.size} functional role(s)` +
        `${compartmentCount ? ` and ${compartmentCount} internal compartment(s)` : ""}. ` +
        `Clean/dirty separation is ${hasLiving && hasWork ? "present" : "incomplete"}; ` +
        `life-critical functions are ${hasMedical && hasFood ? "fully covered" : `${hasMedical ? "" : "missing medical"}${!hasMedical && !hasFood ? ", " : ""}${hasFood ? "" : "missing food-production"}`}.`,
    },
    {
      key: "lifesupport",
      label: "Life Support & Resilience",
      score: Math.round(lifeSupportScore),
      status: statusFromScore(lifeSupportScore),
      headline: needsSelfSufficiency ? "Self-sufficiency required" : "Resupply-tolerant profile",
      detail:
        `${needsSelfSufficiency ? "This destination/duration demands closed-loop resilience. " : "Shorter missions tolerate resupply. "}` +
        `Food production is ${hasFood ? "included" : "absent"}; on-site medical care is ${hasMedical ? "included" : "absent"}; ` +
        `crew of ${crewCount} provides ${crewCount >= 4 ? "workable" : "thin"} operational redundancy.`,
    },
    {
      key: "mass",
      label: "Launch Feasibility",
      score: Math.round(massScore),
      status: statusFromScore(massScore),
      headline: `~${(launchMassIndex / 1000).toFixed(1)} t structural index · ${diameter} m fairing`,
      detail:
        `A ${config.structureType || "metallic"} structure in a ${diameter} m fairing yields ~${Math.round(pressurized)} m³ ` +
        `pressurized volume at ~${massPerM3} kg/m³ (structural mass index ≈ ${(launchMassIndex / 1000).toFixed(1)} t). ` +
        `${volumeRatio > 1.7 ? "The build is oversized for the crew, wasting launch mass. " : "Volume is well matched to launch capacity. "}`,
    },
    {
      key: "wellbeing",
      label: "Crew Well-being",
      score: Math.round(wellbeingScore),
      status: statusFromScore(wellbeingScore),
      headline: `${estPer.toFixed(0)} m³ personal space envelope`,
      detail:
        `Per-crew volume, private-quarters provision, and restorative activity drive long-duration morale. ` +
        `Private compartments are ${hasLiving && compartmentCount >= crewCount ? "provided" : "not clearly provided"}; ` +
        `meaningful activity space is ${roles.has("food") || roles.has("research") ? "present" : "limited"}.`,
    },
  ]

  // Priority-weighted overall score, honoring the user's stated tradeoff.
  const priority = (config.priority || "").toLowerCase()
  const weights: Record<string, number> = { volume: 1, zoning: 1, lifesupport: 1, mass: 1, wellbeing: 1 }
  if (priority.includes("mass")) weights.mass = 2.0
  else if (priority.includes("volume")) weights.volume = 2.0
  else if (priority.includes("task") || priority.includes("performance")) {
    weights.zoning = 1.7
    weights.lifesupport = 1.5
  } else if (priority.includes("health") || priority.includes("safety")) {
    weights.wellbeing = 1.8
    weights.lifesupport = 1.8
  }
  const wSum = Object.values(weights).reduce((a, b) => a + b, 0)
  const overall = Math.round(
    metrics.reduce((acc, m) => acc + m.score * (weights[m.key] || 1), 0) / wSum,
  )

  // --- Findings --------------------------------------------------------------
  const findings: Finding[] = []
  if (volumeRatio < 0.85) {
    findings.push({
      severity: "critical",
      title: "Insufficient habitable volume",
      detail: `Only ${estPer.toFixed(1)} m³/crew against a ${reqPer} m³ target. Prolonged crowding degrades crew performance and health.`,
    })
  } else if (volumeRatio < 1.05) {
    findings.push({
      severity: "warn",
      title: "Volume near the minimum threshold",
      detail: `The design meets the NASA target with little margin (${volumeMarginPct.toFixed(0)}%). Contingency stowage growth could push it below the line.`,
    })
  } else {
    findings.push({
      severity: "pass",
      title: "Habitable volume target met",
      detail: `${estPer.toFixed(1)} m³/crew provides a ${volumeMarginPct.toFixed(0)}% margin over requirement.`,
    })
  }

  if (needsSelfSufficiency && !hasFood) {
    findings.push({
      severity: "critical",
      title: "No food production for a long-duration mission",
      detail: `A ${config.destination} mission of ${missionDays >= 500 ? "permanent duration" : missionDays + " days"} cannot rely on resupply. Add an agricultural / greenhouse zone.`,
    })
  }
  if (needsSelfSufficiency && !hasMedical) {
    findings.push({
      severity: "warn",
      title: "No dedicated medical zone",
      detail: "Long-duration crews far from Earth require on-site emergency care and quarantine capability.",
    })
  }
  if (!hasLiving) {
    findings.push({
      severity: "critical",
      title: "No residential zone defined",
      detail: "The habitat lacks dedicated crew living quarters — the core of any human habitat.",
    })
  }
  if (hasLiving && hasWork && roles.size >= 3) {
    findings.push({
      severity: "pass",
      title: "Clean/dirty functional separation present",
      detail: "Living, working, and support functions are separated, reducing contamination and noise cross-over.",
    })
  }
  if (crewCount >= 8 && zoneCount < 4) {
    findings.push({
      severity: "warn",
      title: "Large crew, sparse zoning",
      detail: `${crewCount} crew across only ${zoneCount} zone(s) risks congestion and privacy loss.`,
    })
  }
  if (volumeRatio > 2.2) {
    findings.push({
      severity: "warn",
      title: "Oversized for crew — launch mass penalty",
      detail: `Habitable volume is ${volumeRatio.toFixed(1)}× the requirement, wasting launch mass and cost.`,
    })
  }

  // --- Recommendations -------------------------------------------------------
  const recommendations: Recommendation[] = []
  if (volumeRatio < 1.05) {
    recommendations.push({
      priority: "high",
      title: volumeRatio < 0.85 ? "Increase habitable volume" : "Add volume margin",
      detail: s.includes("metal")
        ? "Switch to a hybrid or inflatable structure to gain deployed volume without a larger fairing."
        : "Step up to a larger fairing class or add a second module to raise per-crew volume above target.",
    })
  }
  if (needsSelfSufficiency && !hasFood) {
    recommendations.push({
      priority: "high",
      title: "Add an agricultural / greenhouse zone",
      detail: "Closed-loop food production is essential beyond low Earth orbit and improves crew morale.",
    })
  }
  if (!hasMedical && (needsSelfSufficiency || crewCount >= 6)) {
    recommendations.push({
      priority: "medium",
      title: "Add a medical / infirmary zone",
      detail: "Provide emergency care and quarantine capacity proportional to crew size and mission distance.",
    })
  }
  if (compartmentCount < crewCount && hasLiving) {
    recommendations.push({
      priority: "medium",
      title: "Define private crew compartments",
      detail: `Add individual sleep/privacy compartments — at least one per crew member (${crewCount}).`,
    })
  }
  if (volumeRatio > 2.2) {
    recommendations.push({
      priority: "low",
      title: "Right-size the pressure vessel",
      detail: "Reduce module size or fairing class to cut launch mass while still meeting the volume target.",
    })
  }
  if (recommendations.length === 0) {
    recommendations.push({
      priority: "low",
      title: "Design is well balanced",
      detail: "No critical gaps detected. Iterate on interior layout and stowage efficiency for further gains.",
    })
  }

  let verdict: string
  if (overall >= 82) verdict = "Flight-ready concept — strong across the board."
  else if (overall >= 68) verdict = "Solid design with a few areas to strengthen before review."
  else if (overall >= 50) verdict = "Viable starting point, but key gaps need addressing."
  else verdict = "Early concept — significant habitability gaps remain."

  return {
    generatedAt: new Date().toISOString(),
    overall,
    grade: gradeFromScore(overall),
    verdict,
    metrics,
    findings,
    recommendations,
    derived: {
      crewCount,
      missionDays,
      requiredNhvPerCrew: reqPer,
      requiredNhvTotal: reqTotal,
      estimatedNhvTotal: Math.round(estNhvTotal),
      estimatedNhvPerCrew: Math.round(estPer * 10) / 10,
      volumeMarginPct: Math.round(volumeMarginPct),
      zoneCount,
      compartmentCount,
      fairingDiameter: diameter,
      launchMassIndex,
    },
    config,
  }
}

export const MISSION_STORAGE_KEY = "voronova:lastMission"
