import './SimulationGrid.css'

function SimulationGrid({ grid, food, dead }) {
  if (!grid || grid.length === 0) {
    return <div className="grid-container">Loading...</div>
  }

  const height = grid.length
  const width = grid[0]?.length || 0

  // Debug: count organisms by speed
  const speedCounts = { 1: 0, 2: 0, 3: 0 }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const val = grid[y]?.[x]
      if (val) {
        const speed = parseInt(val)
        if (speed in speedCounts) speedCounts[speed]++
      }
    }
  }
  console.log('Grid organisms by speed:', speedCounts)

  const getHueForTrait = (traitValue) => {
    const hues = {
      1: 240, // blue
      2: 270, // violet
      3: 300, // magenta
      4: 15,  // red-orange
      5: 0    // deep red
    }
    return hues[traitValue] || 240
  }

  return (
    <div className="grid-container">
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${width}, 16px)` }}
      >
        {Array.from({ length: height }).map((_, y) =>
          Array.from({ length: width }).map((_, x) => {
            const organismValue = grid[y]?.[x]
            const foodAmount = food[y]?.[x] || 0
            const deathData = dead[`${x},${y}`]
            const deathProgress = deathData?.progress ?? null
            const deathTrait = deathData?.trait

            // Calculate food color intensity (darker green = more food, 0 = transparent)
            const foodIntensity = foodAmount / 5 // 0 to 1
            const foodOpacity = foodAmount > 0 ? 0.15 + foodIntensity * 0.5 : 0
            const foodColor = `rgba(76, 175, 80, ${foodOpacity})`

            // Determine which organism to show (live organism or dying organism)
            const displayTrait = organismValue || (deathTrait ? String(deathTrait) : null)

            // If organism is present, show organism color, otherwise show food
            // During death animation, fade to gray/red
            let backgroundColor
            if (deathProgress !== null && displayTrait) {
              // Dramatic death: fade from organism color to dark red/gray
              const originalColor = `hsl(${getHueForTrait(parseInt(displayTrait) || 1)}, 70%, 50%)`
              const deathColor = `hsl(0, 70%, ${20 + deathProgress * 10}%)` // Dark red fading to black
              backgroundColor = deathProgress > 0.5 ? deathColor : originalColor
            } else if (displayTrait) {
              backgroundColor = `hsl(${getHueForTrait(parseInt(displayTrait) || 1)}, 70%, 50%)`
            } else {
              backgroundColor = foodColor
            }

            return (
              <div
                key={`${x}-${y}`}
                className={`cell ${displayTrait && !deathProgress ? 'organism' : ''} ${deathProgress !== null ? 'dying' : ''} ${foodAmount > 0 ? 'food' : ''}`}
                style={{
                  backgroundColor: backgroundColor,
                  // Dramatic death animation styles
                  opacity: deathProgress !== null ? 1 - deathProgress * 0.8 : 1,
                  transform: deathProgress !== null 
                    ? `scale(${1 - deathProgress * 0.5}) rotate(${deathProgress * 180}deg)`
                    : 'none',
                  filter: deathProgress !== null 
                    ? `blur(${deathProgress * 2}px) brightness(${1 - deathProgress * 0.7})`
                    : 'none',
                  // Show food as an inset shadow/border when organism is on it
                  boxShadow: displayTrait && foodAmount > 0 && !deathProgress
                    ? `inset 0 0 0 0.5px ${foodColor}, 0 1px 2px rgba(0, 0, 0, 0.2)`
                    : foodAmount > 0 && !deathProgress
                    ? `inset 0 0 1px ${foodColor}`
                    : displayTrait && !deathProgress
                    ? '0 1px 2px rgba(0, 0, 0, 0.2)'
                    : deathProgress !== null
                    ? `0 0 ${3 + deathProgress * 5}px rgba(139, 0, 0, ${0.8 - deathProgress * 0.8})`
                    : 'none'
                }}
              >
                {/* Removed trait value display */}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default SimulationGrid
