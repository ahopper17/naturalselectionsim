# Natural Selection Simulator

A natural selection simulator with a modern React frontend and Python Flask backend.

## Quick Start

### Backend Setup
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Run Flask backend
python app.py
```
Backend runs on `http://localhost:5000`

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend runs on `http://localhost:5173`

Visit `http://localhost:5173` to see the simulation!

## Project Structure

- `app.py` - Flask backend API
- `simulation/` - Python simulation logic
- `frontend/` - Vite + React frontend

## Features

- Real-time natural selection simulation
- Interactive controls (Step, Run, Pause, Reset)
- Trait distribution visualization
- Modern React UI with smooth animations

## Migration

If you're migrating from the old Flask template version, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details.