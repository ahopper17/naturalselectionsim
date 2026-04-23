import { useState } from 'react'
import './Display.css'

// Default values. Kept in sync with the App's initial state via the
// `initial` prop — that way the sliders show the actual current values
// on first render instead of re-setting them.
export const displayDefaults = {
  cellSize: 25,          // pixels per grid cell
  stepIntervalMs: 200,   // how long between auto-run ticks
  showEnergy: false,     // debug overlay: print each organism's energy in its center
}

function Display({ onChange, initial = displayDefaults }) {
  const [settings, setSettings] = useState(initial)
  const [isOpen, setIsOpen] = useState(false)

  // Update one field, bubble the whole object up.
  // App keeps the single source of truth and re-renders SimulationGrid
  // / re-sets the interval whenever these change.
  const handleChange = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    onChange?.(next)
  }

  // Show speed to the user as ticks/second (1000/ms), rounded — more
  // intuitive than milliseconds. We invert: dragging right = faster.
  const ticksPerSec = (1000 / settings.stepIntervalMs).toFixed(1)

  return (
    <>
      <button
        className="display-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close Display' : 'Display'}
      </button>

      {isOpen && (
        <div className="display-panel">
          <h3>Display</h3>
          <p className="display-hint">
            Changes take effect immediately — no reset required.
          </p>

          <div className="display-group">
            <label>
              Cell size: <span className="value">{settings.cellSize}px</span>
              <input
                type="range" min="8" max="32" step="1"
                value={settings.cellSize}
                onChange={(e) => handleChange('cellSize', parseInt(e.target.value, 10))}
              />
            </label>
          </div>

          <div className="display-group">
            <label>
              Simulation speed: <span className="value">{ticksPerSec} ticks/s</span>
              {/* Slider range 50ms (fast) — 1000ms (slow). We flip the
                  displayed direction by computing ms from the slider's
                  own value without inverting the axis — keeps UX obvious. */}
              <input
                type="range" min="50" max="1000" step="25"
                value={settings.stepIntervalMs}
                onChange={(e) => handleChange('stepIntervalMs', parseInt(e.target.value, 10))}
              />
              <div className="display-scale">
                <span>faster</span>
                <span>slower</span>
              </div>
            </label>
          </div>

          <div className="display-group">
            <label className="display-checkbox">
              <input
                type="checkbox"
                checked={settings.showEnergy}
                onChange={(e) => handleChange('showEnergy', e.target.checked)}
              />
              Show energy (debug overlay)
            </label>
          </div>
        </div>
      )}
    </>
  )
}

export default Display
