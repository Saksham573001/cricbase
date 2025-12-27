# CricBase - Cricket Social Media Platform

A Reddit-style cricket social platform where users can browse matches, comment on individual deliveries, and discuss cricket stats.

## Features

- 🏏 Browse live and completed matches
- 💬 Comment on individual deliveries (balls)
- 🧵 Reddit-style nested comment threads
- 📊 View player and team statistics
- 👤 User profiles and authentication

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Python (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **Cricket Data**: Cricket Data API (https://cricapi.com/)
- **Deployment**: Railway

## Project Structure

```
cricbase/
├── frontend/          # React frontend application
├── backend/           # Python FastAPI backend
├── supabase/          # Database migrations and configs
│   ├── migrations/    # SQL migration files
│   ├── config.toml    # Supabase CLI configuration
│   └── schema.sql     # Legacy schema (use migrations instead)
└── railway.json       # Railway deployment config
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase account
- Railway account

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

Create `.env` files in both frontend and backend directories with your Supabase credentials. See `SETUP.md` for detailed instructions.

**Cricket Data API (Optional):**
- Get your API key from [Cricket Data API](https://cricapi.com/)
- Add `CRICKET_DATA_API_KEY` to your backend `.env` file
- Without this, the app will use mock data for matches

## Deployment

The project is configured for Railway deployment. Connect your GitHub repository to Railway and it will automatically deploy.

