# Natural Selection Simulator

A small evolutionary simulation that runs entirely in the browser. Organisms
wander a grid, eat food, reproduce, mutate, and starve. Watch the
distribution of a trait (speed or efficiency) shift generation after
generation under selection pressure.

Live: https://ahopper17.github.io/naturalselectionsim/


## Project layout

```
├── src/
│   ├── components/           React UI
│   │   ├── Controls.jsx
│   │   ├── SimulationGrid.jsx
│   │   ├── Settings.jsx
│   │   └── Stats.jsx
│   ├── sim/                  Simulation logic (pure JS, no DOM)
│   │   ├── config.js
│   │   ├── world.js
│   │   ├── organism.js
│   │   ├── simulation.js
│   │   └── rand.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── python-original/          Original Python + Flask implementation
                              (kept for reference, no longer used)
```

## About the port

The simulation was originally written in Python, served by a Flask
backend with a separate React frontend. It has since been ported to pure
JavaScript so the whole thing runs client-side — no backend, no hosting
costs, trivial to deploy as a static site. The original Python source
is preserved under `python-original/`.
