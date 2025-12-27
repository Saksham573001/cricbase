import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { theme } from '../theme';
import './ProfileScreen.css';

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from API or auth context
    setUser({
      id: '1',
      username: 'cricket_fan',
      email: 'fan@example.com',
      createdAt: new Date().toISOString(),
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="profile-screen" style={{ backgroundColor: theme.colors.background }}>
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-screen" style={{ backgroundColor: theme.colors.background }}>
        <div className="empty-state">Please log in</div>
      </div>
    );
  }

  return (
    <div className="profile-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} />
          ) : (
            <span>{user.username[0].toUpperCase()}</span>
          )}
        </div>
        <h1 style={{ color: theme.colors.text }}>{user.username}</h1>
        <p style={{ color: theme.colors.textSecondary }}>{user.email}</p>
      </div>

      <div className="profile-stats">
        <div className="profile-stat-item">
          <div className="stat-value" style={{ color: theme.colors.primary }}>
            42
          </div>
          <div className="stat-label" style={{ color: theme.colors.textSecondary }}>
            Comments
          </div>
        </div>
        <div className="profile-stat-item">
          <div className="stat-value" style={{ color: theme.colors.primary }}>
            128
          </div>
          <div className="stat-label" style={{ color: theme.colors.textSecondary }}>
            Upvotes
          </div>
        </div>
        <div className="profile-stat-item">
          <div className="stat-value" style={{ color: theme.colors.primary }}>
            15
          </div>
          <div className="stat-label" style={{ color: theme.colors.textSecondary }}>
            Followers
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div
          className="profile-section"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <h2 style={{ color: theme.colors.text }}>Account Settings</h2>
          <button
            className="profile-button"
            style={{
              backgroundColor: theme.colors.primary,
              color: 'white',
            }}
          >
            Edit Profile
          </button>
          <button
            className="profile-button"
            style={{
              backgroundColor: 'transparent',
              color: theme.colors.error,
              border: `1px solid ${theme.colors.error}`,
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

