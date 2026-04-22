// The Simulation orchestrates one full run: it owns the World, the live
// `organisms` list, and a `deadOrganisms` list used for the death animation.
//
// One important difference vs. the Python original: that file kept everything
// at module scope (globals + import-time `initialize_organisms()`). Here it's
// a class so we can throw away the whole instance and build a fresh one
// whenever the user changes settings or hits Reset.

import { defaultConfig, TRAIT_POSSIBLE_VALUES, labelsFor } from './config.js'
import { World } from './world.js'
import { Organism } from './organism.js'
import { randInt } from './rand.js'

export class Simulation {
  constructor(userConfig = {}) {
    // Merge user overrides on top of the defaults. The merged object is
    // shared with World/Organism instances so they all see the same values.
    this.config = { ...defaultConfig, ...userConfig }

    this.world = new World(
      this.config.WIDTH,
      this.config.HEIGHT,
      this.config.FOOD_NUMBER,
      this.config,
    )

    this.organisms = []
    this.deadOrganisms = []

    this.initializeOrganisms()
  }

  // Spawn NUM_ORGANISMS organisms in unique random cells.
  initializeOrganisms() {
    const c = this.config
    const occupied = new Set()
    const key = (x, y) => `${x},${y}`

    for (let i = 0; i < c.NUM_ORGANISMS; i++) {
      // Keep rolling until we land on an empty cell.
      while (true) {
        const x = randInt(0, c.WIDTH - 1)
        const y = randInt(0, c.HEIGHT - 1)
        if (!occupied.has(key(x, y))) {
          this.organisms.push(this.buildOrganism(x, y, c.STARTING_ENERGY))
          this.world.placeOrganism(x, y)
          occupied.add(key(x, y))
          break
        }
      }
    }
  }

  // Whichever trait is currently being selected for starts at the configured
  // mutable value; the other traits are pinned at their neutral baseline.
  buildOrganism(x, y, energy) {
    const c = this.config
    const mutable = c.STARTING_MUTABLE_VALUE
    return new Organism({
      x, y, energy,
      speed:      c.TRAIT_NAME === 'speed'      ? mutable : 1,
      efficiency: c.TRAIT_NAME === 'efficiency' ? mutable : 1.0,
      config: c,
    })
  }

  reset() {
    // Build a brand new world and population. Cheaper and clearer than
    // surgically wiping every grid cell.
    this.world = new World(
      this.config.WIDTH,
      this.config.HEIGHT,
      this.config.FOOD_NUMBER,
      this.config,
    )
    this.organisms = []
    this.deadOrganisms = []
    this.initializeOrganisms()
  }

  // Run one tick of the simulation. Returns false if everyone is dead.
  step() {
    if (this.organisms.length === 0) return false

    // Wipe the organism layer of the grid before reprocessing. Each organism
    // re-places itself if it survives its move.
    for (let y = 0; y < this.world.height; y++) {
      for (let x = 0; x < this.world.width; x++) {
        this.world.grid[y][x] = null
      }
    }

    const liveOrganisms = []
    const newOffspring  = []

    for (const org of this.organisms) {
      org.move(this.world)

      if (org.checkSurvival(this.world)) {
        // Survived — claim our cell back and try to reproduce.
        if (this.world.isEmpty(org.x, org.y)) this.world.placeOrganism(org.x, org.y)

        const child = org.reproduce(this.world)
        if (child) {
          newOffspring.push(child)
          if (this.world.isEmpty(child.x, child.y)) {
            this.world.placeOrganism(child.x, child.y)
          }
        }

        liveOrganisms.push(org)
      } else {
        // Died — record a corpse for the death-fade animation.
        const traitValue = org[this.config.TRAIT_NAME]
        this.world.clear(org.x, org.y)
        this.deadOrganisms.push({
          x: org.x,
          y: org.y,
          framesLeft: this.config.DEATH_ANIMATION_FRAMES,
          trait: Math.trunc(traitValue),
        })
      }
    }

    this.organisms = liveOrganisms.concat(newOffspring)

    // Tick down corpse animations and prune the expired ones.
    for (const corpse of this.deadOrganisms) corpse.framesLeft -= 1
    this.deadOrganisms = this.deadOrganisms.filter((c) => c.framesLeft > 0)

    this.world.replenishFood()
    return true
  }

  // Compute proportions of each possible trait value among living organisms.
  // Returns an array aligned with TRAIT_POSSIBLE_VALUES[traitName].
  getTraitDistribution() {
    const traitName = this.config.TRAIT_NAME
    const possible = TRAIT_POSSIBLE_VALUES[traitName] || []
    const counts = Object.fromEntries(possible.map((v) => [v, 0]))
    const total = this.organisms.length

    for (const org of this.organisms) {
      const v = org[traitName]
      if (v in counts) counts[v]++
    }

    return possible.map((v) => (total > 0 ? counts[v] / total : 0))
  }

  // Snapshot of the current state, shaped exactly like the old Flask /state
  // response so the React components don't need to change anything.
  getState() {
    const c = this.config
    const w = this.world

    // Organism layer: '' for empty, trait value as string otherwise.
    const grid = []
    for (let y = 0; y < c.HEIGHT; y++) {
      const row = new Array(c.WIDTH).fill('')
      grid.push(row)
    }

    // Food layer: round to 1 decimal so React keys/renders are stable.
    const food = []
    for (let y = 0; y < c.HEIGHT; y++) {
      const row = new Array(c.WIDTH)
      for (let x = 0; x < c.WIDTH; x++) {
        row[x] = Math.round(w.food[y][x] * 10) / 10
      }
      food.push(row)
    }

    for (const org of this.organisms) {
      if (org.x >= 0 && org.x < c.WIDTH && org.y >= 0 && org.y < c.HEIGHT) {
        const traitInt = Math.trunc(org[c.TRAIT_NAME])
        grid[org.y][org.x] = String(traitInt)
      }
    }

    // Dead layer: keyed by "x,y" with progress 0..1 (0 = just died, 1 = gone).
    const dead = {}
    for (const corpse of this.deadOrganisms) {
      const { x, y, framesLeft, trait } = corpse
      if (x >= 0 && x < c.WIDTH && y >= 0 && y < c.HEIGHT) {
        const progress = 1 - framesLeft / c.DEATH_ANIMATION_FRAMES
        dead[`${x},${y}`] = { progress, trait }
      }
    }

    return {
      grid,
      food,
      alive: this.organisms.length > 0,
      trait_distribution: this.getTraitDistribution(),
      trait_name: c.TRAIT_NAME,
      trait_labels: labelsFor(c.TRAIT_NAME),
      dead,
    }
  }
}
