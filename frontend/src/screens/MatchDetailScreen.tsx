import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Delivery } from '../types';
import { api } from '../config/api';
import { theme } from '../theme';
import './MatchDetailScreen.css';

type CommentaryFilter = 'all' | 'highlights' | 'overs' | 'wickets' | 'sixes' | 'fours' | 'firstInning' | 'secondInning';

export const MatchDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<CommentaryFilter>('all');
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchMatch();
      fetchDeliveries();
    }
  }, [id]);

  useEffect(() => {
    // Reset deliveries when filter changes
    if (id) {
      setDeliveries([]);
      setHasMore(true);
      fetchDeliveries();
    }
  }, [filter]);

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

  const fetchDeliveries = async (lastDocId?: string) => {
    try {
      if (lastDocId) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params: any = {};
      if (lastDocId) {
        params.last_doc_id = lastDocId;
      }

      const response = await api.get(`/deliveries/match/${id}`, { params });
      const newDeliveries = response.data;

      if (lastDocId) {
        // Append new deliveries (they come in reverse chronological order)
        setDeliveries(prev => [...prev, ...newDeliveries]);
      } else {
        // Initial load
        setDeliveries(newDeliveries);
      }

      // Check if there are more deliveries to load
      if (newDeliveries.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching match deliveries:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || deliveries.length === 0) return;

    // Get the last delivery's ID and extract the numeric part for lastDocId
    const lastDelivery = deliveries[deliveries.length - 1];
    const lastDocId = lastDelivery.id.split('_')[1]; // Extract numeric part from "V6C_1768145205762"
    
    fetchDeliveries(lastDocId);
  }, [deliveries, loadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, loadingMore]);

  const getFilteredDeliveries = () => {
    switch (filter) {
      case 'sixes':
        return deliveries.filter(d => d.isSix);
      case 'fours':
        return deliveries.filter(d => d.isFour);
      case 'wickets':
        return deliveries.filter(d => d.isWicket);
      default:
        return deliveries;
    }
  };

  const getRunBadgeColor = (delivery: Delivery) => {
    if (delivery.isSix) return '#22c55e'; // Green for six
    if (delivery.isFour) return '#3b82f6'; // Blue for four
    if (delivery.isWicket) return '#dc2626'; // Red for wicket
    return '#404040'; // Dark grey for regular runs
  };

  const getCurrentBattingTeam = () => {
    if (!match?.score) return null;
    // Determine which team is currently batting (usually the one with incomplete innings)
    const team1Score = match.score.team1;
    const team2Score = match.score.team2;
    
    if (!team2Score) return { team: match.team1, score: team1Score };
    if (!team1Score) return { team: match.team2, score: team2Score };
    
    // If both exist, assume team2 is batting (chasing)
    return { team: match.team2, score: team2Score };
  };

  const getCurrentOver = () => {
    if (match?.currentOver !== undefined && match?.currentBall !== undefined) {
      return `${match.currentOver}.${match.currentBall}`;
    }
    // Fallback to last delivery's over
    if (deliveries.length > 0) {
      const last = deliveries[0]; // Most recent is first in reverse chronological
      return `${last.over}.${last.ball}`;
    }
    return '0.0';
  };

  if (loading && deliveries.length === 0) {
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

  const filteredDeliveries = getFilteredDeliveries();
  const currentBatting = getCurrentBattingTeam();

  const getMatchResult = () => {
    if (match.status === 'completed' && match.score) {
      const team1Score = match.score.team1?.runs || 0;
      const team2Score = match.score.team2?.runs || 0;
      const team1Wickets = match.score.team1?.wickets || 0;
      const team2Wickets = match.score.team2?.wickets || 0;
      
      if (team1Score > team2Score) {
        return `${match.team1} won by ${10 - team2Wickets} wickets`;
      } else if (team2Score > team1Score) {
        return `${match.team2} won by ${10 - team1Wickets} wickets`;
      }
    }
    return null;
  };

  return (
    <div className="match-detail-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="match-detail-container">
        {/* Header with back button */}
        <div className="match-header">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            style={{ color: theme.colors.text }}
          >
            ← Back
          </button>
          {match.status === 'live' && (
            <div className="live-badge" style={{ color: theme.colors.error }}>
              🔴 LIVE
            </div>
          )}
        </div>

        {/* Match Summary Header */}
        <div className="match-summary-header" style={{ backgroundColor: theme.colors.surface }}>
          {getMatchResult() ? (
            <div className="match-result">
              <span className="trophy">🏆</span>
              <span>{getMatchResult()}</span>
            </div>
          ) : null}
          <div className="team-scores">
            <div className="team-score-item">
              <img 
                src={match.team2Logo || `https://flagcdn.com/w40/${match.team2.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={match.team2}
                className="team-flag"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://flagcdn.com/w40/nz.png`;
                }}
              />
              <div className="team-score-details">
                <div className="team-name">{match.team2.substring(0, 3).toUpperCase()}</div>
                {match.score?.team2 ? (
                  <div className="team-score-text">
                    {match.score.team2.runs}-{match.score.team2.wickets}
                    {match.score.team2.overs && ` (${match.score.team2.overs.toFixed(1)})`}
                  </div>
                ) : (
                  <div className="team-score-text">-</div>
                )}
              </div>
            </div>
            <div className="team-score-item">
              <img 
                src={match.team1Logo || `https://flagcdn.com/w40/${match.team1.toLowerCase().replace(/\s+/g, '-')}.png`}
                alt={match.team1}
                className="team-flag"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://flagcdn.com/w40/in.png`;
                }}
              />
              <div className="team-score-details">
                <div className="team-name">{match.team1.substring(0, 3).toUpperCase()}</div>
                {match.score?.team1 ? (
                  <div className="team-score-text">
                    {match.score.team1.overs && `(${match.score.team1.overs.toFixed(1)}) `}
                    {match.score.team1.runs}-{match.score.team1.wickets}
                  </div>
                ) : (
                  <div className="team-score-text">-</div>
                )}
              </div>
            </div>
          </div>
          <div className="match-tabs">
            <button className="match-tab">Match info</button>
            <button className="match-tab active">Live</button>
            <button className="match-tab">Scorecard</button>
          </div>
        </div>

        {/* Commentary Filters */}
        <div className="commentary-filters">
          {(['all', 'highlights', 'overs', 'wickets', 'sixes', 'fours', 'firstInning', 'secondInning'] as CommentaryFilter[]).map((filterType) => (
            <button
              key={filterType}
              className={`filter-tab ${filter === filterType ? 'active' : ''}`}
              onClick={() => setFilter(filterType)}
              style={{
                backgroundColor: filter === filterType ? theme.colors.surface : 'transparent',
                color: filter === filterType ? theme.colors.text : theme.colors.textSecondary,
              }}
            >
              {filterType === 'all' ? 'All' : 
               filterType === 'sixes' ? '6s' :
               filterType === 'fours' ? '4s' :
               filterType === 'wickets' ? 'W' :
               filterType === 'firstInning' ? 'Inn 1' :
               filterType === 'secondInning' ? 'Inn 2' :
               filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Commentary Feed */}
        <div className="commentary-feed">
          {filteredDeliveries.length === 0 && !loading ? (
            <div className="empty-state">No commentary available</div>
          ) : (
            <>
              {filteredDeliveries.map((delivery) => {
                const isCommentary = delivery._type === 'commentary';
                return (
                  <div
                    key={delivery.id}
                    className={`commentary-item ${delivery.isWicket ? 'wicket-item' : ''} ${isCommentary ? 'commentary-text-item' : ''}`}
                    style={{
                      backgroundColor: delivery.isWicket ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                      borderLeft: delivery.isWicket ? `3px solid ${theme.colors.cricketRed}` : 'none',
                    }}
                  >
                    {!isCommentary && (
                      <>
                        <div className="commentary-header">
                          <div className="over-ball">{delivery.over}.{delivery.ball}</div>
                          <div 
                            className="run-badge"
                            style={{
                              backgroundColor: getRunBadgeColor(delivery),
                              color: '#ffffff',
                            }}
                          >
                            {delivery.isWicket ? 'W' : delivery.runs}
                          </div>
                        </div>
                        {delivery.bowler && delivery.batsman && (
                          <div className="bowler-batsman" style={{ color: theme.colors.textSecondary }}>
                            {delivery.bowler} to {delivery.batsman}
                          </div>
                        )}
                      </>
                    )}
                    <div className="commentary-text" style={{ color: theme.colors.text }}>
                      {delivery.description}
                    </div>
                  </div>
                );
              })}
              
              {/* Infinite scroll trigger */}
              {hasMore && (
                <div ref={observerTarget} className="scroll-trigger">
                  {loadingMore && (
                    <div className="loading-more">Loading more commentary...</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
