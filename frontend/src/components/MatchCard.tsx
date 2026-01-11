import React from 'react';
import { Match } from '../types';
import { theme } from '../theme';
import './MatchCard.css';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'live':
        return '#ef4444'; // red for live
      case 'upcoming':
        return '#f59e0b'; // orange for upcoming
      case 'completed':
        return '#a3a3a3'; // grey for completed
      default:
        return '#a3a3a3';
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
    <div
      className="match-card"
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
          {match.score && match.score.team1 && (
            <span className="team-score">
              {match.score.team1.runs}/{match.score.team1.wickets} ({match.score.team1.overs} ov)
            </span>
          )}
        </div>
        <div className="vs">vs</div>
        <div className="team">
          <span className="team-name">{match.team2}</span>
          {match.score && match.score.team2 && (
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
  );
};

