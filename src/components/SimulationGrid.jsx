import './SimulationGrid.css'

// Trait colors, using the Okabe-Ito palette — designed to be distinguishable
// across all common forms of colorblindness (deuteranopia, protanopia,
// tritanopia) and in grayscale. Progression roughly cool → warm matches
// the slow → fast semantic for speed selection.
//
// The previous palette used HSL hues 240/270/300 (blue/violet/magenta),
// which collapse into "purple" for red-green colorblind viewers.
const TRAIT_COLORS = {
  1: '#56B4E9', // sky blue     — slow
  2: '#CC79A7', // reddish pink — medium
  3: '#D55E00', // vermilion    — fast
  4: '#009E73', // bluish green — reserved for future 4-level traits
  5: '#0072B2', // dark blue    — reserved for 5-level traits
}
const colorFor = (t) => TRAIT_COLORS[t] || TRAIT_COLORS[1]

// Convert [dx, dy] into a CSS rotation angle (degrees). Our eyes sit near
// the top of the unrotated circle, so rotate(0) corresponds to "facing up"
// (dy = -1). We add 90° so atan2's "0 = facing right" becomes "90 = right".
const angleFromDirection = ([dx, dy]) =>
  (Math.atan2(dy, dx) * 180) / Math.PI + 90

// Uniform size for all organisms (used to vary by speed; reverted because
// the small circles were hard to see the eyes on and color was carrying
// enough information on its own).
const ORGANISM_INSET = 8 // % padding inside the cell — matches the old speed-3 size

/**
 * One organism. Absolutely positioned inside the organism-layer via
 * transform: translate(...). Rotation and scale live on an inner body div
 * so the outer translate isn't clobbered when we rotate or bloom.
 *
 * React identifies this element by its organism id (via the parent's
 * `key={org.id}` prop), so the same DOM node is reused across frames even
 * as x/y change — that's what lets CSS transitions glide it from old cell
 * to new cell rather than snapping.
 */
function Organism({ org, cellSize, showEnergy }) {
  const { trait, direction, alive, ate, reproduced, deathProgress, energy } = org
  const isDying = !alive

  // Outer translate puts the organism at the right cell. CSS transition
  // on this element is what makes organisms glide smoothly between cells.
  const slotStyle = {
    width: cellSize,
    height: cellSize,
    transform: `translate(${org.x * cellSize}px, ${org.y * cellSize}px)`,
  }

  // Per-organism animation offset. Applied as a CSS variable that the blink
  // and breathe keyframes both reference via animation-delay. Using the id
  // as a deterministic seed means each organism has its own rhythm without
  // any runtime state.
  const animOffset = `${(org.id * 0.37) % 5}s`

  // Outer div handles ROTATION (facing direction). Composed with the inner
  // body's scale pulse so breathing doesn't clobber the rotation.
  const rotateTransform = `rotate(${angleFromDirection(direction)}deg)`

  // Death animation — applied to the body. Same bloom-then-collapse math
  // as before.
  let bodyTransform = null  // null → let the CSS breathe animation run
  let bodyFilter = 'none'
  let bodyOpacity = 1
  // Default: subtle drop shadow. Dying → sage halo. Reproduced → golden
  // ring emanating outward. bodyShadow is applied inline (rather than via
  // CSS class) because the shadow varies per-state with computed values.
  let bodyShadow = '0 1px 3px rgba(45, 42, 36, 0.25)'

  if (isDying) {
    const p = deathProgress
    const BLOOM_END = 0.2, BLOOM_PEAK = 1.25, FINAL = 0.4
    let scale
    if (p < BLOOM_END) {
      scale = 1 + (BLOOM_PEAK - 1) * (p / BLOOM_END)
    } else {
      scale = BLOOM_PEAK + (FINAL - BLOOM_PEAK) * ((p - BLOOM_END) / (1 - BLOOM_END))
    }
    bodyTransform = `scale(${scale})` // replaces the breathe animation during death
    bodyOpacity = p < BLOOM_END ? 1 : 1 - (p - BLOOM_END) / (1 - BLOOM_END)
    bodyFilter = `grayscale(${p}) brightness(${1 - p * 0.2})`
    const haloOp = Math.sin(p * Math.PI) * 0.55
    const haloR = p * 18
    bodyShadow = `0 0 ${haloR}px ${haloR * 0.3}px rgba(107, 144, 128, ${haloOp})`
  } else if (reproduced) {
    // Warm golden ring + soft outer glow. Only applied on the single tick
    // the organism produced offspring — React flips the class off next
    // render since reproducedThisStep resets at the start of move().
    bodyShadow = '0 1px 3px rgba(45, 42, 36, 0.25), 0 0 0 2.5px rgba(255, 210, 100, 0.95), 0 0 12px 2px rgba(255, 210, 100, 0.55)'
  }

  const color = colorFor(trait)

  const classes = [
    'organism',
    isDying ? 'dying' : '',
    ate ? 'ate' : '',
    reproduced ? 'reproduced' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className="organism-slot"
      style={{ ...slotStyle, '--anim-offset': animOffset }}
    >
      {/* Rotator: aims the eyes in the facing direction. Its transition on
          transform is what smoothly turns the organism when direction changes. */}
      <div
        className={classes}
        style={{
          inset: `${ORGANISM_INSET}%`,
          transform: rotateTransform,
        }}
      >
        {/* Body: the colored circle itself. Handles death scale, color,
            filter, shadow, and the passive "breathing" scale animation. */}
        <div
          className="organism-body"
          style={{
            background: color,
            opacity: bodyOpacity,
            filter: bodyFilter,
            boxShadow: bodyShadow,
            ...(bodyTransform ? { transform: bodyTransform } : {}),
          }}
        >
          <div className="eye eye-left" />
          <div className="eye eye-right" />
        </div>
      </div>

      {/* Energy debug label. Rendered at the SLOT level (not inside
          .organism) so it doesn't rotate with direction or pulse with the
          breathing animation — stays upright and still so it's readable.
          Font-size scales with cellSize, floored at 7px for sanity. */}
      {showEnergy && alive && (
        <div
          className="energy-label"
          style={{ fontSize: `${Math.max(7, cellSize * 0.45)}px` }}
        >
          {energy}
        </div>
      )}
    </div>
  )
}

/**
 * One cell in the food grid. Food is shown as a green background tint
 * whose opacity scales with food amount. The CSS transition makes the
 * regrow-by-0.2-per-step visible as a gradual fade-in.
 */
function FoodCell({ foodAmount }) {
  const intensity = foodAmount / 5 // 0..1
  const opacity = foodAmount > 0 ? 0.18 + intensity * 0.5 : 0
  const backgroundColor = `rgba(120, 170, 95, ${opacity})`
  return <div className="food-cell" style={{ backgroundColor }} />
}

function SimulationGrid({ food, organisms = [], cellSize = 16, showEnergy = false }) {
  if (!food || food.length === 0) {
    return <div className="grid-container">Loading...</div>
  }

  const height = food.length
  const width = food[0]?.length || 0
  const pixelWidth = width * cellSize
  const pixelHeight = height * cellSize

  return (
    <div className="grid-container">
      <div
        className="grid-wrapper"
        style={{ width: pixelWidth, height: pixelHeight }}
      >
        {/* Food layer: a static grid of cells, each showing its food dot. */}
        <div
          className="food-grid"
          style={{ gridTemplateColumns: `repeat(${width}, ${cellSize}px)` }}
        >
          {Array.from({ length: height }).map((_, y) =>
            Array.from({ length: width }).map((_, x) => (
              <FoodCell key={`${x}-${y}`} foodAmount={food[y]?.[x] || 0} />
            )),
          )}
        </div>

        {/* Organism layer: absolutely positioned divs keyed by organism id.
            React keeps the same DOM node across frames, so position changes
            animate smoothly via the CSS transition on .organism-slot. */}
        <div className="organism-layer">
          {organisms.map((org) => (
            <Organism
              key={org.id}
              org={org}
              cellSize={cellSize}
              showEnergy={showEnergy}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SimulationGrid
