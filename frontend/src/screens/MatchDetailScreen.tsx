import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Delivery } from '../types';
import { DeliveryCard } from '../components/DeliveryCard';
import { api } from '../config/api';
import { theme } from '../theme';
import './MatchDetailScreen.css';

export const MatchDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMatch();
      fetchDeliveries();
    }
  }, [id]);

  const fetchMatch = async () => {
    try {
      const response = await api.get(`/matches/${id}`);
      setMatch(response.data);
    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await api.get(`/deliveries/match/${id}`);
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching match deliveries:', error);
    }
  };

  if (loading) {
    return (
      <div className="match-detail-screen" style={{ backgroundColor: theme.colors.background }}>
        <div className="loading">Loading match...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="match-detail-screen" style={{ backgroundColor: theme.colors.background }}>
        <div className="empty-state">Match not found</div>
      </div>
    );
  }

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
    <div className="match-detail-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="match-detail-container">
        {/* Match Header */}
        <div className="match-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            style={{ color: theme.colors.text }}
          >
            ← Back
          </button>
          <div className="match-status" style={{ color: getStatusColor(match.status) }}>
            {getStatusBadge(match.status)}
          </div>
        </div>

        {/* Match Info Card */}
        <div 
          className="match-info-card"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="match-teams">
            <div className="team">
              {match.team1Logo && (
                <img src={match.team1Logo} alt={match.team1} className="team-logo" />
              )}
              <span className="team-name">{match.team1}</span>
              {match.score && match.score.team1 && (
                <span className="team-score">
                  {match.score.team1.runs}/{match.score.team1.wickets} ({match.score.team1.overs} ov)
                </span>
              )}
            </div>
            <div className="vs">vs</div>
            <div className="team">
              {match.team2Logo && (
                <img src={match.team2Logo} alt={match.team2} className="team-logo" />
              )}
              <span className="team-name">{match.team2}</span>
              {match.score && match.score.team2 && (
                <span className="team-score">
                  {match.score.team2.runs}/{match.score.team2.wickets} ({match.score.team2.overs} ov)
                </span>
              )}
            </div>
          </div>

          <div className="match-meta">
            <span style={{ color: theme.colors.textSecondary }}>
              {match.format} • {match.venue}
            </span>
            <span style={{ color: theme.colors.textSecondary }}>
              {new Date(match.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Deliveries Section */}
        <div className="match-deliveries">
          <h2 className="section-title" style={{ color: theme.colors.text }}>
            Deliveries ({deliveries.length})
          </h2>
          {deliveries.length === 0 ? (
            <div className="empty-state">No deliveries found for this match</div>
          ) : (
            <div className="deliveries-grid">
              {deliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  matchInfo={{ team1: match.team1, team2: match.team2 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

