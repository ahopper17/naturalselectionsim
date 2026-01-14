# Natural Selection Simulator - Frontend

This is the React + Vite frontend for the Natural Selection Simulator.

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Make sure the Flask backend is running

In a separate terminal, start the Flask backend:

```bash
cd ..
source venv/bin/activate  # or your venv activation command
pip install -r requirements.txt  # if you haven't already
python app.py
```

The backend runs on `http://localhost:5000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Controls.jsx       # Play/Pause/Step/Reset buttons
│   │   ├── SimulationGrid.jsx # The grid visualization
│   │   └── Stats.jsx          # Trait distribution charts
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── vite.config.js            # Vite configuration with proxy
└── package.json

```

## Features

- Modern React components with hooks
- Real-time simulation visualization
- Interactive controls (Step, Run, Pause, Reset)
- Trait distribution visualization
- Responsive design with modern UI
