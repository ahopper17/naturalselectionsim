import './PopulationGraph.css'

// Same palette as SimulationGrid.jsx — keeping them in one place is cleaner,
// but duplicating 5 lines is fine for now. If the grid's palette changes
// you'll want to update this array too.
const TRAIT_COLORS = ['#56B4E9', '#CC79A7', '#D55E00', '#009E73', '#0072B2']

// Size of the SVG viewBox. The SVG itself stretches to fill its CSS
// container (preserveAspectRatio="none"), so these numbers are really
// just the coordinate system for laying out paths and gridlines.
const VB_WIDTH  = 700
const VB_HEIGHT = 200

// Inner padding in viewBox units. Labels live in HTML (absolutely
// positioned) so they're not distorted by the SVG's non-uniform scaling;
// these paddings still define the plottable rectangle for the lines.
const PAD = { top: 12, right: 8, bottom: 12, left: 8 }

/**
 * Round `n` up to a "nice" chart maximum — the next multiple of 5 or 10.
 * Prevents the Y axis from flickering on tiny changes.
 */
function niceMax(n) {
  if (n <= 5)  return 5
  if (n <= 10) return 10
  if (n <= 50) return Math.ceil(n / 10) * 10
  return Math.ceil(n / 25) * 25
}

function PopulationGraph({ history, traitLabels = [] }) {
  const pointCount = history?.length || 0
  const hasData = pointCount >= 2

  const numTraits = history?.[0]?.counts?.length || traitLabels.length || 0
  const observedMax = hasData
    ? Math.max(1, ...history.flatMap((d) => d.counts))
    : 10
  const yMax = niceMax(observedMax)

  const plotW = VB_WIDTH  - PAD.left - PAD.right
  const plotH = VB_HEIGHT - PAD.top  - PAD.bottom
  const xScale = (i) => PAD.left + (pointCount <= 1 ? 0 : (i / (pointCount - 1)) * plotW)
  const yScale = (v) => PAD.top + (1 - v / yMax) * plotH

  const paths = Array.from({ length: numTraits }, (_, t) =>
    history.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i).toFixed(1)},${yScale(d.counts[t]).toFixed(1)}`).join(' '),
  )

  // Each gridline: `y` in viewBox coordinates (for the SVG line) and `pct`
  // as a percentage of the total viewBox height (for the HTML label's
  // CSS top, which aligns with the SVG gridline because the SVG and the
  // label column share the same CSS height via flex).
  const gridTicks = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
    const y = PAD.top + (1 - frac) * plotH
    return { y, pct: (y / VB_HEIGHT) * 100, label: Math.round(frac * yMax) }
  })

  return (
    <div className="population-graph">
      <div className="population-graph-header">
        <h3>Population over time</h3>
        <div className="population-graph-legend">
          {traitLabels.map((label, i) => (
            <span key={label + i} className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: TRAIT_COLORS[i % TRAIT_COLORS.length] }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Flex row: Y-axis label column + plot column. Their heights are
          equal (flex siblings on align-items: stretch by default), so a
          label positioned at top: pct% of the axis column lines up with
          the SVG gridline at the same pct of the plot column. */}
      <div className="graph-area">
        <div className="graph-y-axis">
          {gridTicks.map(({ pct, label }) => (
            <div
              key={label}
              className="graph-y-label"
              style={{ top: `${pct}%` }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="graph-plot">
          <svg
            className="population-graph-svg"
            viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="Population over time by trait"
          >
            {/* Horizontal gridlines — stroke stays uniform via non-scaling-stroke */}
            {gridTicks.map(({ y, label }) => (
              <line
                key={label}
                x1={PAD.left} x2={VB_WIDTH - PAD.right}
                y1={y} y2={y}
                className="graph-gridline"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* One path per trait line */}
            {hasData && paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={TRAIT_COLORS[i % TRAIT_COLORS.length]}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="graph-x-label">time →</div>
    </div>
  )
}

export default PopulationGraph
