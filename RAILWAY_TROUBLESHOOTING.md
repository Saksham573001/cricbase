# Railway Deployment Troubleshooting

## Build Error: "Nixpacks was unable to generate a build plan"

**Problem**: You see this error in Railway build logs:
```
Nixpacks was unable to generate a build plan for this app.
```

**Solution**: You MUST set the **Root Directory** in Railway service settings!

1. Go to your Railway service
2. Click **Settings** tab
3. Find **"Root Directory"** field
4. Set it to:
   - `backend` for the backend service
   - `frontend` for the frontend service
5. Save and redeploy

**Why**: The root directory contains both `backend/` and `frontend/` folders. Nixpacks can't detect which one to build, so you must specify it.

## Common Issues

### Backend Service

**Issue**: Build fails with "Unable to detect project type"
- **Fix**: Set Root Directory to `backend` in Settings

**Issue**: "Module not found" errors
- **Fix**: Ensure `requirements.txt` exists in `backend/` directory
- **Fix**: Check that all dependencies are listed in `requirements.txt`

**Issue**: "uvicorn: command not found"
- **Fix**: Ensure `uvicorn` is in `requirements.txt`
- **Fix**: Start command should be: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend Service

**Issue**: Build fails or "npm: command not found"
- **Fix**: Set Root Directory to `frontend` in Settings
- **Fix**: Ensure `package.json` exists in `frontend/` directory

**Issue**: Frontend can't connect to backend
- **Fix**: Set `REACT_APP_API_URL` environment variable to your backend URL
- **Fix**: Backend URL should include `https://` and end with `.railway.app`

**Issue**: Blank page after deployment
- **Fix**: Check browser console for errors
- **Fix**: Verify `REACT_APP_API_URL` is set correctly
- **Fix**: Ensure backend CORS allows your frontend domain

### Environment Variables

**Issue**: Variables not being used
- **Fix**: Variables must be set in Railway dashboard (Settings → Variables)
- **Fix**: Restart service after adding variables
- **Fix**: Variable names are case-sensitive

**Issue**: Backend can't connect to Supabase
- **Fix**: Verify `SUPABASE_URL` and `SUPABASE_KEY` are set correctly
- **Fix**: Check Supabase project is active
- **Fix**: Use the anon/public key, not the service role key (unless needed)

## Verification Steps

After deployment, verify each service:

1. **Backend Health**: Visit `https://your-backend.railway.app/`
   - Should return: `{"message":"CricBase API","version":"1.0.0"}`

2. **Backend Docs**: Visit `https://your-backend.railway.app/docs`
   - Should show Swagger UI

3. **Frontend**: Visit `https://your-frontend.railway.app`
   - Should load the React app
   - Check browser console for errors

4. **API Connection**: In frontend, try to load matches
   - Check Network tab in browser DevTools
   - API calls should go to your backend URL

## Still Having Issues?

1. Check Railway logs (Dashboard → Service → Deployments → View Logs)
2. Check build logs for specific errors
3. Verify all files are committed and pushed to GitHub
4. Try redeploying after fixing configuration
5. Check Railway status page for service outages
