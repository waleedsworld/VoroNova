// Habitat volume estimation model for the VoroNova Volume Calculator.
//
// This is an engineering *estimate* intended for early concept exploration and
// education — not a certified sizing tool. The per-crew Net Habitable Volume
// (NHV) curves are inspired by the Celentano-style habitability curves and NASA
// human-spaceflight habitability literature, where the volume a crew member
// needs grows with mission duration and asymptotes for very long missions.
//
// NHV = the usable, unobstructed volume available to the crew for living and
// working. Total pressurized volume is larger (structure, systems, stowage
// racks and equipment consume the rest), so we also derive an estimated
// pressurized volume for launch-vehicle fairing fit checks.

export interface DestinationPreset {
  id: string
  label: string
  blurb: string
  /** A sensible default mission duration in days for this destination. */
  defaultDurationDays: number
  /** Relative environmental stress factor (radiation, isolation, gravity). */
  stressFactor: number
}

export const DESTINATIONS: DestinationPreset[] = [
  {
    id: "leo",
    label: "Low Earth Orbit",
    blurb: "Frequent resupply, fast return, shielded by Earth's magnetosphere.",
    defaultDurationDays: 180,
    stressFactor: 1.0,
  },
  {
    id: "moon",
    label: "Lunar Surface",
    blurb: "1/6 g, dust, ~3-day return, partial radiation exposure.",
    defaultDurationDays: 90,
    stressFactor: 1.08,
  },
  {
    id: "transit",
    label: "Mars Transit",
    blurb: "Microgravity, deep-space radiation, no abort — isolation matters.",
    defaultDurationDays: 210,
    stressFactor: 1.18,
  },
  {
    id: "mars",
    label: "Mars Surface",
    blurb: "3/8 g, ~500-day stay, full autonomy from Earth.",
    defaultDurationDays: 500,
    stressFactor: 1.15,
  },
]

export interface FunctionalZone {
  id: string
  name: string
  /** Share of Net Habitable Volume, 0..1. Shares sum to 1. */
  share: number
  hint: string
}

// Approximate NHV allocation across habitat functions, drawn from NASA
// habitability functional-area studies. Shares sum to 1.0.
export const FUNCTIONAL_ZONES: FunctionalZone[] = [
  { id: "sleep", name: "Crew Quarters", share: 0.18, hint: "Private sleep & personal space" },
  { id: "hygiene", name: "Hygiene & Waste", share: 0.08, hint: "Toilet, cleansing, grooming" },
  { id: "galley", name: "Galley & Food Prep", share: 0.08, hint: "Meal preparation & storage" },
  { id: "dining", name: "Wardroom / Social", share: 0.1, hint: "Group dining & recreation" },
  { id: "exercise", name: "Exercise", share: 0.12, hint: "Countermeasures against muscle/bone loss" },
  { id: "medical", name: "Medical", share: 0.05, hint: "Health checks & treatment" },
  { id: "work", name: "Mission Ops", share: 0.12, hint: "Command, science & workstations" },
  { id: "stowage", name: "Stowage & Logistics", share: 0.15, hint: "Consumables & spares" },
  { id: "maintenance", name: "Maintenance / EVA Prep", share: 0.07, hint: "Repairs & suit-up" },
  { id: "circulation", name: "Translation Paths", share: 0.05, hint: "Movement between modules" },
]

export interface LaunchVehicle {
  id: string
  name: string
  /** Estimated usable pressurized habitat volume that fits the fairing, m^3. */
  usableVolumeM3: number
  fairing: string
}

// Representative usable pressurized volumes (m^3) — order-of-magnitude figures
// for the volume a single monolithic habitat module could occupy inside each
// launch vehicle's payload envelope.
export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  { id: "falcon9", name: "Falcon 9 / Heavy", usableVolumeM3: 110, fairing: "5.2 m fairing" },
  { id: "vulcan", name: "Vulcan Centaur", usableVolumeM3: 130, fairing: "5.4 m fairing" },
  { id: "newglenn", name: "New Glenn", usableVolumeM3: 300, fairing: "7 m fairing" },
  { id: "sls", name: "SLS Block 1B", usableVolumeM3: 286, fairing: "8.4 m fairing" },
  { id: "starship", name: "Starship", usableVolumeM3: 1000, fairing: "9 m / integrated" },
]

/** Fraction of pressurized volume that ends up as Net Habitable Volume. */
const NHV_TO_PRESSURIZED = 0.55

export interface VolumeResult {
  perCrew: {
    tolerable: number
    performance: number
    optimal: number
  }
  crewSize: number
  durationDays: number
  /** Total Net Habitable Volume at each comfort tier, m^3. */
  totalTolerable: number
  totalPerformance: number
  totalOptimal: number
  /** Estimated total pressurized volume needed (from optimal NHV), m^3. */
  pressurizedOptimal: number
  zones: Array<{ zone: FunctionalZone; volumeM3: number }>
}

/**
 * Per-crew Net Habitable Volume (m^3) as a function of mission duration.
 * Uses a logarithmic growth term so volume rises quickly for short missions
 * and flattens for long-duration ones, then scales by environmental stress.
 */
function perCrewNHV(durationDays: number, stressFactor: number) {
  const d = Math.max(1, durationDays)
  const growth = Math.log(1 + d / 30) // 0 at ~0 days, ~2 at 180d, ~3.5 at 1000d
  const tolerable = (5 + 3.0 * growth) * stressFactor
  const performance = (8 + 5.0 * growth) * stressFactor
  const optimal = (10 + 7.5 * growth) * stressFactor
  return { tolerable, performance, optimal }
}

export function computeVolume(
  crewSize: number,
  durationDays: number,
  stressFactor: number,
): VolumeResult {
  const crew = Math.max(1, Math.round(crewSize))
  const perCrew = perCrewNHV(durationDays, stressFactor)

  const totalOptimal = perCrew.optimal * crew
  const totalPerformance = perCrew.performance * crew
  const totalTolerable = perCrew.tolerable * crew

  const zones = FUNCTIONAL_ZONES.map((zone) => ({
    zone,
    volumeM3: totalOptimal * zone.share,
  }))

  return {
    perCrew,
    crewSize: crew,
    durationDays,
    totalTolerable,
    totalPerformance,
    totalOptimal,
    pressurizedOptimal: totalOptimal / NHV_TO_PRESSURIZED,
    zones,
  }
}

export function formatVolume(m3: number) {
  if (m3 >= 100) return `${Math.round(m3)}`
  if (m3 >= 10) return m3.toFixed(1)
  return m3.toFixed(2)
}
