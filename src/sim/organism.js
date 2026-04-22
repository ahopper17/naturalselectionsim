// An Organism wanders the world, eats, reproduces, and eventually starves.
// `speed` controls how many tiles it can step per turn.
// `efficiency` controls how much energy each step costs (higher = cheaper).
// Only one trait at a time is "active" (mutable) per simulation, picked by
// config.TRAIT_NAME.

import { shuffle } from './rand.js'
import { MUTATION_CONFIG } from './config.js'

// All eight neighboring offsets (for moves and reproduction placement).
const NEIGHBORS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
]

export class Organism {
  constructor({ x, y, speed, energy, efficiency, config }) {
    this.x = x
    this.y = y
    this.speed = speed
    this.energy = energy
    this.efficiency = efficiency
    this.config = config // shared reference; safe because we only read it
  }

  // Move up to `speed` tiles, eating any food we step onto.
  // Each step costs `1 / efficiency` energy. We stop early if we run out
  // of energy or hit a dead end.
  move(world) {
    world.clear(this.x, this.y)

    const stepCost = 1 / Math.max(this.efficiency, 0.01)
    let stepsTaken = 0

    while (stepsTaken < this.speed && this.energy >= stepCost) {
      // Pick a random direction order, then take the first valid step.
      const dirs = shuffle([...NEIGHBORS])
      let moved = false

      for (const [dx, dy] of dirs) {
        // Clamp to grid bounds (matches Python's max(0, min(...)) behavior).
        const newX = Math.max(0, Math.min(this.x + dx, world.width - 1))
        const newY = Math.max(0, Math.min(this.y + dy, world.height - 1))

        if (world.isEmpty(newX, newY)) {
          this.x = newX
          this.y = newY
          moved = true
          this.eat(world)
          break
        }
      }

      stepsTaken++
      if (!moved) break // Boxed in — stop trying this turn.
    }

    // Pay the energy cost for the turn, even if we didn't fully use our speed.
    this.energy -= stepCost
  }

  // Slurp up all food on the current cell.
  eat(world) {
    const { x, y } = this
    if (world.food[y][x] > 0) {
      this.energy += world.food[y][x]
      world.food[y][x] = 0
    }
  }

  // Maybe spawn a child in an adjacent empty cell.
  // Two reproduction modes:
  //   - guaranteed:   energy >= REPRODUCTION_ENERGY_THRESHOLD
  //   - chance-based: CHANCE_REPRODUCTION_THRESHOLD <= energy < upper, with REPRO_CHANCE probability
  // Offspring may mutate the active trait (chance = MUTATION_CHANCE), capped
  // at the per-trait `max` defined in MUTATION_CONFIG.
  reproduce(world) {
    const c = this.config
    const guaranteed = this.energy >= c.REPRODUCTION_ENERGY_THRESHOLD
    const conditional =
      this.energy >= c.CHANCE_REPRODUCTION_THRESHOLD &&
      this.energy <  c.REPRODUCTION_ENERGY_THRESHOLD &&
      Math.random() < c.REPRO_CHANCE

    if (!guaranteed && !conditional) return null

    // NOTE: Faithful to the Python original — the loop reassigns newX/newY
    // every iteration without breaking, so it ends up with the *last*
    // direction in the shuffled list. Then it checks bounds + emptiness once.
    // Keeping that behavior so simulations look identical to the Python run.
    const dirs = shuffle([...NEIGHBORS])
    let newX = this.x, newY = this.y
    for (const [dx, dy] of dirs) {
      newX = this.x + dx
      newY = this.y + dy
    }

    const inBounds = newX >= 0 && newX < world.width && newY >= 0 && newY < world.height
    if (!inBounds || !world.isEmpty(newX, newY)) return null

    // Split energy with the offspring (at least 1 each).
    const offspringEnergy = Math.max(1, Math.floor(this.energy / 2))
    this.energy -= offspringEnergy

    // Possibly mutate the active trait.
    const traitName = c.TRAIT_NAME
    const mutSettings = MUTATION_CONFIG[traitName]
    let mutatedValue = this[traitName]

    if (Math.random() < c.MUTATION_CHANCE) {
      if (Number.isInteger(mutatedValue)) {
        mutatedValue = Math.min(mutatedValue + 1, mutSettings.max)
      } else {
        mutatedValue = Math.min(mutatedValue + mutSettings.step, mutSettings.max)
      }
    }

    // Build the child. Inherit both stats, then overwrite the mutated one.
    let newSpeed = this.speed
    let newEfficiency = this.efficiency
    if (traitName === 'speed')      newSpeed = mutatedValue
    if (traitName === 'efficiency') newEfficiency = mutatedValue

    return new Organism({
      x: newX, y: newY,
      speed: newSpeed,
      efficiency: newEfficiency,
      energy: offspringEnergy,
      config: c,
    })
  }

  // True if the organism has enough energy to pay for next turn's first step.
  checkSurvival(world) {
    const stepCost = 1 / Math.max(this.efficiency, 0.01)
    if (this.energy <= stepCost) {
      world.clear(this.x, this.y)
      return false
    }
    return true
  }
}
