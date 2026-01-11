"""
Live Matches API integration service
API: https://api-v1.com/w/liveMatches2.php
"""
import httpx
import re
from typing import List, Dict, Optional
from datetime import datetime

LIVE_MATCHES_API_URL = "https://api-v1.com/w/liveMatches2.php"


class LiveMatchesAPI:
    """Service for interacting with Live Matches API"""

    async def get_live_matches(self) -> List[Dict]:
        """Get list of live/current matches"""
        async with httpx.AsyncClient() as client:
            response = await client.get(LIVE_MATCHES_API_URL, timeout=30.0)
            response.raise_for_status()
            data = response.json()
            # The API returns a dict where keys are match IDs and values are match data
            matches = []
            for match_id, match_data in data.items():
                matches.append({**match_data, "_id": match_id})
            return matches

    def parse_score(self, score_str: str) -> Optional[Dict]:
        """Parse score string like '300/8(50.0' to {runs, wickets, overs}"""
        if not score_str or score_str == "0/0(0.0":
            return None
        
        try:
            # Match format: runs/wickets(overs
            match = re.match(r'(\d+)/(\d+)(?:\((\d+(?:\.\d+)?))?', score_str)
            if match:
                runs = int(match.group(1))
                wickets = int(match.group(2))
                overs_str = match.group(3) if match.group(3) else "0"
                overs = float(overs_str)
                return {
                    "runs": runs,
                    "wickets": wickets,
                    "overs": overs
                }
        except (ValueError, AttributeError):
            pass
        return None

    def get_match_status(self, match_data: Dict) -> str:
        """Determine match status from API data"""
        # d: 1 = upcoming, 2 = completed/live
        status_code = match_data.get("d", 1)
        res = match_data.get("res", "").lower()
        
        if status_code == 2:
            # Check if match is live or completed
            if res and ("won" in res or "abandoned" in res or "delayed" in res):
                return "completed"
            else:
                return "live"
        else:
            return "upcoming"

    def get_format_from_code(self, format_code: str) -> str:
        """Convert format code to our format type"""
        format_map = {
            "T20": "T20",
            "T20I": "T20",
            "ODI": "ODI",
            "List A": "ODI",
            "Youth ODI": "ODI",
            "Test": "Test"
        }
        return format_map.get(format_code, "T20")

    def transform_match_to_schema(self, match_data: Dict) -> Dict:
        """Transform Live Matches API format to our schema"""
        match_id = match_data.get("_id", "")
        
        # Team codes (b and c) - we'll use these as team names for now
        # You may want to create a team code mapping later
        team1_code = match_data.get("b", "Team 1")
        team2_code = match_data.get("c", "Team 2")
        
        # Try to get team names from other fields if available
        team1 = team1_code
        team2 = team2_code
        
        # Get team logos
        team1_logo = match_data.get("fi")
        team2_logo = None  # API seems to only provide one logo field
        
        # Parse scores
        score_j = match_data.get("j", "")
        score_k = match_data.get("k", "")
        
        team1_score = self.parse_score(score_j) if score_j else None
        team2_score = self.parse_score(score_k) if score_k else None
        
        score = None
        if team1_score or team2_score:
            score = {}
            if team1_score:
                score["team1"] = team1_score
            if team2_score:
                score["team2"] = team2_score
        
        # Determine match status
        status = self.get_match_status(match_data)
        
        # Get format
        format_code = match_data.get("fo", "T20")
        format_type = self.get_format_from_code(format_code)
        
        # Parse timestamp (ti is in milliseconds)
        timestamp_ms = match_data.get("ti", 0)
        if timestamp_ms:
            date_str = datetime.fromtimestamp(timestamp_ms / 1000).isoformat()
        else:
            date_str = datetime.now().isoformat()
        
        # Get venue code (v) - we'll use it as venue for now
        venue_code = match_data.get("v", "")
        venue = venue_code  # You may want to map venue codes to names
        
        # Get result/reservation text
        result = match_data.get("res", "")
        
        # Current over/ball (from mm field if available, or g/h fields)
        current_over = match_data.get("g")
        current_ball = match_data.get("h")
        
        return {
            "id": match_id,
            "team1": team1,
            "team2": team2,
            "team1Logo": team1_logo,
            "team2Logo": team2_logo,
            "venue": venue,
            "status": status,
            "date": date_str,
            "format": format_type,
            "score": score,
            "currentOver": current_over if current_over else None,
            "currentBall": current_ball if current_ball else None,
            "_raw": {
                "result": result,
                "format_code": format_code,
                "dt_id": match_data.get("dt_id"),
                "series": match_data.get("e"),
            }
        }

    async def get_all_matches(self) -> List[Dict]:
        """Get all matches (same as live for this API)"""
        return await self.get_live_matches()


