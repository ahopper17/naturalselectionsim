// Tiny random helpers so the rest of the code reads like the Python original.
// These mirror random.randint and random.shuffle from Python's stdlib.

// Inclusive on both ends, like Python's random.randint(a, b).
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// In-place Fisher–Yates shuffle. Returns the same array for chaining.
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
