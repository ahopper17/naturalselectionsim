// Default simulation configuration.
// Mirrors simulation/config.py from the original Python project.
//
// `defaultConfig` is the baseline. The Settings panel can override any of
// these fields and pass the merged object to a fresh Simulation instance
// (config is read once at construction time, just like the Python module).

export const defaultConfig = {
  // GRID
  WIDTH: 25,
  HEIGHT: 25,

  // FOOD
  FOOD_NUMBER: 300,
  FOOD_MAX: 5,
  FOOD_REPLENISH_RATE: 0.2,

  // ORGANISMS
  NUM_ORGANISMS: 20,
  STARTING_ENERGY: 20,
  STARTING_MUTABLE_VALUE: 1,

  // REPRODUCTION
  REPRODUCTION_ENERGY_THRESHOLD: 25,
  CHANCE_REPRODUCTION_THRESHOLD: 15,
  REPRO_CHANCE: 0.25,
  MUTATION_CHANCE: 0.05,

  // The trait being selected for in this run.
  // One of: "speed", "efficiency", "vision", "strength"
  TRAIT_NAME: 'speed',

  // Visual: how many simulation steps a death animation lingers on the grid
  DEATH_ANIMATION_FRAMES: 6,
}

// Possible discrete values each trait can take.
// The Stats bars are drawn one-per-value, in this order.
export const TRAIT_POSSIBLE_VALUES = {
  speed: [1, 2, 3],
  efficiency: [1, 2, 3, 4],
  vision: [1, 2],
  strength: [1, 2, 3, 4, 5],
}

// Friendly names shown on the trait-distribution chart.
export const TRAIT_LABELS = {
  speed: { 1: 'Slow', 2: 'Medium', 3: 'Fast' },
  efficiency: { 1: 'Wasteful', 2: 'Normal', 3: 'Efficient', 4: 'Optimal' },
  vision: { 1: 'Nearsighted', 2: 'Keen' },
  strength: {
    1: 'Weak', 2: 'Average', 3: 'Strong', 4: 'Powerful', 5: 'Titanic',
  },
}

// Per-trait mutation rules: cap and step size.
// `step` is only used for float-valued traits; ints just +1.
export const MUTATION_CONFIG = {
  speed:      { max: 3, step: 1 },
  efficiency: { max: 4, step: 1 },
  vision:     { max: 2, step: 1 },
  strength:   { max: 5, step: 1 },
}

// Helper: returns the labels for the currently-selected trait, in order.
export function labelsFor(traitName) {
  const values = TRAIT_POSSIBLE_VALUES[traitName] || []
  const map = TRAIT_LABELS[traitName] || {}
  return values.map((v) => map[v] || `Value ${v}`)
}
