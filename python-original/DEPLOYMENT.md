# Deployment Guide

This guide covers how to deploy the Natural Selection Simulator so the Python backend runs automatically.

## Option 1: Platform-as-a-Service (Easiest)

### Heroku

1. **Install Heroku CLI** and login
2. **Create `Procfile`** (already created)
3. **Update `requirements.txt`** to include `gunicorn`:
   ```
   Flask
   flask-cors
   matplotlib
   gunicorn
   ```
4. **Deploy**:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

### Railway

1. **Connect your GitHub repo** to Railway
2. **Add `Procfile`** (already created)
3. **Set environment variables** if needed
4. **Deploy** - Railway auto-detects Python and runs the Procfile

### Render

1. **Create new Web Service** on Render
2. **Connect your GitHub repo**
3. **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
4. **Start Command**: `gunicorn --config gunicorn_config.py app:app`
5. **Environment Variables** (optional):
   - `FLASK_ENV=production`
   - `PYTHON_VERSION=3.11.0`
6. **Deploy**

**Note**: If gunicorn is not found, try using the full path:
- **Start Command**: `python -m gunicorn --config gunicorn_config.py app:app`

Or use the Procfile (Render should auto-detect it):
- Render will automatically use the `Procfile` if present

## Option 2: VPS with systemd (More Control)

### Setup on Ubuntu/Debian Server

1. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv nginx
   ```

2. **Create systemd service** (`/etc/systemd/system/ns-simulation.service`):
   ```ini
   [Unit]
   Description=Natural Selection Simulator API
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/NSSimulation
   Environment="PATH=/path/to/NSSimulation/venv/bin"
   ExecStart=/path/to/NSSimulation/venv/bin/gunicorn --config gunicorn_config.py app:app
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and start**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable ns-simulation
   sudo systemctl start ns-simulation
   sudo systemctl status ns-simulation
   ```

4. **Configure Nginx** as reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:5001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

## Option 3: Docker (Portable)

### Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["gunicorn", "--config", "gunicorn_config.py", "app:app"]
```

### Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5001:5001"
    restart: unless-stopped
    environment:
      - FLASK_ENV=production
```

### Run:
```bash
docker-compose up -d
```

## Option 4: Serve React + Flask Together

For production, you can serve the React build from Flask:

1. **Build React app**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Update `app.py`** to serve static files:
   ```python
   from flask import send_from_directory
   import os

   @app.route('/', defaults={'path': ''})
   @app.route('/<path:path>')
   def serve(path):
       if path != "" and os.path.exists(f"frontend/dist/{path}"):
           return send_from_directory('frontend/dist', path)
       else:
           return send_from_directory('frontend/dist', 'index.html')
   ```

3. **Update React API calls** to use relative paths (remove `http://localhost:5001`)

## Recommended: Railway or Render

For easiest deployment:
- **Railway**: Connect GitHub, auto-deploys, free tier available
- **Render**: Similar to Railway, good free tier
- **Heroku**: Classic option, but has costs now

All of these will automatically run your Python backend when deployed!
