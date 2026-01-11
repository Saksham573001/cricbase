from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = FastAPI(title="CricBase API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_KEY", "")

if not supabase_url or not supabase_key:
    raise ValueError(
        "Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY environment variables.\n"
        "Create a .env file in the backend/ directory with:\n"
        "SUPABASE_URL=your_supabase_project_url\n"
        "SUPABASE_KEY=your_supabase_anon_key"
    )
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize Cricket Data API (optional - will use mock data if not configured)
cricket_api = None
cricket_data_api_key = os.getenv("CRICKET_DATA_API_KEY")
if cricket_data_api_key:
    try:
        from cricket_data_api import CricketDataAPI
        cricket_api = CricketDataAPI(api_key=cricket_data_api_key)
        print("Cricket Data API initialized successfully.")
    except (ValueError, ImportError) as e:
        print(f"Warning: Could not initialize Cricket Data API: {e}. Proceeding without external API.")
        cricket_api = None
else:
    print("CRICKET_DATA_API_KEY not set. Proceeding without external API.")

# Initialize Live Matches API (preferred for live matches)
try:
    from live_matches_api import LiveMatchesAPI
    live_matches_api = LiveMatchesAPI()
    print("Live Matches API initialized successfully.")
except ImportError as e:
    print(f"Warning: Could not initialize Live Matches API: {e}. Proceeding without it.")
    live_matches_api = None

security = HTTPBearer()

# Pydantic models
class User(BaseModel):
    id: str
    username: str
    email: str
    avatar: Optional[str] = None
    createdAt: str

class Match(BaseModel):
    id: str
    team1: str
    team2: str
    team1Logo: Optional[str] = None
    team2Logo: Optional[str] = None
    venue: str
    status: str  # 'live', 'completed', 'upcoming'
    date: str
    format: str  # 'T20', 'ODI', 'Test'
    score: Optional[dict] = None
    currentOver: Optional[int] = None
    currentBall: Optional[int] = None

class Delivery(BaseModel):
    id: str
    matchId: str
    over: int
    ball: int
    bowler: str
    batsman: str
    runs: int
    isWicket: bool
    wicketType: Optional[str] = None
    isFour: bool
    isSix: bool
    description: str
    timestamp: str
    commentCount: int = 0

class Comment(BaseModel):
    id: str
    deliveryId: str
    userId: str
    user: User
    content: str
    createdAt: str
    upvotes: int = 0
    downvotes: int = 0
    parentId: Optional[str] = None
    replies: Optional[List['Comment']] = None
    userVote: Optional[str] = None

class CommentCreate(BaseModel):
    content: str
    parentId: Optional[str] = None

class VoteRequest(BaseModel):
    vote: str  # 'up' or 'down'

class PlayerStats(BaseModel):
    playerId: str
    playerName: str
    matches: int
    runs: int
    wickets: int
    average: float
    strikeRate: float
    economy: Optional[float] = None

class TeamStats(BaseModel):
    teamId: str
    teamName: str
    matches: int
    wins: int
    losses: int
    winPercentage: float

# Helper function to get current user (simplified for now)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # In production, verify JWT token with Supabase
    # For now, return a mock user
    return {
        "id": "1",
        "username": "current_user",
        "email": "user@example.com",
        "createdAt": datetime.now().isoformat()
    }

# Routes
@app.get("/")
async def root():
    return {"message": "CricBase API", "version": "1.0.0"}

@app.get("/matches", response_model=List[Match])
async def get_matches(status: Optional[str] = None, offset: int = 0):
    """Get all matches, optionally filtered by status. Uses Live Matches API preferentially."""
    try:
        # Try Live Matches API first (preferred for live matches)
        if live_matches_api:
            try:
                api_matches = await live_matches_api.get_live_matches()
                
                # Transform API matches to our schema
                matches = [live_matches_api.transform_match_to_schema(match) for match in api_matches]
                
                # Filter by status if needed
                if status:
                    matches = [m for m in matches if m.get("status") == status]
                
                print(f"Fetched {len(matches)} matches from Live Matches API")
                return matches
            except Exception as api_error:
                print(f"Error calling Live Matches API: {api_error}. Trying Cricket Data API.")
        
        # Fallback to Cricket Data API
        if cricket_api:
            try:
                if status == "live":
                    api_matches = await cricket_api.get_current_matches(offset=offset)
                else:
                    api_matches = await cricket_api.get_all_matches(offset=offset)
                
                # Transform API matches to our schema
                matches = [cricket_api.transform_match_to_schema(match) for match in api_matches]
                
                # Filter by status if needed (for non-live requests)
                if status and status != "live":
                    matches = [m for m in matches if m.get("status") == status]
                
                print(f"Fetched {len(matches)} matches from Cricket Data API")
                return matches
            except Exception as api_error:
                print(f"Error calling Cricket Data API: {api_error}. Falling back to Supabase.")
        
        # Fallback to Supabase
        # query = supabase.table("matches").select("*")
        # if status:
        #     query = query.eq("status", status)
        # result = query.order("date", desc=True).execute()
        # # Convert snake_case to camelCase
        # matches = []
        # for item in result.data:
        #     match_data = {
        #         "id": item.get("id"),
        #         "team1": item.get("team1"),
        #         "team2": item.get("team2"),
        #         "team1Logo": item.get("team1_logo"),
        #         "team2Logo": item.get("team2_logo"),
        #         "venue": item.get("venue"),
        #         "status": item.get("status"),
        #         "date": item.get("date"),
        #         "format": item.get("format"),
        #         "score": item.get("score"),
        #         "currentOver": item.get("current_over"),
        #         "currentBall": item.get("current_ball")
        #     }
        #     matches.append(match_data)
        return []
    except Exception as e:
        print(f"Error fetching matches: {e}")
        # Return mock data for development
        return get_mock_matches(status)

@app.get("/matches/{match_id}", response_model=Match)
async def get_match(match_id: str):
    """Get a specific match by ID. Calls Live Matches API statistics endpoint."""
    try:
        # Try Live Matches API statistics endpoint first
        if live_matches_api:
            try:
                stats_data = await live_matches_api.get_match_statistics(match_id)
                if stats_data:
                    transformed = live_matches_api.transform_match_statistics_to_schema(stats_data, match_id)
                    print(f"Fetched match {match_id} statistics from Live Matches API")
                    return transformed
            except Exception as api_error:
                print(f"Error calling Live Matches API for match {match_id}: {api_error}. Trying other sources.")
        
        # Try Cricket Data API (only if match_id looks like a UUID)
        import re
        uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
        
        if cricket_api and uuid_pattern.match(match_id):
            try:
                match_data = await cricket_api.get_match_info(match_id)
                if match_data:
                    transformed = cricket_api.transform_match_to_schema(match_data)
                    print(f"Fetched match {match_id} from Cricket Data API")
                    return transformed
            except Exception as api_error:
                print(f"Error calling Cricket Data API for match {match_id}: {api_error}. Falling back to Supabase.")
        
        # Fallback to Supabase
        result = supabase.table("matches").select("*").eq("id", match_id).execute()
        if result.data:
            item = result.data[0]
            # Convert snake_case to camelCase
            match_data = {
                "id": item.get("id"),
                "team1": item.get("team1"),
                "team2": item.get("team2"),
                "team1Logo": item.get("team1_logo"),
                "team2Logo": item.get("team2_logo"),
                "venue": item.get("venue"),
                "status": item.get("status"),
                "date": item.get("date"),
                "format": item.get("format"),
                "score": item.get("score"),
                "currentOver": item.get("current_over"),
                "currentBall": item.get("current_ball")
            }
            return match_data
        raise HTTPException(status_code=404, detail="Match not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching match: {str(e)}")

@app.get("/deliveries/feed", response_model=List[Delivery])
async def get_deliveries_feed(limit: int = 20):
    """Get recent deliveries for the feed"""
    try:
        result = supabase.table("deliveries").select("*").order("timestamp", desc=True).limit(limit).execute()
        # Convert snake_case to camelCase for response
        deliveries = []
        for item in result.data:
            delivery = {
                "id": item.get("id"),
                "matchId": item.get("match_id"),
                "over": item.get("over"),
                "ball": item.get("ball"),
                "bowler": item.get("bowler"),
                "batsman": item.get("batsman"),
                "runs": item.get("runs", 0),
                "isWicket": item.get("is_wicket", False),
                "wicketType": item.get("wicket_type"),
                "isFour": item.get("is_four", False),
                "isSix": item.get("is_six", False),
                "description": item.get("description"),
                "timestamp": item.get("timestamp") or item.get("created_at"),
                "commentCount": item.get("comment_count", 0)
            }
            deliveries.append(delivery)
        return deliveries
    except Exception as e:
        # Return mock data for development
        return get_mock_deliveries()

@app.get("/deliveries/match/{match_id}", response_model=List[Delivery])
async def get_match_deliveries(match_id: str):
    """Get all deliveries for a specific match"""
    try:
        result = supabase.table("deliveries").select("*").eq("match_id", match_id).order("over", desc=False).order("ball", desc=False).execute()
        # Convert snake_case to camelCase
        deliveries = []
        for item in result.data:
            delivery = {
                "id": item.get("id"),
                "matchId": item.get("match_id"),
                "over": item.get("over"),
                "ball": item.get("ball"),
                "bowler": item.get("bowler"),
                "batsman": item.get("batsman"),
                "runs": item.get("runs", 0),
                "isWicket": item.get("is_wicket", False),
                "wicketType": item.get("wicket_type"),
                "isFour": item.get("is_four", False),
                "isSix": item.get("is_six", False),
                "description": item.get("description"),
                "timestamp": item.get("timestamp") or item.get("created_at"),
                "commentCount": item.get("comment_count", 0)
            }
            deliveries.append(delivery)
        return deliveries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching match deliveries: {str(e)}")

@app.get("/deliveries/{delivery_id}", response_model=Delivery)
async def get_delivery(delivery_id: str):
    """Get a specific delivery by ID"""
    try:
        result = supabase.table("deliveries").select("*").eq("id", delivery_id).execute()
        if result.data:
            item = result.data[0]
            # Convert snake_case to camelCase
            delivery = {
                "id": item.get("id"),
                "matchId": item.get("match_id"),
                "over": item.get("over"),
                "ball": item.get("ball"),
                "bowler": item.get("bowler"),
                "batsman": item.get("batsman"),
                "runs": item.get("runs", 0),
                "isWicket": item.get("is_wicket", False),
                "wicketType": item.get("wicket_type"),
                "isFour": item.get("is_four", False),
                "isSix": item.get("is_six", False),
                "description": item.get("description"),
                "timestamp": item.get("timestamp") or item.get("created_at"),
                "commentCount": item.get("comment_count", 0)
            }
            return delivery
        raise HTTPException(status_code=404, detail="Delivery not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching delivery: {str(e)}")

@app.get("/deliveries/{delivery_id}/comments", response_model=List[Comment])
async def get_comments(delivery_id: str):
    """Get all comments for a delivery, organized in a thread structure"""
    try:
        result = supabase.table("comments").select("*, user:users(*)").eq("delivery_id", delivery_id).order("created_at", desc=False).execute()
        comments = result.data
        
        # Convert user data from snake_case to camelCase
        for comment in comments:
            user_data = comment.get("user", {})
            if user_data and isinstance(user_data, dict):
                comment["user"] = {
                    "id": user_data.get("id"),
                    "username": user_data.get("username"),
                    "email": user_data.get("email"),
                    "avatar": user_data.get("avatar"),
                    "createdAt": user_data.get("created_at")
                }
        
        # Organize comments into thread structure
        comment_map = {}
        root_comments = []
        
        for comment in comments:
            comment_obj = {
                "id": comment["id"],
                "deliveryId": comment["delivery_id"],
                "userId": comment["user_id"],
                "user": comment.get("user", {}),
                "content": comment["content"],
                "createdAt": comment["created_at"],
                "upvotes": comment.get("upvotes", 0),
                "downvotes": comment.get("downvotes", 0),
                "parentId": comment.get("parent_id"),
                "replies": []
            }
            comment_map[comment["id"]] = comment_obj
            
            if comment.get("parent_id"):
                if comment["parent_id"] in comment_map:
                    comment_map[comment["parent_id"]]["replies"].append(comment_obj)
            else:
                root_comments.append(comment_obj)
        
        return root_comments
    except Exception as e:
        # Return mock data for development
        return get_mock_comments()

@app.post("/deliveries/{delivery_id}/comments", response_model=Comment)
async def create_comment(
    delivery_id: str,
    comment_data: CommentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new comment on a delivery"""
    try:
        comment = {
            "delivery_id": delivery_id,
            "user_id": current_user["id"],
            "content": comment_data.content,
            "parent_id": comment_data.parentId,
            "upvotes": 0,
            "downvotes": 0,
            "created_at": datetime.now().isoformat()
        }
        result = supabase.table("comments").insert(comment).execute()
        
        # Update delivery comment count
        delivery_result = supabase.table("deliveries").select("comment_count").eq("id", delivery_id).execute()
        current_count = delivery_result.data[0].get("comment_count", 0) if delivery_result.data else 0
        supabase.table("deliveries").update({"comment_count": current_count + 1}).eq("id", delivery_id).execute()
        
        user_obj = {
            "id": current_user["id"],
            "username": current_user.get("username", "user"),
            "email": current_user.get("email", ""),
            "avatar": current_user.get("avatar"),
            "createdAt": current_user.get("createdAt", datetime.now().isoformat())
        }
        
        return {
            "id": result.data[0]["id"],
            "deliveryId": delivery_id,
            "userId": current_user["id"],
            "user": user_obj,
            "content": comment_data.content,
            "createdAt": comment["created_at"],
            "upvotes": 0,
            "downvotes": 0,
            "parentId": comment_data.parentId,
            "replies": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/comments/{comment_id}/vote")
async def vote_comment(
    comment_id: str,
    vote_data: VoteRequest,
    current_user: dict = Depends(get_current_user)
):
    """Vote on a comment (upvote or downvote)"""
    try:
        # Check if user already voted
        existing_vote = supabase.table("comment_votes").select("*").eq("comment_id", comment_id).eq("user_id", current_user["id"]).execute()
        
        if existing_vote.data:
            # Update existing vote
            supabase.table("comment_votes").update({"vote": vote_data.vote}).eq("comment_id", comment_id).eq("user_id", current_user["id"]).execute()
        else:
            # Create new vote
            supabase.table("comment_votes").insert({
                "comment_id": comment_id,
                "user_id": current_user["id"],
                "vote": vote_data.vote
            }).execute()
        
        # Update comment vote counts
        upvotes = supabase.table("comment_votes").select("*", count="exact").eq("comment_id", comment_id).eq("vote", "up").execute()
        downvotes = supabase.table("comment_votes").select("*", count="exact").eq("comment_id", comment_id).eq("vote", "down").execute()
        
        supabase.table("comments").update({
            "upvotes": len(upvotes.data) if upvotes.data else 0,
            "downvotes": len(downvotes.data) if downvotes.data else 0
        }).eq("id", comment_id).execute()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats/players", response_model=List[PlayerStats])
async def get_player_stats():
    """Get player statistics"""
    try:
        result = supabase.table("player_stats").select("*").order("runs", desc=True).limit(50).execute()
        # Convert snake_case to camelCase
        players = []
        for item in result.data:
            player = {
                "playerId": item.get("player_id"),
                "playerName": item.get("player_name"),
                "matches": item.get("matches", 0),
                "runs": item.get("runs", 0),
                "wickets": item.get("wickets", 0),
                "average": float(item.get("average", 0)),
                "strikeRate": float(item.get("strike_rate", 0)),
                "economy": float(item.get("economy")) if item.get("economy") else None
            }
            players.append(player)
        return players
    except Exception as e:
        # Return mock data for development
        return get_mock_player_stats()

@app.get("/stats/teams", response_model=List[TeamStats])
async def get_team_stats():
    """Get team statistics"""
    try:
        result = supabase.table("team_stats").select("*").order("wins", desc=True).execute()
        # Convert snake_case to camelCase
        teams = []
        for item in result.data:
            team = {
                "teamId": item.get("team_id"),
                "teamName": item.get("team_name"),
                "matches": item.get("matches", 0),
                "wins": item.get("wins", 0),
                "losses": item.get("losses", 0),
                "winPercentage": float(item.get("win_percentage", 0))
            }
            teams.append(team)
        return teams
    except Exception as e:
        # Return mock data for development
        return get_mock_team_stats()

# Mock data functions for development
def get_mock_matches(status: Optional[str] = None):
    matches = [
        {
            "id": "1",
            "team1": "India",
            "team2": "Australia",
            "venue": "MCG, Melbourne",
            "status": "live",
            "date": datetime.now().isoformat(),
            "format": "T20",
            "score": {
                "team1": {"runs": 185, "wickets": 4, "overs": 20},
                "team2": {"runs": 120, "wickets": 3, "overs": 15.2}
            },
            "currentOver": 15,
            "currentBall": 2
        },
        {
            "id": "2",
            "team1": "England",
            "team2": "Pakistan",
            "venue": "Lord's, London",
            "status": "upcoming",
            "date": datetime.now().isoformat(),
            "format": "ODI"
        },
        {
            "id": "3",
            "team1": "New Zealand",
            "team2": "South Africa",
            "venue": "Eden Park, Auckland",
            "status": "completed",
            "date": datetime.now().isoformat(),
            "format": "T20",
            "score": {
                "team1": {"runs": 210, "wickets": 6, "overs": 20},
                "team2": {"runs": 195, "wickets": 8, "overs": 20}
            }
        }
    ]
    if status:
        return [m for m in matches if m["status"] == status]
    return matches

def get_mock_deliveries():
    return [
        {
            "id": "1",
            "matchId": "1",
            "over": 15,
            "ball": 3,
            "bowler": "Pat Cummins",
            "batsman": "Virat Kohli",
            "runs": 6,
            "isWicket": False,
            "isFour": False,
            "isSix": True,
            "description": "Massive six! Kohli sends it over long-on for a maximum!",
            "timestamp": datetime.now().isoformat(),
            "commentCount": 42
        }
    ]

def get_mock_comments():
    return [
        {
            "id": "1",
            "deliveryId": "1",
            "userId": "1",
            "user": {
                "id": "1",
                "username": "cricket_lover",
                "email": "fan@example.com",
                "createdAt": datetime.now().isoformat()
            },
            "content": "What a shot! Kohli is in amazing form today!",
            "createdAt": datetime.now().isoformat(),
            "upvotes": 15,
            "downvotes": 2,
            "replies": []
        }
    ]

def get_mock_player_stats():
    return [
        {
            "playerId": "1",
            "playerName": "Virat Kohli",
            "matches": 254,
            "runs": 12169,
            "wickets": 0,
            "average": 57.38,
            "strikeRate": 93.17
        }
    ]

def get_mock_team_stats():
    return [
        {
            "teamId": "1",
            "teamName": "India",
            "matches": 1024,
            "wins": 638,
            "losses": 350,
            "winPercentage": 62.3
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

