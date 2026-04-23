import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import SimulationGrid from './components/SimulationGrid'
import Controls from './components/Controls'
import Conditions from './components/Conditions'
import Display, { displayDefaults } from './components/Display'
import PopulationGraph from './components/PopulationGraph'
import { Simulation } from './sim/simulation.js'
import { defaultConfig, labelsFor } from './sim/config.js'

// How many ticks of history to keep in the population-graph buffer. Bigger
// = longer time horizon visible on the chart; smaller = less memory. At
// default sim speed (5 ticks/s) 300 entries is the last minute of history.
const HISTORY_MAX = 300

// Empty state used while we wait for the first render and after Reset.
function emptyState() {
  return {
    grid: [],
    food: [],
    alive: false,
    trait_distribution: [],
    trait_counts: [],
    trait_name: defaultConfig.TRAIT_NAME,
    trait_labels: labelsFor(defaultConfig.TRAIT_NAME),
    dead: {},
    organisms: [],
  }
}

function App() {
  // The Simulation instance lives in a ref because it's a mutable object
  // we don't want React to re-create or re-render. We render its *snapshot*
  // (simState) — that's the piece React watches.
  const simRef = useRef(null)
  const [simState, setSimState] = useState(emptyState())
  const [isRunning, setIsRunning] = useState(false)

  // Rolling history of trait counts (one entry per sim step). Used by the
  // PopulationGraph to plot lineages over time. Capped at HISTORY_MAX so
  // memory doesn't grow without bound.
  const [history, setHistory] = useState([])

  // User-controlled simulation config (from the Conditions panel). Applied on Reset.
  const [userConfig, setUserConfig] = useState({})

  // User-controlled display config (from the Display panel). Applied live.
  const [displayConfig, setDisplayConfig] = useState(displayDefaults)

  // Helper: seed both simState and history from a fresh Simulation.
  const syncFromSim = () => {
    const state = simRef.current.getState()
    setSimState(state)
    setHistory([{ counts: state.trait_counts }])
  }

  // Build the initial simulation on first mount.
  useEffect(() => {
    simRef.current = new Simulation(userConfig)
    syncFromSim()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Advance the simulation one tick and push the new snapshot to React.
  // Also appends a new entry to the history buffer for the graph.
  const handleStep = useCallback(() => {
    if (!simRef.current) return
    const stillAlive = simRef.current.step()
    const newState = simRef.current.getState()
    setSimState(newState)
    setHistory((prev) => {
      const next = prev.concat({ counts: newState.trait_counts })
      // Keep only the last HISTORY_MAX entries (tail of the buffer).
      return next.length > HISTORY_MAX ? next.slice(-HISTORY_MAX) : next
    })
    if (!stillAlive) setIsRunning(false)
  }, [])

  const handleRun   = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)

  // Reset rebuilds the Simulation using the latest userConfig overrides.
  // Clears history so the graph starts from a fresh initial generation.
  const handleReset = () => {
    setIsRunning(false)
    simRef.current = new Simulation(userConfig)
    syncFromSim()
  }

  // The "Run" loop: while isRunning, step at the user's chosen cadence.
  // The effect re-runs whenever stepIntervalMs changes, so speed updates
  // apply immediately without needing to pause/resume.
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(handleStep, displayConfig.stepIntervalMs)
    return () => clearInterval(id)
  }, [isRunning, handleStep, displayConfig.stepIntervalMs])

  return (
    <div className="app">
      <Display onChange={setDisplayConfig} initial={displayConfig} />
      <header className="app-header">
        <h1>Natural Selection Simulator</h1>
        <p className="subtitle">
          Watch evolution play out one tick at a time. Pick a trait, tweak the
          environment, and see which variants survive.
        </p>
      </header>
      <Controls
        onStep={handleStep}
        onRun={handleRun}
        onPause={handlePause}
        onReset={handleReset}
        isRunning={isRunning}
        loading={false}
      />
      {/* Grid and graph sit side-by-side on wide screens. On narrow
          screens they stack via the flex-wrap: wrap in .sim-row. */}
      <div className="sim-row">
        <SimulationGrid
          food={simState.food}
          organisms={simState.organisms || []}
          cellSize={displayConfig.cellSize}
          showEnergy={displayConfig.showEnergy}
        />
        <PopulationGraph
          history={history}
          traitLabels={simState.trait_labels}
        />
      </div>
      <Conditions onConfigChange={setUserConfig} />
    </div>
  )
}

export default App
