import { useState, useEffect } from 'react'
import './Settings.css'

const API_BASE = 'http://localhost:5001'

function Settings({ onConfigChange }) {
  const [settings, setSettings] = useState({
    trait_name: 'speed',
    food_number: 300,
    num_organisms: 20,
    starting_energy: 20,
    reproduction_energy_threshold: 25,
    chance_reproduction_threshold: 15,
    repro_chance: 0.25,
    mutation_chance: 0.05
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load current config from backend
    fetch(`${API_BASE}/config`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings(data)
        }
      })
      .catch(err => console.error('Error loading config:', err))
  }, [])

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
  }

  const handleApply = () => {
    fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (onConfigChange) {
            onConfigChange(settings)
          }
          alert('Settings applied! Click Reset to start a new simulation with these settings.')
        }
      })
      .catch(err => console.error('Error applying config:', err))
  }

  return (
    <>
      <button 
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '▼' : '⚙️'} Settings
      </button>
      
      {isOpen && (
        <div className="settings-panel">
          <h3>Simulation Settings</h3>
          
          <div className="settings-group">
            <label>
              Trait:
              <select 
                value={settings.trait_name}
                onChange={(e) => handleChange('trait_name', e.target.value)}
              >
                <option value="speed">Speed</option>
                <option value="efficiency">Efficiency</option>
                <option value="vision">Vision</option>
                <option value="strength">Strength</option>
              </select>
            </label>
          </div>

          <div className="settings-group">
            <label>
              Starting Food: {settings.food_number}
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={settings.food_number}
                onChange={(e) => handleChange('food_number', parseInt(e.target.value))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Starting Organisms: {settings.num_organisms}
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={settings.num_organisms}
                onChange={(e) => handleChange('num_organisms', parseInt(e.target.value))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Starting Energy: {settings.starting_energy}
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={settings.starting_energy}
                onChange={(e) => handleChange('starting_energy', parseInt(e.target.value))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Reproduction Threshold: {settings.reproduction_energy_threshold}
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={settings.reproduction_energy_threshold}
                onChange={(e) => handleChange('reproduction_energy_threshold', parseInt(e.target.value))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Chance Reproduction Threshold: {settings.chance_reproduction_threshold}
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={settings.chance_reproduction_threshold}
                onChange={(e) => handleChange('chance_reproduction_threshold', parseInt(e.target.value))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Reproduction Chance: {(settings.repro_chance * 100).toFixed(0)}%
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.repro_chance}
                onChange={(e) => handleChange('repro_chance', parseFloat(e.target.value))}
              />
            </label>
          </div>

          <div className="settings-group">
            <label>
              Mutation Chance: {(settings.mutation_chance * 100).toFixed(1)}%
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={settings.mutation_chance}
                onChange={(e) => handleChange('mutation_chance', parseFloat(e.target.value))}
              />
            </label>
          </div>

          <button className="apply-button" onClick={handleApply}>
            Apply Settings
          </button>
        </div>
      )}
    </>
  )
}

export default Settings
