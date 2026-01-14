import './Stats.css'

function Stats({ traitDistribution, traitLabels, alive }) {
  if (!traitDistribution || traitDistribution.length === 0) {
    return (
      <div className="stats-container">
        <p>Click "Step" to start the simulation.</p>
      </div>
    )
  }

  // Use provided trait labels or default to generic labels
  const labels = traitLabels || traitDistribution.map((_, i) => `Trait ${i + 1}`)
  const totalOrganisms = traitDistribution.reduce((sum, val) => sum + val, 0)

  return (
    <div className="stats-container">
      <h2>Trait Distribution</h2>
      <div className="stats-content">
        <div className="status">
          <span className={`status-indicator ${alive ? 'alive' : 'dead'}`}></span>
          <span>{alive ? 'Simulation Running' : 'Simulation Ended'}</span>
        </div>
        <div className="population">
          <strong>Total Population: {Math.round(totalOrganisms)}</strong>
        </div>
        <div className="distribution">
          {traitDistribution.map((percentage, index) => (
            <div key={index} className="trait-bar">
              <div className="trait-label">{labels[index] || `Trait ${index + 1}`}</div>
              <div className="bar-container">
                <div
                  className="bar"
                  style={{
                    width: `${percentage * 100}%`,
                    backgroundColor: `hsl(${240 + index * 20}, 70%, 50%)`
                  }}
                >
                  <span className="bar-value">
                    {percentage > 0.01 ? `${(percentage * 100).toFixed(1)}%` : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Stats
