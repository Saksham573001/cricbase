import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Match } from '../types';
import { theme } from '../theme';
import './MatchCard.css';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'live':
        return '#ef4444'; // red for live
      case 'upcoming':
        return '#f59e0b'; // orange for upcoming
      case 'completed':
        return '#22c55e'; // green for completed
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
        return '';
      default:
        return '';
    }
  };

  // Calculate match status text (runs needed or result)
  const getMatchStatusText = () => {
    if (match.status === 'live' && match.score) {
      const team1Score = match.score.team1;
      const team2Score = match.score.team2;
      
      if (team1Score && team2Score) {
        // Determine which team is batting (usually the one with lower overs or incomplete innings)
        const team1Overs = team1Score.overs || 0;
        const team2Overs = team2Score.overs || 0;
        
        if (team2Overs < team1Overs || (team2Overs === 0 && team1Overs > 0)) {
          // Team 2 is batting, needs to chase team 1's score
          const target = team1Score.runs + 1;
          const current = team2Score.runs;
          const needed = target - current;
          const ballsRemaining = Math.floor((team1Overs - team2Overs) * 6);
          
          if (needed > 0 && ballsRemaining > 0) {
            return `${needed} runs needed in ${ballsRemaining} balls`;
          }
        } else if (team1Overs < team2Overs || (team1Overs === 0 && team2Overs > 0)) {
          // Team 1 is batting, needs to chase team 2's score
          const target = team2Score.runs + 1;
          const current = team1Score.runs;
          const needed = target - current;
          const ballsRemaining = Math.floor((team2Overs - team1Overs) * 6);
          
          if (needed > 0 && ballsRemaining > 0) {
            return `${needed} runs needed in ${ballsRemaining} balls`;
          }
        }
      }
    }
    
    // For completed matches, show result if available
    if (match.status === 'completed' && (match as any)._raw?.result) {
      return (match as any)._raw.result;
    }
    
    return '';
  };

  // Get match title (series name or team1 vs team2)
  const getMatchTitle = () => {
    if ((match as any)._raw?.series) {
      return (match as any)._raw.series;
    }
    return `${match.team1} vs ${match.team2}`;
  };

  // Format venue with match number if available
  const getVenueText = () => {
    const series = (match as any)._raw?.series || '';
    const matchNum = (match as any)._raw?.e || '';
    const venue = match.venue || '';
    
    let venueText = '';
    if (matchNum && typeof matchNum === 'string' && matchNum.match(/^\d+/)) {
      venueText = `${matchNum} ${match.format}`;
    } else if (matchNum) {
      venueText = `${matchNum}, ${match.format}`;
    } else {
      venueText = match.format;
    }
    
    if (venue) {
      venueText += ` • ${venue}`;
    }
    
    return venueText;
  };

  return (
    <div
      className="match-card"
      onClick={() => navigate(`/match/${match.id}`)}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      <div className="match-card-header">
        {match.status === 'live' && (
          <div className="match-status" style={{ color: getStatusColor(match.status) }}>
            {getStatusBadge(match.status)}
          </div>
        )}
        <div className="match-title">{getMatchTitle()}</div>
      </div>

      <div className="match-location" style={{ color: theme.colors.textSecondary }}>
        {getVenueText()}
      </div>

      <div className="match-teams">
        <div className="team">
          <img 
            src={match.team1Logo || `https://flagcdn.com/w40/xx.png`} 
            alt={match.team1} 
            className="team-logo"
            onError={(e) => {
              // Fallback to placeholder if flag fails to load
              (e.target as HTMLImageElement).src = 'https://flagcdn.com/w40/xx.png';
            }}
          />
          <div className="team-info">
            <span className="team-name">{match.team1}</span>
            {match.score && match.score.team1 && (
              <span className="team-score">
                {match.score.team1.runs}-{match.score.team1.wickets} ({match.score.team1.overs.toFixed(1)} ov)
              </span>
            )}
          </div>
        </div>
        <div className="team">
          <img 
            src={match.team2Logo || `https://flagcdn.com/w40/xx.png`} 
            alt={match.team2} 
            className="team-logo"
            onError={(e) => {
              // Fallback to placeholder if flag fails to load
              (e.target as HTMLImageElement).src = 'https://flagcdn.com/w40/xx.png';
            }}
          />
          <div className="team-info">
            <span className="team-name">{match.team2}</span>
            {match.score && match.score.team2 && (
              <span className="team-score">
                {match.score.team2.runs}-{match.score.team2.wickets} ({match.score.team2.overs.toFixed(1)} ov)
              </span>
            )}
          </div>
        </div>
      </div>

      {getMatchStatusText() && (
        <div 
          className="match-status-text"
          style={{ 
            color: match.status === 'live' ? '#f59e0b' : match.status === 'completed' ? '#22c55e' : theme.colors.textSecondary 
          }}
        >
          {getMatchStatusText()}
        </div>
      )}

      <div className="match-card-arrow">→</div>
    </div>
  );
};

