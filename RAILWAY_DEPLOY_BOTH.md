# Railway Deployment: Deploy BOTH Frontend & Backend

## Overview

You need to deploy **TWO separate services** on Railway:

1. **Backend Service** - FastAPI server (handles API requests)
2. **Frontend Service** - React app (serves the UI to users)

Both services are needed because:
- Frontend makes API calls to the backend
- Users access the frontend, which then connects to the backend
- They can be scaled independently

---

## Step 1: Deploy Backend Service

1. Go to Railway dashboard: https://railway.app/dashboard
2. Click **"+ New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `cricbase` repository
5. Railway creates the first service - **configure it for backend:**

   **Settings Tab:**
   - **Name**: `cricbase-backend` (optional, for clarity)
   - **Root Directory**: `backend` ⚠️ **CRITICAL - MUST SET THIS**
   
   **Variables Tab** (add these):
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   CRICKET_DATA_API_KEY=your_cricket_api_key
   ```

6. Railway will auto-detect it's a Python project and build it
7. Once deployed, go to **Settings → Networking** 
8. Note the **Public Domain** (e.g., `https://cricbase-backend-production-xxxx.up.railway.app`)
   - You'll need this URL for the frontend!

---

## Step 2: Deploy Frontend Service

1. In the **same Railway project**, click **"+ New Service"**
2. Select **"GitHub Repo"** → Choose `cricbase` repository again
3. **Configure it for frontend:**

   **Settings Tab:**
   - **Name**: `cricbase-frontend` (optional)
   - **Root Directory**: `frontend` ⚠️ **CRITICAL - MUST SET THIS**
   - **Start Command**: `npx serve -s build -l $PORT`
     - Railway will auto-build, but you need to set the start command
   
   **Variables Tab** (add this):
   ```
   REACT_APP_API_URL=https://your-backend-domain.railway.app
   ```
   ⚠️ Replace `your-backend-domain.railway.app` with the actual backend domain from Step 1!

4. Railway will build the React app and serve it
5. Once deployed, get the **Public Domain** from Settings → Networking

---

## Visual Guide

```
Railway Project: "cricbase"
├── Service 1: "Backend" (or "cricbase-backend")
│   ├── Root Directory: backend
│   ├── Variables: SUPABASE_URL, SUPABASE_KEY, CRICKET_DATA_API_KEY
│   └── Domain: https://backend-xxxx.railway.app
│
└── Service 2: "Frontend" (or "cricbase-frontend")
    ├── Root Directory: frontend
    ├── Variables: REACT_APP_API_URL=https://backend-xxxx.railway.app
    └── Domain: https://frontend-xxxx.railway.app
```

---

## Verification

After both services are deployed:

1. **Test Backend**: Visit `https://backend-xxxx.railway.app/`
   - Should return: `{"message":"CricBase API","version":"1.0.0"}`

2. **Test Backend Docs**: Visit `https://backend-xxxx.railway.app/docs`
   - Should show Swagger UI

3. **Test Frontend**: Visit `https://frontend-xxxx.railway.app`
   - Should load the CricBase React app
   - Check browser console - API calls should go to your backend URL

---

## Alternative: Single Service (Not Recommended)

If you want to deploy only one service, you'd need to:
- Serve the frontend as static files from the backend
- More complex setup
- Less flexible for scaling
- **Not recommended** for production

We recommend deploying both services separately for better architecture.

---

## Cost

Railway free tier ($5/month credit):
- Backend service: ~$0.50-1.00/month (when idle)
- Frontend service: ~$0.50-1.00/month (when idle)
- Total: ~$1-2/month for low traffic

Both services together are affordable on the free tier!
