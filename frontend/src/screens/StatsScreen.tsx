import React, { useState, useEffect } from 'react';
import { PlayerStats, TeamStats } from '../types';
import { StatCard } from '../components/StatCard';
import { api } from '../config/api';
import { theme } from '../theme';
import './StatsScreen.css';

export const StatsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      if (activeTab === 'players') {
        const response = await api.get('/stats/players');
        setPlayerStats(response.data);
      } else {
        const response = await api.get('/stats/teams');
        setTeamStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Mock data for development
      if (activeTab === 'players') {
        setPlayerStats(mockPlayerStats);
      } else {
        setTeamStats(mockTeamStats);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stats-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="stats-header">
        <h1 style={{ color: theme.colors.text }}>Statistics</h1>
        <div className="stats-tabs">
          <button
            onClick={() => setActiveTab('players')}
            className={`stats-tab ${activeTab === 'players' ? 'active' : ''}`}
            style={{
              backgroundColor: activeTab === 'players' ? theme.colors.primary : 'transparent',
              color: activeTab === 'players' ? 'white' : theme.colors.textSecondary,
            }}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`stats-tab ${activeTab === 'teams' ? 'active' : ''}`}
            style={{
              backgroundColor: activeTab === 'teams' ? theme.colors.primary : 'transparent',
              color: activeTab === 'teams' ? 'white' : theme.colors.textSecondary,
            }}
          >
            Teams
          </button>
        </div>
      </div>

      <div className="stats-content">
        {loading ? (
          <div className="loading">Loading statistics...</div>
        ) : activeTab === 'players' ? (
          <div className="stats-list">
            {playerStats.map((player) => (
              <div
                key={player.playerId}
                className="stat-item-card"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <div className="stat-item-header">
                  <h3 style={{ color: theme.colors.text }}>{player.playerName}</h3>
                </div>
                <div className="stat-item-grid">
                  <StatCard title="Matches" value={player.matches} icon="🏏" />
                  <StatCard title="Runs" value={player.runs.toLocaleString()} icon="🏃" />
                  <StatCard title="Wickets" value={player.wickets} icon="🎯" />
                  <StatCard title="Average" value={player.average.toFixed(2)} icon="📊" />
                  <StatCard title="Strike Rate" value={player.strikeRate.toFixed(2)} icon="⚡" />
                  {player.economy && (
                    <StatCard title="Economy" value={player.economy.toFixed(2)} icon="💰" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="stats-list">
            {teamStats.map((team) => (
              <div
                key={team.teamId}
                className="stat-item-card"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <div className="stat-item-header">
                  <h3 style={{ color: theme.colors.text }}>{team.teamName}</h3>
                </div>
                <div className="stat-item-grid">
                  <StatCard title="Matches" value={team.matches} icon="🏏" />
                  <StatCard title="Wins" value={team.wins} icon="✅" />
                  <StatCard title="Losses" value={team.losses} icon="❌" />
                  <StatCard
                    title="Win %"
                    value={`${team.winPercentage.toFixed(1)}%`}
                    icon="📈"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for development
const mockPlayerStats: PlayerStats[] = [
  {
    playerId: '1',
    playerName: 'Virat Kohli',
    matches: 254,
    runs: 12169,
    wickets: 0,
    average: 57.38,
    strikeRate: 93.17,
  },
  {
    playerId: '2',
    playerName: 'Jasprit Bumrah',
    matches: 72,
    runs: 35,
    wickets: 128,
    average: 20.99,
    strikeRate: 0,
    economy: 4.63,
  },
  {
    playerId: '3',
    playerName: 'Rohit Sharma',
    matches: 243,
    runs: 9205,
    wickets: 8,
    average: 48.96,
    strikeRate: 90.31,
  },
];

const mockTeamStats: TeamStats[] = [
  {
    teamId: '1',
    teamName: 'India',
    matches: 1024,
    wins: 638,
    losses: 350,
    winPercentage: 62.3,
  },
  {
    teamId: '2',
    teamName: 'Australia',
    matches: 958,
    wins: 581,
    losses: 332,
    winPercentage: 60.6,
  },
  {
    teamId: '3',
    teamName: 'England',
    matches: 781,
    wins: 387,
    losses: 362,
    winPercentage: 49.5,
  },
];

