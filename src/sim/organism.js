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

// Movement tunables. Pulled out here so you can tweak the feel without
// digging into the algorithm.
const VISION_RADIUS = 4          // how many cells an organism "sees" around itself
const WANDER_TURN_CHANCE = 0.15  // odds of picking a random new direction when no food visible
const TIEBREAK_NOISE = 0.25      // tiny randomness added to direction preference scores
const TARGET_COMMIT_STEPS = 8    // how many moves an organism will pursue a target before re-scanning
const SOURCE_BONUS = 1.0         // attractiveness of a food-source cell even when currently empty

// Return all 8 neighbor directions ordered by how closely they match the
// preferred direction. The score is a dot product (+ small noise so ties
// aren't always broken the same way). First = best match, last = opposite.
// move() iterates in this order and takes the first unblocked option.
function orderedByPreference(preferred) {
  const [pdx, pdy] = preferred
  return NEIGHBORS
    .map(([dx, dy]) => ({
      dir: [dx, dy],
      score: dx * pdx + dy * pdy + Math.random() * TIEBREAK_NOISE,
    }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.dir)
}

// Monotonic counter so every Organism ever created gets a unique id.
// React uses this as its `key` so the DOM node for an organism persists
// across frames — that's what lets CSS transition smoothly animate
// position changes instead of remounting at the new cell.
let nextId = 1

export class Organism {
  constructor({ x, y, speed, energy, efficiency, config }) {
    this.id = nextId++
    this.x = x
    this.y = y
    this.speed = speed
    this.energy = energy
    this.efficiency = efficiency
    this.config = config // shared reference; safe because we only read it
    // Facing direction: [dx, dy] where each is -1, 0, or 1.
    // Defaults to "up" so newly-spawned organisms have an orientation to
    // render before they've moved. Updated in move() whenever the organism
    // actually takes a step.
    this.lastDirection = [0, -1]
    // Set true by eat() when food is consumed during a step; reset to
    // false at the start of each step. Used by the renderer to play a
    // brief eye-widen reaction.
    this.ateThisStep = false
    // Set true by reproduce() on the tick a child is successfully created;
    // reset at the start of each step. Used by the renderer to flash a
    // brief golden outline so you can see *which* organism just spawned.
    // Critical for debugging — the post-step energy label alone can't tell
    // you this because reproduction halves the organism's energy.
    this.reproducedThisStep = false
    // Current destination (a cell the organism is committed to reaching)
    // and how many steps we've been heading there. Commitment prevents the
    // ping-pong where an organism re-evaluates every step and bounces
    // between two sources that are regrowing by 0.2/step.
    this.target = null
    this.targetAge = 0
  }

  // Move up to `speed` tiles, eating any food we step onto.
  // Each step costs `1 / efficiency` energy. We stop early if we run out
  // of energy or hit a dead end.
  move(world) {
    world.clear(this.x, this.y)

    // Reset the per-step flags at the start of every step. eat() and
    // reproduce() will set them below if the organism eats or reproduces.
    this.ateThisStep = false
    this.reproducedThisStep = false

    const stepCost = 1 / Math.max(this.efficiency, 0.01)
    let stepsTaken = 0

    while (stepsTaken < this.speed && this.energy >= stepCost) {
      // Pick the direction the organism *wants* to go this step — toward
      // the nearest visible food, or continuing last-heading if nothing's
      // in sight. Then walk through all 8 neighbors in order of how well
      // they match that preference, taking the first legal one.
      const preferred = this.pickDirection(world)
      const dirs = orderedByPreference(preferred)
      let moved = false

      for (const [dx, dy] of dirs) {
        // Clamp to grid bounds (matches Python's max(0, min(...)) behavior).
        const newX = Math.max(0, Math.min(this.x + dx, world.width - 1))
        const newY = Math.max(0, Math.min(this.y + dy, world.height - 1))

        if (world.isEmpty(newX, newY)) {
          // Use the actual delta (newX - this.x) rather than the raw [dx, dy]
          // because boundary clamping may have turned an off-grid step into
          // a no-op. Only update facing if we genuinely moved cells.
          const actualDx = newX - this.x
          const actualDy = newY - this.y
          this.x = newX
          this.y = newY
          if (actualDx !== 0 || actualDy !== 0) {
            this.lastDirection = [actualDx, actualDy]
          }
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

  // Choose the direction the organism "wants" to move this step.
  //
  //   1. If we already have an active target and it's not stale, keep
  //      heading toward it. Commitment prevents the ping-pong where an
  //      organism sees regrown-by-0.2 food at a cell it just ate and
  //      immediately flips back.
  //   2. Otherwise, scan vision for the most attractive destination. Food
  //      sources are scored using the food currently present PLUS a bonus
  //      for being a source (they'll regrow, even if empty right now),
  //      divided by distance so closer-rich cells beat farther-richer.
  //      Pick the highest scorer, commit to it, head that way.
  //   3. If nothing worth heading to is in sight, wander with momentum.
  //
  // The returned [dx, dy] is a *preference*, not a guarantee — move() still
  // falls back to adjacent directions if the preferred cell is blocked.
  pickDirection(world) {
    // ---- 1. Continue toward existing target if still valid ----
    if (this.target) {
      const arrived = this.x === this.target.x && this.y === this.target.y
      const stale = this.targetAge >= TARGET_COMMIT_STEPS
      if (arrived || stale) {
        this.target = null
        this.targetAge = 0
      } else {
        this.targetAge++
        return [
          Math.sign(this.target.x - this.x),
          Math.sign(this.target.y - this.y),
        ]
      }
    }

    // ---- 2. Scan for the most attractive destination ----
    let bestTarget = null
    let bestScore = -Infinity

    for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
      for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
        if (dx === 0 && dy === 0) continue
        const nx = this.x + dx
        const ny = this.y + dy
        if (nx < 0 || nx >= world.width || ny < 0 || ny >= world.height) continue

        const foodHere = world.food[ny][nx]
        const isSource = world.foodSources[ny][nx]
        // Skip cells that are neither currently food nor a food source.
        // (In the current sim food can only exist at sources, so this is
        // really just the source check — kept explicit for clarity.)
        if (!isSource && foodHere === 0) continue

        const dist = Math.max(Math.abs(dx), Math.abs(dy))
        // Attraction = current food + source bonus, discounted by distance.
        // Noise breaks ties so two equidistant sources don't always pull
        // every organism to the same one.
        const score = (foodHere + (isSource ? SOURCE_BONUS : 0)) / (dist + 1)
                      + Math.random() * 0.1

        if (score > bestScore) {
          bestScore = score
          bestTarget = { x: nx, y: ny }
        }
      }
    }

    if (bestTarget) {
      this.target = bestTarget
      this.targetAge = 0
      return [
        Math.sign(bestTarget.x - this.x),
        Math.sign(bestTarget.y - this.y),
      ]
    }

    // ---- 3. No food / source in sight — wander with momentum ----
    if (Math.random() < WANDER_TURN_CHANCE) {
      return NEIGHBORS[Math.floor(Math.random() * NEIGHBORS.length)]
    }
    return [...this.lastDirection]
  }

  // Slurp up all food on the current cell.
  eat(world) {
    const { x, y } = this
    if (world.food[y][x] > 0) {
      this.energy += world.food[y][x]
      world.food[y][x] = 0
      this.ateThisStep = true
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
    //
    // Mutations are BIDIRECTIONAL — a 50/50 coin flip decides up vs down.
    // Previously mutation only incremented the trait, which caused
    // monotonic drift toward the max value regardless of selection pressure
    // (once a speed-3 existed, it could never un-mutate back to speed-2).
    // With bidirectional mutation, selection can actually produce a stable
    // equilibrium instead of ratcheting to the ceiling.
    //
    // Clamped to [1, MUTATION_CONFIG[trait].max] so trait values stay
    // inside TRAIT_POSSIBLE_VALUES.
    const traitName = c.TRAIT_NAME
    const mutSettings = MUTATION_CONFIG[traitName]
    let mutatedValue = this[traitName]

    if (Math.random() < c.MUTATION_CHANCE) {
      const direction = Math.random() < 0.5 ? -1 : 1
      const delta = Number.isInteger(mutatedValue) ? direction : direction * mutSettings.step
      mutatedValue = Math.max(1, Math.min(mutatedValue + delta, mutSettings.max))
    }

    // Build the child. Inherit both stats, then overwrite the mutated one.
    let newSpeed = this.speed
    let newEfficiency = this.efficiency
    if (traitName === 'speed')      newSpeed = mutatedValue
    if (traitName === 'efficiency') newEfficiency = mutatedValue

    // Mark the parent as having just reproduced — the renderer reads this
    // flag to flash a brief golden outline so you can see reproduction
    // events happening independent of the post-step energy label.
    this.reproducedThisStep = true

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
