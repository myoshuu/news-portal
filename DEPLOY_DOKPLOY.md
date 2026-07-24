# Dokploy Deployment Guide

## Setup Two Separate Apps

### App 1: Backend

1. **Create App** → Name: `backend`
2. **Build Type**: Dockerfile
3. **Dockerfile**: `Dockerfile.backend`
4. **Port**: `5000`
5. **Health Check**: `/api/health` (or any existing endpoint)
6. **Environment Variables**:
   ```
   PORT=5000
   MONGODB_URI=mongodb://your-mongo:27017/news-portal
   JWT_SECRET=your-secure-random-string
   ```

### App 2: Frontend

1. **Create App** → Name: `frontend`
2. **Build Type**: Dockerfile
3. **Dockerfile**: `Dockerfile.frontend`
4. **Port**: `3000`
5. **Build Environment Variables**:
   ```
   VITE_API_URL=https://api.yourdomain.com
   ```

## Cloudflare Tunnel Routes

```
yourdomain.com     → Frontend (port 3000)
api.yourdomain.com → Backend (port 5000)
```

## Key Changes Made

1. **Dockerfile.backend** - Standalone, no workspace references
2. **Dockerfile.frontend** - Standalone, builds with `bunx vite build`
3. Removed `docker-compose.yml` - not needed for Dokploy separate deployments

## Testing Locally

```bash
# Build backend
docker build -f Dockerfile.backend -t backend .

# Build frontend
docker build -f Dockerfile.frontend -t frontend .

# Run
docker run -p 5000:5000 -e MONGODB_URI=... -e JWT_SECRET=... backend
docker run -p 3000:3000 frontend
```
