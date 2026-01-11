"""
Live Matches API integration service
API: https://api-v1.com/w/liveMatches2.php
"""
import httpx
import re
from typing import List, Dict, Optional
from datetime import datetime
from team_mapping import get_team_info, map_team_code, get_team_flag, get_team_short_name

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
        
        # Team codes (b and c) - map to full team names
        team1_code = match_data.get("b", "Team 1")
        team2_code = match_data.get("c", "Team 2")
        
        # Map team codes to full team names
        team1_info = get_team_info(team1_code)
        team2_info = get_team_info(team2_code)
        
        team1 = team1_info["name"]
        team2 = team2_info["name"]
        
        # Get team logos - prefer flag from mapping, fallback to API logo
        team1_logo = match_data.get("fi") or team1_info["flag"]
        team2_logo = team2_info["flag"]  # API seems to only provide one logo field, use flag for team2
        
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

    async def get_match_statistics(self, match_id: str) -> Optional[Dict]:
        """Get detailed match statistics for a specific match"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api-v1.com/w/sV3.php",
                    params={"key": match_id},
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                # The API returns a dict with match statistics
                return data
        except Exception as e:
            print(f"Error fetching match statistics for {match_id}: {e}")
            return None

    def parse_current_over_ball(self, value) -> Optional[int]:
        """Parse current over/ball value, handling encoded strings like 'O5.4W5'"""
        if value is None:
            return None
        
        # If it's already an integer, return it
        if isinstance(value, int):
            return value
        
        # If it's a string, try to parse it
        if isinstance(value, str):
            # Try to extract numeric value from strings like 'O5.4W5' or '5.4'
            # First, try direct integer conversion
            try:
                return int(value)
            except ValueError:
                # Try to extract numbers from encoded strings
                # Look for patterns like '5.4' or '5'
                import re
                match = re.search(r'(\d+)\.?(\d+)?', value)
                if match:
                    # Extract the integer part before the decimal
                    return int(match.group(1))
                # If no pattern matches, return None
                return None
        
        return None

    def transform_match_statistics_to_schema(self, stats_data: Dict, match_id: str) -> Dict:
        """Transform match statistics API format to our schema"""
        # Get team codes from stats (if available in 'a' field like "O.R")
        team_codes = stats_data.get("a", "").split(".") if stats_data.get("a") else []
        team1_code = team_codes[0] if len(team_codes) > 0 else stats_data.get("b", "Team 1")
        team2_code = team_codes[1] if len(team_codes) > 1 else stats_data.get("c", "Team 2")
        
        # Map team codes to full team names
        team1_info = get_team_info(team1_code)
        team2_info = get_team_info(team2_code)
        
        team1 = team1_info["name"]
        team2 = team2_info["name"]
        
        # Get team logos
        team1_logo = team1_info["flag"]
        team2_logo = team2_info["flag"]
        
        # Parse scores
        score_j = stats_data.get("j", "")
        score_k = stats_data.get("k", "")
        
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
        # ms: 1 = upcoming, 2 = live/completed
        ms = stats_data.get("ms", 1)
        res = stats_data.get("res", "").lower() if stats_data.get("res") else ""
        
        if ms == 2:
            if res and ("won" in res or "abandoned" in res or "delayed" in res):
                status = "completed"
            else:
                status = "live"
        else:
            status = "upcoming"
        
        # Get format
        format_code = stats_data.get("fo", "T20")
        format_type = self.get_format_from_code(format_code)
        
        # Parse timestamp
        timestamp_ms = stats_data.get("mt") or stats_data.get("ti", 0)
        if timestamp_ms:
            date_str = datetime.fromtimestamp(timestamp_ms / 1000).isoformat()
        else:
            date_str = datetime.now().isoformat()
        
        # Get venue code
        venue_code = stats_data.get("v", "")
        venue = venue_code
        
        # Get result
        result = stats_data.get("res", "")
        
        # Current over/ball - parse encoded strings
        current_over = self.parse_current_over_ball(stats_data.get("g"))
        current_ball = self.parse_current_over_ball(stats_data.get("h"))
        
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
            "currentOver": current_over,
            "currentBall": current_ball,
            "_raw": {
                "result": result,
                "format_code": format_code,
                "stats": stats_data,  # Include full stats for detailed view
            }
        }


