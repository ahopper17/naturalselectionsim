import './Controls.css'

function Controls({ onStep, onRun, onPause, onReset, isRunning, loading }) {
  return (
    <div className="controls">
      <button
        onClick={onStep}
        disabled={isRunning || loading}
        className="btn btn-secondary"
      >
        Step
      </button>
      {!isRunning ? (
        <button
          onClick={onRun}
          disabled={loading}
          className="btn btn-primary"
        >
          Run
        </button>
      ) : (
        <button
          onClick={onPause}
          className="btn btn-warning"
        >
          Pause
        </button>
      )}
      <button
        onClick={onReset}
        disabled={loading}
        className="btn btn-danger"
      >
        Reset
      </button>
    </div>
  )
}

export default Controls
