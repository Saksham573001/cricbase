import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { theme } from '../theme';
import './BottomNavigation.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/matches', label: 'Matches', icon: '🏏' },
  { path: '/feed', label: 'Feed', icon: '📰' },
  { path: '/stats', label: 'Stats', icon: '📊' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" style={{ backgroundColor: theme.colors.surface }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            style={{
              color: isActive ? theme.colors.primary : theme.colors.textSecondary,
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

