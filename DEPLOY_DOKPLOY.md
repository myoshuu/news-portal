# Deployment Guide for Dokploy + Cloudflare Tunnel

## Architecture

```
Cloudflare Tunnel
    ├── yourdomain.com    → Frontend (port 3000)
    └── api.yourdomain.com → Backend (port 5000)
```

## Setup

### 1. Push to Git
```bash
git add .
git commit -m "Add Docker setup for Dokploy"
git push
```

### 2. Create Deployments in Dokploy

**Backend:**
- Type: Dockerfile Deploy
- Dockerfile: `Dockerfile.backend`
- Port: `5000`
- Environment Variables:
  ```
  MONGODB_URI=mongodb://your-mongo:27017/news-portal
  JWT_SECRET=your-secure-random-string
  PORT=5000
  ```

**Frontend:**
- Type: Dockerfile Deploy
- Dockerfile: `Dockerfile.frontend`
- Port: `3000`
- Environment Variables (for build):
  ```
  VITE_API_URL=https://api.yourdomain.com
  ```

### 3. Cloudflare Tunnel Configuration

Connect both services to your Cloudflare Tunnel:

```bash
# Option A: Two separate tunnels (recommended)
cloudflared tunnel run --token=<frontend-token> -port 3000
cloudflared tunnel run --token=<backend-token> -port 5000

# Option B: One tunnel with routes
cloudflared tunnel run --token=<tunnel-token>
```

### 4. Cloudflare Dashboard Routes

Create DNS records:
| Type | Name | Target |
|------|------|--------|
| CNAME | yourdomain.com | tunnel->frontend |
| CNAME | api | tunnel->backend |

### 5. Local Testing

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Important Notes

1. **Update Vite config** for production API URL - set `VITE_API_URL` to your API domain
2. **CORS** is already configured in the backend (`cors` package)
3. **File uploads** go through the backend directly at `/uploads`
