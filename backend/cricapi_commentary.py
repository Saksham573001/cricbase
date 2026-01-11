"""
CricAPI Commentary integration service
API: https://content.crickapi.com/commentary/getBallFeeds
"""
import httpx
from typing import List, Dict, Optional
from datetime import datetime


COMMENTARY_API_URL = "https://content.crickapi.com/commentary/getBallFeeds"


class CricAPICommentary:
    """Service for interacting with CricAPI Commentary API"""

    async def get_ball_feeds(
        self, 
        match_key: str, 
        last_doc_id: Optional[int] = None,
        filters: Optional[Dict] = None
    ) -> List[Dict]:
        """Get ball feeds (deliveries) for a match"""
        try:
            payload = {
                "matchKey": match_key,
                "lastDocId": last_doc_id or 0,
                "filters": filters or {
                    "highlights": False,
                    "overs": False,
                    "wickets": False,
                    "sixes": False,
                    "fours": False,
                    "firstInning": False,
                    "secondInning": False,
                    "milestones": False,
                    "thirdInning": False,
                    "fourthInning": False
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    COMMENTARY_API_URL,
                    json=payload,
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                # Filter for ball deliveries (type: "b")
                ball_feeds = [item for item in data if item.get("type") == "b"]
                return ball_feeds
        except Exception as e:
            print(f"Error fetching ball feeds from CricAPI: {e}")
            return []

    def transform_ball_feed_to_delivery(self, ball_feed: Dict, match_id: str) -> Dict:
        """Transform CricAPI ball feed to our Delivery schema"""
        # Parse over and ball from "o" field (e.g., "48.4" -> over: 48, ball: 4)
        over_ball = ball_feed.get("o", "")
        over = 0
        ball = 0
        if over_ball:
            try:
                over_ball_parts = over_ball.split(".")
                over = int(over_ball_parts[0]) if over_ball_parts[0] else 0
                ball = int(over_ball_parts[1]) if len(over_ball_parts) > 1 and over_ball_parts[1] else 0
            except (ValueError, IndexError):
                pass
        
        # Parse runs from "b" field (e.g., "4", "1", "0+1")
        runs_str = ball_feed.get("b", "0")
        runs = 0
        is_four = False
        is_six = False
        try:
            # Handle cases like "0+1" (0 runs + 1 from overthrow)
            if "+" in runs_str:
                runs = int(runs_str.split("+")[0])
            else:
                runs = int(runs_str)
            
            is_four = runs == 4
            is_six = runs == 6
        except (ValueError, AttributeError):
            runs = 0
        
        # Parse wicket info
        is_wicket = ball_feed.get("is_catch_drop", False) == True or "wicket" in str(ball_feed.get("c2", "")).lower()
        wicket_type = None
        if is_wicket:
            # Try to determine wicket type from commentary
            commentary = ball_feed.get("c2", "").lower()
            if "bowled" in commentary:
                wicket_type = "bowled"
            elif "caught" in commentary:
                wicket_type = "caught"
            elif "lbw" in commentary or "leg before" in commentary:
                wicket_type = "lbw"
            elif "run out" in commentary:
                wicket_type = "run out"
            elif "stumped" in commentary:
                wicket_type = "stumped"
        
        # Parse bowler and batsman from "c1" field (e.g., "K Clarke to K Rahul")
        bowler = ""
        batsman = ""
        c1 = ball_feed.get("c1", "")
        if c1 and " to " in c1:
            parts = c1.split(" to ")
            bowler = parts[0].strip() if len(parts) > 0 else ""
            batsman = parts[1].strip() if len(parts) > 1 else ""
        
        # Get description from "c2" field (HTML content)
        description = ball_feed.get("c2", "")
        # Remove HTML tags for cleaner description
        import re
        description = re.sub(r'<[^>]+>', '', description)
        description = description.replace('&nbsp;', ' ')
        
        # Get timestamp from id (it's a timestamp in milliseconds)
        feed_id = ball_feed.get("id", 0)
        timestamp = datetime.fromtimestamp(feed_id / 1000).isoformat() if feed_id else datetime.now().isoformat()
        
        # Generate delivery ID from match_id and feed_id
        delivery_id = f"{match_id}_{feed_id}"
        
        return {
            "id": delivery_id,
            "matchId": match_id,
            "over": over,
            "ball": ball,
            "bowler": bowler,
            "batsman": batsman,
            "runs": runs,
            "isWicket": is_wicket,
            "wicketType": wicket_type,
            "isFour": is_four,
            "isSix": is_six,
            "description": description,
            "timestamp": timestamp,
            "commentCount": 0  # Default, can be updated from database
        }

    async def get_match_deliveries(self, match_id: str, last_doc_id: Optional[int] = None) -> List[Dict]:
        """Get deliveries for a match, transformed to our schema
        
        Args:
            match_id: The match key
            last_doc_id: Optional last document ID for pagination (from the last delivery's id field)
        """
        try:
            ball_feeds = await self.get_ball_feeds(match_id, last_doc_id=last_doc_id)
            deliveries = []
            for ball_feed in ball_feeds:
                delivery = self.transform_ball_feed_to_delivery(ball_feed, match_id)
                deliveries.append(delivery)
            
            # Sort by over and ball (most recent first for reverse chronological order)
            deliveries.sort(key=lambda x: (x["over"], x["ball"]), reverse=True)
            return deliveries
        except Exception as e:
            print(f"Error getting match deliveries: {e}")
            return []

