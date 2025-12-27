# CricBase Backend

FastAPI backend for the CricBase cricket social platform.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
CRICKET_DATA_API_KEY=your_cricket_data_api_key  # Optional, for live match data
```

4. Run the development server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

- `GET /matches` - Get all matches (optional `status` query param)
- `GET /matches/{match_id}` - Get a specific match
- `GET /deliveries/feed` - Get recent deliveries for feed
- `GET /deliveries/{delivery_id}` - Get a specific delivery
- `GET /deliveries/{delivery_id}/comments` - Get comments for a delivery
- `POST /deliveries/{delivery_id}/comments` - Create a comment
- `POST /comments/{comment_id}/vote` - Vote on a comment
- `GET /stats/players` - Get player statistics
- `GET /stats/teams` - Get team statistics



# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push