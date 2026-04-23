// The World holds two parallel 2D grids:
//   - `grid`  : the organism layer. Each cell is null (empty) or any truthy
//               marker meaning "an organism is here". The Simulation rewrites
//               this grid every step, so it's purely a presence-check map.
//   - `food`  : numeric food amount at each cell, 0..FOOD_MAX.
//
// `foodSources` remembers which cells were originally seeded with food, so
// we know where to replenish each turn.

import { randInt } from './rand.js'

// Build a fresh height x width 2D array filled with `value` (or a fn).
function makeGrid(width, height, value) {
  const out = new Array(height)
  for (let y = 0; y < height; y++) {
    out[y] = new Array(width)
    for (let x = 0; x < width; x++) {
      out[y][x] = typeof value === 'function' ? value() : value
    }
  }
  return out
}

export class World {
  constructor(width, height, numFood, config) {
    this.width = width
    this.height = height
    this.config = config

    this.grid        = makeGrid(width, height, null)
    this.food        = makeGrid(width, height, 0)
    this.foodSources = makeGrid(width, height, false)

    this.generateFoodGrid(numFood)
  }

  // Sprinkle `numFood` food piles across the grid. Placements that land on
  // the same cell stack, but we cap at FOOD_MAX so no cell starts with more
  // food than a source can hold during replenishment. (Without this, random
  // collisions could produce cells with 10+ food, and an organism's first
  // meal could push it over the reproduction threshold in a single bite.)
  generateFoodGrid(numFood) {
    const { FOOD_MAX } = this.config
    for (let i = 0; i < numFood; i++) {
      const x = randInt(0, this.width - 1)
      const y = randInt(0, this.height - 1)
      const energy = randInt(1, 5)
      this.food[y][x] = Math.min(FOOD_MAX, this.food[y][x] + energy)
      this.foodSources[y][x] = true
    }
  }

  // Each step, every original food source regrows a little, capped at FOOD_MAX.
  replenishFood() {
    const { FOOD_MAX, FOOD_REPLENISH_RATE } = this.config
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.foodSources[y][x] && this.food[y][x] < FOOD_MAX) {
          this.food[y][x] += FOOD_REPLENISH_RATE
          if (this.food[y][x] > FOOD_MAX) this.food[y][x] = FOOD_MAX
        }
      }
    }
  }

  isEmpty(x, y)        { return this.grid[y][x] === null }
  clear(x, y)          { this.grid[y][x] = null }
  placeOrganism(x, y)  { this.grid[y][x] = 'org' }
  removeOrganism(x, y) { this.grid[y][x] = null }
}
