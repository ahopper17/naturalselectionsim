import { useState } from 'react'
import './Settings.css'
import { defaultConfig } from '../sim/config.js'

// Maps the Settings UI's lower_snake_case fields to the SCREAMING_SNAKE_CASE
// keys the Simulation actually consumes. (We keep the UI labels matching the
// Python field names, since that's what the user is used to.)
const UI_TO_CONFIG = {
  trait_name:                     'TRAIT_NAME',
  food_number:                    'FOOD_NUMBER',
  num_organisms:                  'NUM_ORGANISMS',
  starting_energy:                'STARTING_ENERGY',
  reproduction_energy_threshold:  'REPRODUCTION_ENERGY_THRESHOLD',
  chance_reproduction_threshold:  'CHANCE_REPRODUCTION_THRESHOLD',
  repro_chance:                   'REPRO_CHANCE',
  mutation_chance:                'MUTATION_CHANCE',
}

// Default UI values, derived from the simulation's defaultConfig so we
// always stay in sync.
function uiDefaults() {
  const out = {}
  for (const [uiKey, cfgKey] of Object.entries(UI_TO_CONFIG)) {
    out[uiKey] = defaultConfig[cfgKey]
  }
  return out
}

function Settings({ onConfigChange, onApply }) {
  const [settings, setSettings] = useState(uiDefaults())
  const [isOpen, setIsOpen] = useState(false)

  // Update one UI field, then translate the whole UI state into a
  // Simulation-compatible config object and bubble it up to App.
  const handleChange = (uiKey, value) => {
    const newSettings = { ...settings, [uiKey]: value }
    setSettings(newSettings)

    const configOverrides = {}
    for (const [k, cfgKey] of Object.entries(UI_TO_CONFIG)) {
      configOverrides[cfgKey] = newSettings[k]
    }
    onConfigChange?.(configOverrides)
  }

  // "Apply" just triggers the parent's reset, which builds a fresh sim
  // using the current overrides.
  const handleApply = () => {
    onApply?.()
    setIsOpen(false)
  }

  return (
    <>
      <button
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close Settings' : 'Settings'}
      </button>

      {isOpen && (
        <div className="settings-panel">
          <h3>Simulation Settings</h3>
          <p className="settings-hint">
            Changes apply when you click <strong>Apply &amp; Reset</strong>.
          </p>

          <div className="settings-group">
            <label>
              Trait under selection
              <select
                value={settings.trait_name}
                onChange={(e) => handleChange('trait_name', e.target.value)}
              >
                <option value="speed">Speed</option>
                <option value="efficiency">Efficiency</option>
              </select>
            </label>
          </div>

          <div className="settings-group">
            <label>
              Starting Food: <span className="value">{settings.food_number}</span>
              <input
                type="range" min="50" max="500" step="10"
                value={settings.food_number}
                onChange={(e) => handleChange('food_number', parseInt(e.target.value, 10))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Starting Organisms: <span className="value">{settings.num_organisms}</span>
              <input
                type="range" min="5" max="100" step="5"
                value={settings.num_organisms}
                onChange={(e) => handleChange('num_organisms', parseInt(e.target.value, 10))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Starting Energy: <span className="value">{settings.starting_energy}</span>
              <input
                type="range" min="5" max="50" step="1"
                value={settings.starting_energy}
                onChange={(e) => handleChange('starting_energy', parseInt(e.target.value, 10))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Reproduction Threshold: <span className="value">{settings.reproduction_energy_threshold}</span>
              <input
                type="range" min="10" max="50" step="1"
                value={settings.reproduction_energy_threshold}
                onChange={(e) => handleChange('reproduction_energy_threshold', parseInt(e.target.value, 10))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Chance Reproduction Threshold: <span className="value">{settings.chance_reproduction_threshold}</span>
              <input
                type="range" min="5" max="30" step="1"
                value={settings.chance_reproduction_threshold}
                onChange={(e) => handleChange('chance_reproduction_threshold', parseInt(e.target.value, 10))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Reproduction Chance: <span className="value">{(settings.repro_chance * 100).toFixed(0)}%</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={settings.repro_chance}
                onChange={(e) => handleChange('repro_chance', parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Mutation Chance: <span className="value">{(settings.mutation_chance * 100).toFixed(1)}%</span>
              <input
                type="range" min="0" max="0.5" step="0.01"
                value={settings.mutation_chance}
                onChange={(e) => handleChange('mutation_chance', parseFloat(e.target.value))}
              />
            </label>
          </div>

          <button className="apply-button" onClick={handleApply}>
            Apply &amp; Reset
          </button>
        </div>
      )}
    </>
  )
}

export default Settings
