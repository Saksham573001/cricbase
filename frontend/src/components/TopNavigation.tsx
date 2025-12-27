import React from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';
import './TopNavigation.css';

export const TopNavigation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="top-nav" style={{ backgroundColor: theme.colors.backgroundSecondary }}>
      <div className="top-nav-content">
        <div className="nav-logo" onClick={() => navigate('/feed')}>
          <span className="logo-icon">🏏</span>
          <span className="logo-text">CRICBASE</span>
          <span className="logo-beta">β</span>
        </div>
      </div>
    </nav>
  );
};

