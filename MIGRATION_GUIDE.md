# Migration Guide: Flask to Vite + React

This guide explains the migration from the original Flask template-based frontend to a modern Vite + React frontend.

## Project Structure

```
NSSimulation/
├── app.py                    # Flask backend (unchanged, with CORS added)
├── simulation/               # Python simulation logic (unchanged)
├── frontend/                 # NEW: Vite + React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   ├── package.json
│   └── vite.config.js
├── static/                   # OLD: Can be removed
├── templates/                # OLD: Can be removed
└── requirements.txt          # Updated with flask-cors
```

## What Changed

### Backend (`app.py`)
- ✅ Added `flask-cors` for CORS support (allows React dev server to connect)
- ✅ Added `/reset` endpoint (POST) to restart the simulation
- ✅ Created `get_simulation_state()` helper function to reduce code duplication
- ✅ Set explicit port 5000

### Frontend (NEW)
- ✅ Complete React rewrite with modern hooks (`useState`, `useEffect`, `useCallback`)
- ✅ Component-based architecture:
  - `Controls.jsx` - Play/Pause/Step/Reset buttons
  - `SimulationGrid.jsx` - Grid visualization with color coding
  - `Stats.jsx` - Trait distribution visualization
- ✅ Modern UI with gradients, backdrop blur, and smooth transitions
- ✅ Vite proxy configuration for seamless API calls

### Simulation Logic (`simulation/simulation.py`)
- ✅ Added `initialize_organisms()` function for reusable initialization
- ✅ Added `reset_simulation()` function to fully reset the simulation state

## Getting Started

### 1. Install Backend Dependencies

```bash
source venv/bin/activate
pip install -r requirements.txt
```

This will install `flask-cors` if you haven't already.

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Run Both Servers

**Terminal 1 - Backend:**
```bash
python app.py
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

The Vite dev server automatically proxies API calls to the Flask backend.

## Features

### What's New
- 🎨 Modern, responsive UI with gradient backgrounds
- ⚡ Faster development experience with Vite HMR
- 🔄 Reset functionality (fully working)
- 📊 Better visualization of trait distribution with progress bars
- 🎯 Component-based architecture for easier maintenance
- 💅 Modern CSS with transitions and hover effects

### What Stayed the Same
- Python simulation logic (unchanged)
- API endpoints (`/step`, `/reset`)
- Simulation mechanics and configuration

## Next Steps for Enhancement

Now that you have a modern React frontend, here are some ideas for expanding:

1. **Configuration Panel**
   - Add UI to change simulation parameters (NUM_ORGANISMS, FOOD_NUMBER, etc.)
   - Trait selection dropdown
   - Real-time parameter updates

2. **Enhanced Visualizations**
   - Line charts for population over time
   - Heat maps for organism density
   - Animation for movement
   - Trail visualization for organism paths

3. **Data Export**
   - Export simulation data as JSON/CSV
   - Save/load simulation states
   - Screenshot functionality

4. **Performance**
   - WebSockets for real-time updates (instead of polling)
   - Canvas-based rendering for better performance
   - Web Workers for heavy computation

5. **Features from Your Notes**
   - Death animations
   - Food cell animations
   - Intelligence/decision-making system
   - Multiple trait tracking

6. **State Management**
   - Consider Redux or Zustand for complex state
   - Simulation history/playback
   - Multiple simulation instances

## Removing Old Files (Optional)

Once you've confirmed everything works, you can remove:

```bash
rm -rf static/
rm -rf templates/
```

The Flask backend no longer serves these files since React handles all UI.

## Deployment

### Development
- Keep both servers running separately (as described above)

### Production
You have two options:

**Option 1: Separate Deployment**
- Deploy Flask backend to a server/Heroku/Railway
- Deploy React frontend to Vercel/Netlify
- Update API URLs in React to point to production backend

**Option 2: Combined**
- Build React app: `npm run build` (in frontend/)
- Serve `dist/` folder from Flask:
  ```python
  from flask import send_from_directory
  
  @app.route('/', defaults={'path': ''})
  @app.route('/<path:path>')
  def serve(path):
      if path != "" and os.path.exists(app.static_folder + '/' + path):
          return send_from_directory(app.static_folder, path)
      else:
          return send_from_directory(app.static_folder, 'index.html')
  ```

## Troubleshooting

### CORS Errors
- Make sure `flask-cors` is installed
- Verify Flask backend is running on port 5000
- Check that `CORS(app)` is called in `app.py`

### API Connection Issues
- Verify Vite proxy config in `frontend/vite.config.js`
- Check browser console for errors
- Ensure Flask backend is running before starting React dev server

### Module Import Errors
- Make sure you're running `npm install` in the `frontend/` directory
- Check Node.js version (should be 16+)

## Questions?

The codebase is now ready for you to build upon! All the React components are modular and easy to extend. Start by exploring `src/App.jsx` to understand the data flow.
