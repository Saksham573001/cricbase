import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Delivery, Comment } from '../types';
import { CommentThread } from '../components/CommentThread';
import { api } from '../config/api';
import { theme } from '../theme';
import './DeliveryDetailScreen.css';

export const DeliveryDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDelivery();
      fetchComments();
    }
  }, [id]);

  const fetchDelivery = async () => {
    try {
      const response = await api.get(`/deliveries/${id}`);
      setDelivery(response.data);
    } catch (error) {
      console.error('Error fetching delivery:', error);
      // Mock data for development
      setDelivery(mockDelivery);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/deliveries/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Mock data for development
      setComments(mockComments);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !id) return;

    try {
      const response = await api.post(`/deliveries/${id}/comments`, {
        content: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      // Mock for development
      const mockComment: Comment = {
        id: Date.now().toString(),
        deliveryId: id!,
        userId: '1',
        user: {
          id: '1',
          username: 'current_user',
          email: 'user@example.com',
          createdAt: new Date().toISOString(),
        },
        content: newComment,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
      };
      setComments([...comments, mockComment]);
      setNewComment('');
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!id) return;

    try {
      const response = await api.post(`/deliveries/${id}/comments`, {
        content,
        parentId,
      });
      // Refresh comments to get nested structure
      fetchComments();
    } catch (error) {
      console.error('Error replying:', error);
      // Mock for development - refresh comments
      fetchComments();
    }
  };

  const handleVote = async (commentId: string, vote: 'up' | 'down') => {
    try {
      await api.post(`/comments/${commentId}/vote`, { vote });
      // Refresh comments to get updated vote counts
      fetchComments();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) {
    return (
      <div className="delivery-detail-screen" style={{ backgroundColor: theme.colors.background }}>
        <div className="loading">Loading delivery...</div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="delivery-detail-screen" style={{ backgroundColor: theme.colors.background }}>
        <div className="empty-state">Delivery not found</div>
      </div>
    );
  }

  return (
    <div className="delivery-detail-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="delivery-detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h2 style={{ color: theme.colors.text }}>Delivery Details</h2>
      </div>

      <div
        className="delivery-detail-card"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="delivery-detail-over">
          <span style={{ color: theme.colors.textSecondary }}>
            Over {delivery.over}.{delivery.ball}
          </span>
        </div>
        <div className="delivery-detail-description" style={{ color: theme.colors.text }}>
          {delivery.description}
        </div>
        <div className="delivery-detail-meta">
          <span style={{ color: theme.colors.textSecondary }}>
            {delivery.bowler} → {delivery.batsman}
          </span>
          <span
            style={{
              color: delivery.isSix
                ? theme.colors.cricketGreen
                : delivery.isFour
                ? theme.colors.primary
                : delivery.isWicket
                ? theme.colors.cricketRed
                : theme.colors.textSecondary,
              fontWeight: 600,
            }}
          >
            {delivery.runs} {delivery.isWicket ? 'W' : 'runs'}
          </span>
        </div>
      </div>

      <div className="comments-section">
        <h3 style={{ color: theme.colors.text }}>Comments ({comments.length})</h3>

        <div className="comment-input-section">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.border}`,
              minHeight: '80px',
              fontFamily: theme.typography.fontFamily,
              resize: 'vertical',
            }}
          />
          <button
            onClick={handlePostComment}
            disabled={!newComment.trim()}
            style={{
              marginTop: '8px',
              padding: '10px 20px',
              backgroundColor: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: newComment.trim() ? 'pointer' : 'not-allowed',
              opacity: newComment.trim() ? 1 : 0.5,
            }}
          >
            Post Comment
          </button>
        </div>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="empty-state">No comments yet. Be the first to comment!</div>
          ) : (
            comments
              .filter((c) => !c.parentId)
              .map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onVote={handleVote}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for development
const mockDelivery: Delivery = {
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
};

const mockComments: Comment[] = [
  {
    id: '1',
    deliveryId: '1',
    userId: '1',
    user: {
      id: '1',
      username: 'cricket_lover',
      email: 'fan@example.com',
      createdAt: new Date().toISOString(),
    },
    content: 'What a shot! Kohli is in amazing form today!',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    upvotes: 15,
    downvotes: 2,
    replies: [
      {
        id: '2',
        deliveryId: '1',
        userId: '2',
        user: {
          id: '2',
          username: 'stats_guru',
          email: 'stats@example.com',
          createdAt: new Date().toISOString(),
        },
        content: 'His strike rate has been incredible this season!',
        createdAt: new Date(Date.now() - 3300000).toISOString(),
        upvotes: 8,
        downvotes: 0,
        parentId: '1',
      },
    ],
  },
  {
    id: '3',
    deliveryId: '1',
    userId: '3',
    user: {
      id: '3',
      username: 'bowling_fan',
      email: 'bowler@example.com',
      createdAt: new Date().toISOString(),
    },
    content: 'Cummins needs to adjust his line here.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    upvotes: 5,
    downvotes: 3,
  },
];

