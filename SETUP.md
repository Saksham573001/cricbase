# CricBase Setup Guide

## Environment Variables

### Backend (.env in backend/ directory)

Create a `.env` file in the `backend/` directory with the following variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=8000
```

### Frontend (.env in frontend/ directory)

Create a `.env` file in the `frontend/` directory with the following variables:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Your Supabase Credentials

1. Go to [Supabase](https://supabase.com) and create an account (if you don't have one)
2. Create a new project
3. Go to Project Settings > API
4. Copy the following:
   - **Project URL** → Use this for `SUPABASE_URL` and `REACT_APP_SUPABASE_URL`
   - **anon/public key** → Use this for `SUPABASE_KEY` and `REACT_APP_SUPABASE_ANON_KEY`

## Database Setup

### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI (choose one method):

   **macOS (Homebrew - Recommended):**
   ```bash
   brew install supabase/tap/supabase
   ```

   **Linux/macOS (Direct download):**
   ```bash
   curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
   sudo mv supabase /usr/local/bin/
   ```

   **Using npx (no installation):**
   ```bash
   npx supabase <command>
   ```

   **Note:** `npm install -g supabase` is no longer supported by Supabase.

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   Find your project ref in your Supabase dashboard URL: `https://app.supabase.com/project/<project-ref>`

4. Push migrations:
   ```bash
   supabase db push
   ```

5. Create sample users (for seed data):
   - Go to Supabase Dashboard > Authentication > Users
   - Create users: `cricket_lover@cricbase.com`, `stats_guru@cricbase.com`, `bowling_fan@cricbase.com`
   - Note their UUIDs and update the seed migration file, or manually insert them in the users table

### Option 2: Manual SQL Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run migrations in order:
   - Copy and paste the contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Run the SQL script
   - (Optional) Copy and paste the contents of `supabase/migrations/20240101000001_seed_data.sql` for sample data
4. Create auth users via Authentication > Users if using seed data

See `supabase/README.md` for detailed migration instructions.

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## Deployment to Railway

1. Push your code to GitHub
2. Go to [Railway](https://railway.app) and sign in
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect the backend configuration from `railway.json`
6. Add environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `PORT` (optional, Railway will set this automatically)
   - `CRICKET_DATA_API_KEY` (optional, for live cricket data)
7. Your backend will be deployed automatically

Note: For frontend deployment, you may need to deploy it separately (e.g., using Vercel, Netlify, or Railway) and update `REACT_APP_API_URL` to point to your deployed backend URL.
