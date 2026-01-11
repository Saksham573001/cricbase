import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Delivery } from '../types';
import { api } from '../config/api';
import './TrendingSidebar.css';

export const TrendingSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [trendingDeliveries, setTrendingDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      // Fetch most commented deliveries
      const deliveriesResponse = await api.get('/deliveries/feed', { params: { limit: 5 } });
      setTrendingDeliveries(deliveriesResponse.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching trending data:', error);
    }
  };

  return (
    <div className="trending-sidebar">
      {/* Rewind Card */}
      <div className="rewind-card">
        <div className="rewind-header">
          <span className="rewind-logo">🏏</span>
          <span className="rewind-title">CRICBASE</span>
        </div>
        <div className="rewind-content">
          <h3 className="rewind-main-text">Rewind 2025</h3>
          <p className="rewind-subtext">RELIVE THE MOMENTS</p>
        </div>
        <div className="rewind-arrows">
          <button className="arrow-btn">←</button>
          <button className="arrow-btn">→</button>
        </div>
      </div>

      {/* Most Interested Section */}
      <div className="most-interested">
        <div className="most-interested-header">
          <span className="flame-icon">🔥</span>
          <h3 className="most-interested-title">Most Interested</h3>
          <select className="time-filter" defaultValue="month">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="trending-list">
          {trendingDeliveries.map((delivery, index) => (
            <div
              key={delivery.id}
              className="trending-item"
              onClick={() => navigate(`/delivery/${delivery.id}`)}
            >
              <div className="trending-rank">{index + 1}</div>
              <div className="trending-poster">
                {delivery.isSix ? '6️⃣' : delivery.isFour ? '4️⃣' : delivery.isWicket ? '🎯' : '⚪'}
              </div>
              <div className="trending-info">
                <div className="trending-name">{delivery.description.substring(0, 30)}...</div>
                <div className="trending-meta">
                  Over {delivery.over}.{delivery.ball} • {delivery.batsman}
                </div>
                <div className="trending-stats">
                  🔥 {delivery.commentCount} Comments
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

