# Railway Deployment Guide

This guide will help you deploy CricBase to Railway, with both backend and frontend services.

## Prerequisites

- GitHub repository (already done: https://github.com/Saksham573001/cricbase)
- Railway account (sign up at https://railway.app/)
- Supabase project with credentials
- Cricket Data API key (optional, from https://cricapi.com/)

## Deployment Strategy

Railway can deploy multiple services. We'll deploy:
1. **Backend Service**: FastAPI backend
2. **Frontend Service**: React frontend (separate service, or served as static files)

### Option 1: Two Services (Recommended)

Deploy backend and frontend as separate Railway services. This gives you:
- Independent scaling
- Separate domains/URLs
- Better separation of concerns

### Option 2: Single Service

Serve the frontend as static files from the backend. Simpler but less flexible.

## Step-by-Step Deployment

### Step 1: Connect GitHub to Railway

1. Go to https://railway.app/ and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account if prompted
5. Select the `Saksham573001/cricbase` repository
6. Railway will detect the project structure

### Step 2: Deploy Backend Service

1. Railway will automatically create a service from the root directory
2. **Configure the service**:
   - Click on the service
   - Go to "Settings" tab
   - **Root Directory**: Set to `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables** (Settings → Variables):
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   CRICKET_DATA_API_KEY=your_cricket_data_api_key
   PORT=8000
   ```

4. **Deploy**: Railway will automatically start building and deploying
5. Once deployed, note the **Public Domain** (e.g., `https://your-backend.railway.app`)

### Step 3: Deploy Frontend Service

1. Click "+ New Service" in your Railway project
2. Select "GitHub Repo" and choose the same repository
3. **Configure the service**:
   - **Root Directory**: Set to `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l $PORT`

4. **Add Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app
   PORT=3000
   ```
   Replace `your-backend.railway.app` with your actual backend domain from Step 2.

5. Railway will build and deploy the frontend

### Step 4: Update Frontend API Configuration

The frontend needs to know the backend URL. Update `frontend/src/config/api.ts` to use the Railway backend URL in production:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

This is already configured! Just set the `REACT_APP_API_URL` environment variable in Railway.

### Step 5: Set Custom Domains (Optional)

1. For backend: Settings → Networking → Add Custom Domain
2. For frontend: Settings → Networking → Add Custom Domain

## Environment Variables Reference

### Backend Service
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_anon_key
CRICKET_DATA_API_KEY=your_api_key (optional)
PORT=8000 (Railway sets this automatically)
```

### Frontend Service
```
REACT_APP_API_URL=https://your-backend.railway.app
PORT=3000 (Railway sets this automatically)
```

## Verifying Deployment

1. **Backend Health Check**: Visit `https://your-backend.railway.app/` - should return JSON
2. **Backend API Docs**: Visit `https://your-backend.railway.app/docs` - should show Swagger UI
3. **Frontend**: Visit your frontend URL - should load the React app

## Troubleshooting

### Backend Issues

- **Build fails**: Check that all dependencies are in `requirements.txt`
- **Service crashes**: Check logs in Railway dashboard
- **API not accessible**: Verify environment variables are set correctly
- **CORS errors**: Backend CORS is set to allow all origins (`*`), should work

### Frontend Issues

- **Can't connect to backend**: Verify `REACT_APP_API_URL` is set correctly
- **Build fails**: Check Node.js version (Railway should auto-detect)
- **Blank page**: Check browser console for errors

### Common Issues

1. **Environment variables not working**: 
   - Make sure they're set in Railway, not just locally
   - Restart the service after adding variables

2. **API calls failing**:
   - Check CORS settings in backend
   - Verify backend URL in frontend env var
   - Check browser console network tab

3. **Database connection issues**:
   - Verify Supabase credentials
   - Check Supabase project is active
   - Ensure IP is allowed (if restrictions set)

## Cost Considerations

Railway offers:
- Free tier: $5 credit monthly
- Pay-as-you-go after free tier
- Both services will use Railway resources

## Next Steps

1. Set up monitoring (Railway provides logs)
2. Configure database backups in Supabase
3. Set up custom domains
4. Enable HTTPS (Railway provides this automatically)
5. Configure CI/CD (already set up via GitHub connection)

## Alternative: Single Service Deployment

If you prefer a single service, you can modify the backend to serve the frontend as static files:

1. In `backend/main.py`, add static file serving:
```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# After app creation
if os.path.exists("../frontend/build"):
    app.mount("/static", StaticFiles(directory="../frontend/build/static"), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs"):
            raise HTTPException(404)
        return FileResponse("../frontend/build/index.html")
```

2. Update build process to build frontend first, then backend
3. Use only one Railway service

This approach is more complex but reduces costs.
