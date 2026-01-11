import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Delivery } from '../types';
import './DeliveryCard.css';

interface DeliveryCardProps {
  delivery: Delivery;
  matchInfo?: { team1: string; team2: string };
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, matchInfo }) => {
  const navigate = useNavigate();

  const getDeliveryIcon = () => {
    if (delivery.isSix) return '6️⃣';
    if (delivery.isFour) return '4️⃣';
    if (delivery.isWicket) return '🎯';
    return '⚪';
  };

  const getDeliveryType = () => {
    if (delivery.isSix) return 'Six';
    if (delivery.isFour) return 'Four';
    if (delivery.isWicket) return 'Wicket';
    return 'Delivery';
  };

  return (
    <div
      className="delivery-card-poster"
      onClick={() => navigate(`/delivery/${delivery.id}`)}
    >
      <div className="poster-image" style={{ 
        background: delivery.isSix 
          ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
          : delivery.isFour
          ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
          : delivery.isWicket
          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
      }}>
        <div className="poster-icon">{getDeliveryIcon()}</div>
        <div className="poster-runs">{delivery.runs} {delivery.isWicket ? 'W' : ''}</div>
      </div>
      <div className="poster-info">
        <div className="poster-title">{delivery.description.substring(0, 50)}...</div>
        {matchInfo && (
          <div className="poster-subtitle">{matchInfo.team1} vs {matchInfo.team2}</div>
        )}
        <div className="poster-meta">
          <span className="poster-type">{getDeliveryType()}</span>
          <span className="poster-over">Over {delivery.over}.{delivery.ball}</span>
        </div>
        <div className="poster-footer">
          <span className="poster-comments">💬 {delivery.commentCount}</span>
        </div>
      </div>
    </div>
  );
};

