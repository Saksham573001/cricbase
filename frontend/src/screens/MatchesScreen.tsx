import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Match } from '../types';
import { api } from '../config/api';
import { theme } from '../theme';
import './MatchesScreen.css';

export const MatchesScreen: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/matches', {
        params: { status: filter === 'all' ? undefined : filter },
      });
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Mock data for development
      setMatches(mockMatches);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'live':
        return theme.colors.error;
      case 'upcoming':
        return theme.colors.warning;
      case 'completed':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusBadge = (status: Match['status']) => {
    switch (status) {
      case 'live':
        return '🔴 LIVE';
      case 'upcoming':
        return '⏰ Upcoming';
      case 'completed':
        return '✅ Completed';
      default:
        return '';
    }
  };

  return (
    <div className="matches-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="matches-header">
        <h1 style={{ color: theme.colors.text }}>Matches</h1>
        <div className="filter-tabs">
          {(['all', 'live', 'upcoming', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              style={{
                backgroundColor: filter === f ? theme.colors.primary : 'transparent',
                color: filter === f ? 'white' : theme.colors.textSecondary,
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="matches-list">
        {loading ? (
          <div className="loading">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="empty-state">No matches found</div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="match-card"
              onClick={() => navigate(`/match/${match.id}`)}
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              }}
            >
              <div className="match-status" style={{ color: getStatusColor(match.status) }}>
                {getStatusBadge(match.status)}
              </div>

              <div className="match-teams">
                <div className="team">
                  <span className="team-name">{match.team1}</span>
                  {match.score && (
                    <span className="team-score">
                      {match.score.team1.runs}/{match.score.team1.wickets} ({match.score.team1.overs} ov)
                    </span>
                  )}
                </div>
                <div className="vs">vs</div>
                <div className="team">
                  <span className="team-name">{match.team2}</span>
                  {match.score && (
                    <span className="team-score">
                      {match.score.team2.runs}/{match.score.team2.wickets} ({match.score.team2.overs} ov)
                    </span>
                  )}
                </div>
              </div>

              <div className="match-info">
                <span style={{ color: theme.colors.textSecondary }}>
                  {match.format} • {match.venue}
                </span>
                <span style={{ color: theme.colors.textSecondary }}>
                  {new Date(match.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Mock data for development
const mockMatches: Match[] = [
  {
    id: '1',
    team1: 'India',
    team2: 'Australia',
    venue: 'MCG, Melbourne',
    status: 'live',
    date: new Date().toISOString(),
    format: 'T20',
    score: {
      team1: { runs: 185, wickets: 4, overs: 20 },
      team2: { runs: 120, wickets: 3, overs: 15.2 },
    },
    currentOver: 15,
    currentBall: 2,
  },
  {
    id: '2',
    team1: 'England',
    team2: 'Pakistan',
    venue: 'Lord\'s, London',
    status: 'upcoming',
    date: new Date(Date.now() + 86400000).toISOString(),
    format: 'ODI',
  },
  {
    id: '3',
    team1: 'New Zealand',
    team2: 'South Africa',
    venue: 'Eden Park, Auckland',
    status: 'completed',
    date: new Date(Date.now() - 86400000).toISOString(),
    format: 'T20',
    score: {
      team1: { runs: 210, wickets: 6, overs: 20 },
      team2: { runs: 195, wickets: 8, overs: 20 },
    },
  },
];

