export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Match {
  id: string;
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  venue: string;
  status: 'live' | 'completed' | 'upcoming';
  date: string;
  format: 'T20' | 'ODI' | 'Test';
  score?: {
    team1: { runs: number; wickets: number; overs: number };
    team2: { runs: number; wickets: number; overs: number };
  };
  currentOver?: number;
  currentBall?: number;
}

export interface Delivery {
  id: string;
  matchId: string;
  over: number;
  ball: number;
  bowler: string;
  batsman: string;
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  isFour: boolean;
  isSix: boolean;
  description: string;
  timestamp: string;
  commentCount: number;
  _type?: string; // Optional field to distinguish commentary vs ball delivery
}

export interface Comment {
  id: string;
  deliveryId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  parentId?: string;
  replies?: Comment[];
  userVote?: 'up' | 'down' | null;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  strikeRate: number;
  economy?: number;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  matches: number;
  wins: number;
  losses: number;
  winPercentage: number;
}

