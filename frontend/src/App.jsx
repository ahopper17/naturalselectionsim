import { useState, useEffect, useCallback } from 'react'
import './App.css'
import SimulationGrid from './components/SimulationGrid'
import Controls from './components/Controls'
import Stats from './components/Stats'
import Settings from './components/Settings'

// API base URL - in development, call Flask directly
const API_BASE = 'http://localhost:5001'

function App() {
  const [simulationState, setSimulationState] = useState({
    grid: [],
    food: [],
    alive: false,
    trait_distribution: [],
    trait_name: 'speed',
    trait_labels: ['Slow', 'Medium', 'Fast'],
    dead: {}
  })
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchStep = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/step`)
      if (!response.ok) throw new Error('Failed to fetch step')
      const data = await response.json()
      setSimulationState(data)
      if (!data.alive && isRunning) {
        setIsRunning(false)
      }
    } catch (error) {
      console.error('Error fetching step:', error)
    } finally {
      setLoading(false)
    }
  }, [isRunning])

  const handleStep = () => {
    fetchStep()
  }

  const handleRun = () => {
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = async () => {
    try {
      const response = await fetch(`${API_BASE}/reset`, { method: 'POST' })
      if (!response.ok) throw new Error('Failed to reset')
      const data = await response.json()
      setSimulationState(data)
      setIsRunning(false)
    } catch (error) {
      console.error('Error resetting:', error)
    }
  }

  useEffect(() => {
    let intervalId = null
    if (isRunning && simulationState.alive) {
      intervalId = setInterval(() => {
        fetchStep()
      }, 300)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isRunning, simulationState.alive, fetchStep])

  // Initial load - get current state without advancing
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        setLoading(true)
        console.log('Fetching from:', `${API_BASE}/state`)
        const response = await fetch(`${API_BASE}/state`)
        console.log('Response status:', response.status, response.statusText)
        if (!response.ok) {
          const text = await response.text()
          console.error('Response error text:', text)
          throw new Error(`Failed to fetch state: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        console.log('Received data:', data)
        setSimulationState(data)
      } catch (error) {
        console.error('Error fetching initial state:', error)
        console.error('Error details:', error.message)
        // Set a default state so the UI doesn't break
        setSimulationState({
          grid: [],
          food: [],
          alive: false,
          trait_distribution: [],
          trait_name: 'speed',
          trait_labels: ['Slow', 'Medium', 'Fast'],
          dead: {}
        })
      } finally {
        setLoading(false)
      }
    }
    loadInitialState()
  }, [])

  const handleConfigChange = () => {
    // Config was changed, user should reset to apply
    console.log('Config changed, reset recommended')
  }

  return (
    <div className="app">
      <Settings onConfigChange={handleConfigChange} />
      <h1>Natural Selection Simulator</h1>
      <Controls
        onStep={handleStep}
        onRun={handleRun}
        onPause={handlePause}
        onReset={handleReset}
        isRunning={isRunning}
        loading={loading}
      />
      <SimulationGrid 
        grid={simulationState.grid} 
        food={simulationState.food} 
        dead={simulationState.dead || {}}
      />
      <Stats
        traitDistribution={simulationState.trait_distribution}
        traitLabels={simulationState.trait_labels || ['Slow', 'Medium', 'Fast']}
        alive={simulationState.alive}
      />
    </div>
  )
}

export default App
