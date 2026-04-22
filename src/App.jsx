import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import SimulationGrid from './components/SimulationGrid'
import Controls from './components/Controls'
import Stats from './components/Stats'
import Settings from './components/Settings'
import { Simulation } from './sim/simulation.js'
import { defaultConfig, labelsFor } from './sim/config.js'

// Empty state used while we wait for the first render and after Reset.
function emptyState() {
  return {
    grid: [],
    food: [],
    alive: false,
    trait_distribution: [],
    trait_name: defaultConfig.TRAIT_NAME,
    trait_labels: labelsFor(defaultConfig.TRAIT_NAME),
    dead: {},
  }
}

function App() {
  // The Simulation instance lives in a ref because it's a mutable object
  // we don't want React to re-create or re-render. We render its *snapshot*
  // (simState) — that's the piece React watches.
  const simRef = useRef(null)
  const [simState, setSimState] = useState(emptyState())
  const [isRunning, setIsRunning] = useState(false)

  // User-controlled config overrides (from the Settings panel). When this
  // changes and the user hits Reset, we build a fresh Simulation with it.
  const [userConfig, setUserConfig] = useState({})

  // Build the initial simulation on first mount.
  useEffect(() => {
    simRef.current = new Simulation(userConfig)
    setSimState(simRef.current.getState())
    // We only want this to run once on mount; subsequent userConfig changes
    // are applied on Reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Advance the simulation one tick and push the new snapshot to React.
  const handleStep = useCallback(() => {
    if (!simRef.current) return
    const stillAlive = simRef.current.step()
    setSimState(simRef.current.getState())
    if (!stillAlive) setIsRunning(false)
  }, [])

  const handleRun   = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)

  // Reset rebuilds the Simulation using the latest userConfig overrides.
  const handleReset = () => {
    setIsRunning(false)
    simRef.current = new Simulation(userConfig)
    setSimState(simRef.current.getState())
  }

  // The "Run" loop: while isRunning, step every 200ms.
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(handleStep, 200)
    return () => clearInterval(id)
  }, [isRunning, handleStep])

  // Settings calls this every time the user moves a slider. We just stash
  // the overrides; they take effect on the next Reset.
  const handleConfigChange = (newConfig) => {
    setUserConfig(newConfig)
  }

  return (
    <div className="app">
      <Settings
        onConfigChange={handleConfigChange}
        onApply={handleReset}
        initialConfig={userConfig}
      />
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
      <SimulationGrid
        grid={simState.grid}
        food={simState.food}
        dead={simState.dead || {}}
      />
      <Stats
        traitDistribution={simState.trait_distribution}
        traitLabels={simState.trait_labels}
        alive={simState.alive}
      />
    </div>
  )
}

export default App
