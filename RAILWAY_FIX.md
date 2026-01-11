# Railway Deployment Fix - Root Directory Issue

## The Problem

Railway is trying to build from the root directory, which contains both `frontend/` and `backend/` folders. Nixpacks can't detect which project to build.

## The Solution

**You MUST configure the Root Directory in Railway dashboard settings. Configuration files alone are not enough!**

## Step-by-Step Fix

### For Backend Service:

1. **Delete the current service** (if it's failing) or **edit the existing one**
2. In Railway dashboard, click on your service
3. Go to **Settings** tab
4. Scroll down to find **"Root Directory"** field
5. **Type exactly**: `backend` (no quotes, no slash, just the word "backend")
6. **Save** the settings
7. **Trigger a new deployment** (Railway should auto-deploy, or click "Redeploy")

### For Frontend Service:

1. Create a new service or edit existing one
2. Go to **Settings** tab
3. Set **Root Directory** to: `frontend`
4. Save and deploy

## Important Notes

- The Root Directory setting is in the Railway **dashboard UI**, not in files
- After setting Root Directory, Railway will look inside that folder for project files
- The `backend/` folder contains `requirements.txt` - Railway will detect Python
- The `frontend/` folder contains `package.json` - Railway will detect Node.js

## Verification

After setting Root Directory to `backend`, the build logs should show:
- Detecting Python project
- Installing dependencies from requirements.txt
- Starting uvicorn server

If you still see the root directory contents in the error, the Root Directory setting wasn't applied correctly. Double-check the settings and save again.

## Alternative: Use Railway CLI

If the dashboard settings aren't working, you can use Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Set root directory for service
railway variables --set RAILWAY_SERVICE_ROOT=backend
```

But the dashboard method should work - just make sure you save the settings!
