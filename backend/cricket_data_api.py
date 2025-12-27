"""
Cricket Data API integration service
Documentation: https://cricapi.com/
"""
import httpx
import os
from typing import List, Dict, Optional
from datetime import datetime

CRICKET_DATA_API_BASE = "https://api.cricapi.com/v1"
CRICKET_DATA_API_KEY = os.getenv("CRICKET_DATA_API_KEY", "")


class CricketDataAPI:
    """Service for interacting with Cricket Data API"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or CRICKET_DATA_API_KEY
        if not self.api_key:
            raise ValueError("CRICKET_DATA_API_KEY environment variable is required")

    async def get_current_matches(self, offset: int = 0) -> List[Dict]:
        """Get list of current/live matches"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CRICKET_DATA_API_BASE}/currentMatches",
                params={"apikey": self.api_key, "offset": offset},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            if data.get("status") == "success":
                return data.get("data", [])
            return []

    async def get_all_matches(self, offset: int = 0) -> List[Dict]:
        """Get list of all matches"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CRICKET_DATA_API_BASE}/matches",
                params={"apikey": self.api_key, "offset": offset},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            if data.get("status") == "success":
                return data.get("data", [])
            return []

    async def get_match_info(self, match_id: str) -> Optional[Dict]:
        """Get detailed information about a specific match"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CRICKET_DATA_API_BASE}/match_info",
                params={"apikey": self.api_key, "id": match_id},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            if data.get("status") == "success":
                return data.get("data")
            return None

    async def get_series_list(self, offset: int = 0, search: Optional[str] = None) -> List[Dict]:
        """Get list of cricket series"""
        params = {"apikey": self.api_key, "offset": offset}
        if search:
            params["search"] = search
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CRICKET_DATA_API_BASE}/series",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            if data.get("status") == "success":
                return data.get("data", [])
            return []

    async def get_players(self, offset: int = 0, search: Optional[str] = None) -> List[Dict]:
        """Get list of players"""
        params = {"apikey": self.api_key, "offset": offset}
        if search:
            params["search"] = search
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CRICKET_DATA_API_BASE}/players",
                params=params,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            if data.get("status") == "success":
                return data.get("data", [])
            return []

    async def get_player_info(self, player_id: str) -> Optional[Dict]:
        """Get detailed information about a specific player"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CRICKET_DATA_API_BASE}/players_info",
                params={"apikey": self.api_key, "id": player_id},
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            if data.get("status") == "success":
                return data.get("data")
            return None

    def transform_match_to_schema(self, match_data: Dict) -> Dict:
        """Transform Cricket Data API match format to our schema"""
        teams = match_data.get("teams", [])
        team1 = teams[0] if len(teams) > 0 else "Team 1"
        team2 = teams[1] if len(teams) > 1 else "Team 2"
        
        # Extract team logos from teamInfo
        team_info = match_data.get("teamInfo", [])
        team1_logo = None
        team2_logo = None
        if team_info:
            # Find logos by matching team names
            for info in team_info:
                if info.get("name") == team1:
                    team1_logo = info.get("img")
                elif info.get("name") == team2:
                    team2_logo = info.get("img")
        
        # Process scores - the score array contains innings data
        score_data = match_data.get("score", [])
        score = None
        if score_data:
            # The score array may have 1 or 2 entries (innings)
            # We'll map them to team1 and team2 based on the inning description
            team1_score = None
            team2_score = None
            
            for score_entry in score_data:
                inning_desc = score_entry.get("inning", "").lower()
                runs = score_entry.get("r", 0)
                wickets = score_entry.get("w", 0)
                overs = score_entry.get("o", 0)
                
                # Try to determine which team this score belongs to
                if team1.lower() in inning_desc:
                    team1_score = {
                        "runs": runs,
                        "wickets": wickets,
                        "overs": overs
                    }
                elif team2.lower() in inning_desc:
                    team2_score = {
                        "runs": runs,
                        "wickets": wickets,
                        "overs": overs
                    }
            
            # If we couldn't determine from inning description, use order
            if not team1_score and len(score_data) > 0:
                team1_score = {
                    "runs": score_data[0].get("r", 0),
                    "wickets": score_data[0].get("w", 0),
                    "overs": score_data[0].get("o", 0)
                }
            if not team2_score and len(score_data) > 1:
                team2_score = {
                    "runs": score_data[1].get("r", 0),
                    "wickets": score_data[1].get("w", 0),
                    "overs": score_data[1].get("o", 0)
                }
            
            if team1_score or team2_score:
                score = {}
                if team1_score:
                    score["team1"] = team1_score
                if team2_score:
                    score["team2"] = team2_score
        
        # Determine match status using matchStarted and matchEnded flags
        match_started = match_data.get("matchStarted", False)
        match_ended = match_data.get("matchEnded", False)
        status_text = match_data.get("status", "").lower()
        
        if match_ended:
            match_status = "completed"
        elif match_started and not match_ended:
            match_status = "live"
        elif "won" in status_text or "won by" in status_text:
            match_status = "completed"
        elif "not started" in status_text or "scheduled" in status_text or "upcoming" in status_text:
            match_status = "upcoming"
        else:
            # Default to live if started, otherwise upcoming
            match_status = "live" if match_started else "upcoming"
        
        match_type = match_data.get("matchType", "T20").upper()
        if match_type == "ODI":
            format_type = "ODI"
        elif match_type == "TEST":
            format_type = "Test"
        else:
            format_type = "T20"
        
        date_str = match_data.get("date", datetime.now().isoformat())
        
        return {
            "id": match_data.get("id", ""),
            "team1": team1,
            "team2": team2,
            "team1Logo": team1_logo,
            "team2Logo": team2_logo,
            "venue": match_data.get("venue", ""),
            "status": match_status,
            "date": date_str,
            "format": format_type,
            "score": score,
            "currentOver": None,
            "currentBall": None
        }

