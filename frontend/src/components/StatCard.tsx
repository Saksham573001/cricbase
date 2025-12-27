import React from 'react';
import { theme } from '../theme';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
}) => {
  return (
    <div
      className="stat-card"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}
    >
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <div className="stat-title" style={{ color: theme.colors.textSecondary }}>
          {title}
        </div>
        <div className="stat-value" style={{ color: theme.colors.text }}>
          {value}
        </div>
        {subtitle && (
          <div className="stat-subtitle" style={{ color: theme.colors.textSecondary }}>
            {subtitle}
          </div>
        )}
        {trend && (
          <div
            className="stat-trend"
            style={{
              color: trend === 'up' ? theme.colors.success : theme.colors.error,
            }}
          >
            {trend === 'up' ? '↑' : '↓'}
          </div>
        )}
      </div>
    </div>
  );
};

