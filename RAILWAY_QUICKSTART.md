# Railway Deployment Quick Start

## Prerequisites Checklist
- [ ] GitHub repository pushed (✅ Done: https://github.com/Saksham573001/cricbase)
- [ ] Railway account created (https://railway.app/)
- [ ] Supabase project with URL and anon key
- [ ] Cricket Data API key (optional, from https://cricapi.com/)

## Step 1: Connect Repository to Railway

1. Go to https://railway.app/dashboard
2. Click **"+ New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway if prompted
5. Select **`Saksham573001/cricbase`** repository
6. Click **"Deploy Now"**

Railway will automatically detect the project and create a service.

## Step 2: Configure Backend Service

1. Railway creates a service - click on it
2. Click **"Settings"** tab
3. Set **Root Directory** to: `backend`
4. Verify **Start Command** is: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Go to **Variables** tab and add:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
CRICKET_DATA_API_KEY=your_cricket_data_api_key
```

6. Click **"Deploy"** - Railway will build and deploy
7. Once deployed, go to **Settings → Networking** and note the **Public Domain** (e.g., `https://cricbase-production-xxxx.up.railway.app`)

## Step 3: Add Frontend Service

1. In your Railway project, click **"+ New Service"**
2. Select **"GitHub Repo"** → Choose `cricbase` repository
3. Click **"Settings"** tab
4. Set **Root Directory** to: `frontend`
5. Set **Start Command** to: `npx serve -s build -l $PORT`
6. Go to **Variables** tab and add:

```
REACT_APP_API_URL=https://your-backend-domain.railway.app
```

Replace `your-backend-domain.railway.app` with the actual domain from Step 2.

7. Railway will automatically detect it's a Node.js project and run `npm install && npm run build`
8. Click **"Deploy"**

## Step 4: Verify Deployment

1. **Backend**: Visit your backend domain → Should see `{"message":"CricBase API","version":"1.0.0"}`
2. **Backend Docs**: Visit `https://your-backend-domain.railway.app/docs` → Should see Swagger UI
3. **Frontend**: Visit your frontend domain → Should see the CricBase app

## Troubleshooting

### Backend won't start
- Check logs in Railway dashboard
- Verify all environment variables are set
- Ensure `requirements.txt` has all dependencies

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` matches your backend domain exactly
- Check backend CORS settings (should allow all origins with `*`)
- Check browser console for errors

### Build fails
- Check Railway logs for specific errors
- Verify Node.js/Python versions are compatible
- Ensure all files are committed to GitHub

## Environment Variables Summary

### Backend
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CRICKET_DATA_API_KEY=54b24db2-d7ef-4fe7-98c7-2f24a3b48e00
```

### Frontend
```
REACT_APP_API_URL=https://your-backend.railway.app
```

## Next Steps

- [ ] Test the deployed application
- [ ] Set up custom domains (optional)
- [ ] Configure monitoring and alerts
- [ ] Set up database backups in Supabase

## Cost Estimate

Railway free tier includes $5 credit per month, which should cover:
- Backend service: ~$0.50-1.00/month (idle)
- Frontend service: ~$0.50-1.00/month (idle)
- Total: ~$1-2/month for low traffic

For production use, monitor your usage in Railway dashboard.
