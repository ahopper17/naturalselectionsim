import { useState } from 'react'
import './Conditions.css'
import { defaultConfig } from '../sim/config.js'

// Same mapping that Settings.jsx used: UI field names (friendly) →
// Simulation config keys (the SCREAMING_SNAKE_CASE ones the sim actually reads).
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

// Seed the UI with the same defaults the simulation will use.
function uiDefaults() {
  const out = {}
  for (const [uiKey, cfgKey] of Object.entries(UI_TO_CONFIG)) {
    out[uiKey] = defaultConfig[cfgKey]
  }
  return out
}

// Small circular "i" with a hover/focus tooltip. We use a <button> so it's
// keyboard-accessible (tab to focus shows the tooltip via :focus-within).
// The native `title` attribute also shows on long-press for touch devices.
function InfoIcon({ text }) {
  return (
    <span className="info" tabIndex={-1}>
      <button type="button" className="info-icon" title={text} aria-label={text}>
        i
      </button>
      <span className="info-tooltip" role="tooltip">{text}</span>
    </span>
  )
}

// Small subcomponent to cut down on repetition. Takes a label, a current
// value, a range spec, and a change handler. Optional `info` string adds
// a tooltip circle next to the label.
function Knob({ label, value, min, max, step, onChange, format = (v) => v, info }) {
  return (
    <label className="knob">
      <span className="knob-label">
        <span className="knob-label-text">
          {label}
          {info && <InfoIcon text={info} />}
        </span>
        <span className="knob-value">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value, 10))}
      />
    </label>
  )
}

function Conditions({ onConfigChange }) {
  const [settings, setSettings] = useState(uiDefaults())

  // Update one UI field, translate the whole object into sim-config shape,
  // and bubble up. App stashes it; it's applied when the user clicks Reset.
  const handleChange = (uiKey, value) => {
    const next = { ...settings, [uiKey]: value }
    setSettings(next)

    const configOverrides = {}
    for (const [k, cfgKey] of Object.entries(UI_TO_CONFIG)) {
      configOverrides[cfgKey] = next[k]
    }
    onConfigChange?.(configOverrides)
  }

  return (
    <div className="conditions">
      <div className="conditions-header">
        <h2>Starting Conditions</h2>
        <p>Move the knobs, then hit <strong>Reset</strong> to run a new simulation with these values. Hover the <span className="inline-info">i</span> circles for an explanation of each slider.</p>
      </div>

      <div className="conditions-grid">
        {/* SELECTION — what's being selected for */}
        <section className="conditions-section">
          <h3>Selection</h3>
          <label className="knob">
            <span className="knob-label">
              <span className="knob-label-text">
                Trait under selection
                <InfoIcon text="Which trait natural selection acts on. Offspring may inherit a mutated version of this trait (up or down, 50/50). The other trait stays fixed at 1 for the whole run." />
              </span>
              <span className="knob-value">{settings.trait_name}</span>
            </span>
            <select
              className="knob-select"
              value={settings.trait_name}
              onChange={(e) => handleChange('trait_name', e.target.value)}
            >
              <option value="speed">Speed</option>
              <option value="efficiency">Efficiency</option>
            </select>
          </label>
          <Knob
            label="Mutation rate"
            value={settings.mutation_chance}
            min={0} max={0.5} step={0.01}
            onChange={(v) => handleChange('mutation_chance', v)}
            format={(v) => `${(v * 100).toFixed(1)}%`}
            info="Probability that each new offspring's selected trait mutates up or down by one level. Higher rates speed up evolution but add noise. 5% is a balanced default. It's worth noting that real mutation chances are far, far lower, but evolution works on the scale of eons, not silly computer apps."
          />
        </section>

        {/* POPULATION — starting numbers */}
        <section className="conditions-section">
          <h3>Population</h3>
          <Knob
            label="Starting organisms"
            value={settings.num_organisms}
            min={5} max={100} step={5}
            onChange={(v) => handleChange('num_organisms', v)}
            info="How many organisms the simulation begins with. Too few and the population can wink out to extinction from a bad run of luck; too many and the first generation starves itself competing for the initial food."
          />
          <Knob
            label="Starting energy"
            value={settings.starting_energy}
            min={5} max={50} step={1}
            onChange={(v) => handleChange('starting_energy', v)}
            info="Energy each organism spawns with. Every step costs 1/efficiency energy, and eating food adds 1–5. Lower starting energy means tighter early survival."
          />
          <Knob
            label="Food sources"
            value={settings.food_number}
            min={50} max={500} step={10}
            onChange={(v) => handleChange('food_number', v)}
            info="Number of food drops seeded on the grid at the start. Each becomes a permanent source that regrows 0.2/step up to 5. Fewer sources = more competition and stronger selection."
          />
        </section>

        {/* REPRODUCTION — how new organisms appear */}
        <section className="conditions-section">
          <h3>Reproduction</h3>
          <Knob
            label="Guaranteed-reproduction energy"
            value={settings.reproduction_energy_threshold}
            min={10} max={50} step={1}
            onChange={(v) => handleChange('reproduction_energy_threshold', v)}
            info="Above this energy level, an organism will always try to reproduce if there's empty space next to it. Reproduction halves the parent's energy and gives the child the other half."
          />
          <Knob
            label="Chance-reproduction energy"
            value={settings.chance_reproduction_threshold}
            min={5} max={30} step={1}
            onChange={(v) => handleChange('chance_reproduction_threshold', v)}
            info="Lower bound for chance-based reproduction. If energy is between this threshold and the guaranteed one, the organism *may* reproduce on any given step — see the odds slider below."
          />
          <Knob
            label="Chance-reproduction odds"
            value={settings.repro_chance}
            min={0} max={1} step={0.05}
            onChange={(v) => handleChange('repro_chance', v)}
            format={(v) => `${(v * 100).toFixed(0)}%`}
            info="Probability per step that an organism in the chance-reproduction energy range actually reproduces. Set to 0 to disable — only organisms past the guaranteed threshold will have offspring."
          />
        </section>
      </div>
    </div>
  )
}

export default Conditions
