import React, { useState, useEffect } from 'react';
import { Delivery, Match } from '../types';
import { DeliveryCard } from '../components/DeliveryCard';
import { MatchCard } from '../components/MatchCard';
import { TrendingSidebar } from '../components/TrendingSidebar';
import { api } from '../config/api';
import { theme } from '../theme';
import './FeedScreen.css';

export const FeedScreen: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [matchMap, setMatchMap] = useState<Record<string, { team1: string; team2: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
    fetchLiveMatches();

    // Auto-refresh live matches every 30 seconds
    const liveMatchesInterval = setInterval(() => {
      fetchLiveMatches();
    }, 30000);

    return () => {
      clearInterval(liveMatchesInterval);
    };
  }, []);

  const fetchLiveMatches = async () => {
    try {
      const response = await api.get('/matches', { params: { status: 'live' } });
      setLiveMatches(response.data);
    } catch (error) {
      console.error('Error fetching live matches:', error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/deliveries/feed');
      const deliveriesData = response.data;
      setDeliveries(deliveriesData);
      // No need to fetch match details for deliveries - only fetch when user clicks on a specific match
      setMatchMap({});
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      // Mock data for development
      setDeliveries(mockDeliveries);
      setMatchMap({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feed-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="feed-container">
        <div className="feed-main">
          <div className="feed-header">
            <div className="feed-title-section">
              <span className="feed-icon">📣</span>
              <h1 className="feed-title">Talk Of The Town</h1>
            </div>
          </div>

          {/* Live Matches Section */}
          {liveMatches.length > 0 && (
            <div className="live-matches-section">
              <h2 className="section-title" style={{ color: theme.colors.text }}>
                🔴 Live Matches
              </h2>
              <div className="matches-grid">
                {liveMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          )}

          <div className="feed-grid">
            {loading ? (
              <div className="loading">Loading deliveries...</div>
            ) : deliveries.length === 0 ? (
              <div className="empty-state">No deliveries found</div>
            ) : (
              deliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  matchInfo={matchMap[delivery.matchId]}
                />
              ))
            )}
          </div>
        </div>

        <TrendingSidebar />
      </div>
    </div>
  );
};

// Mock data for development
const mockDeliveries: Delivery[] = [
  {
    id: '1',
    matchId: '1',
    over: 15,
    ball: 3,
    bowler: 'Pat Cummins',
    batsman: 'Virat Kohli',
    runs: 6,
    isWicket: false,
    isFour: false,
    isSix: true,
    description: 'Massive six! Kohli sends it over long-on for a maximum!',
    timestamp: new Date().toISOString(),
    commentCount: 42,
  },
  {
    id: '2',
    matchId: '1',
    over: 14,
    ball: 5,
    bowler: 'Mitchell Starc',
    batsman: 'Rohit Sharma',
    runs: 4,
    isWicket: false,
    isFour: true,
    isSix: false,
    description: 'Beautiful cover drive! Four runs to the boundary.',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    commentCount: 28,
  },
  {
    id: '3',
    matchId: '1',
    over: 13,
    ball: 2,
    bowler: 'Josh Hazlewood',
    batsman: 'Rohit Sharma',
    runs: 0,
    isWicket: true,
    wicketType: 'Bowled',
    isFour: false,
    isSix: false,
    description: 'OUT! Clean bowled! Hazlewood gets the breakthrough!',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    commentCount: 156,
  },
];

