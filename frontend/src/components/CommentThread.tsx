import React, { useState } from 'react';
import { Comment } from '../types';
import { theme } from '../theme';
import { formatDistanceToNow } from 'date-fns';
import './CommentThread.css';

interface CommentThreadProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => void;
  onVote: (commentId: string, vote: 'up' | 'down') => void;
  depth?: number;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  onReply,
  onVote,
  depth = 0,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const maxDepth = 5;
  const canNest = depth < maxDepth;

  return (
    <div className="comment-thread" style={{ marginLeft: depth * 20 }}>
      <div
        className="comment-card"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="comment-header">
          <div className="comment-author">
            <span className="comment-avatar">
              {comment.user.avatar ? (
                <img src={comment.user.avatar} alt={comment.user.username} />
              ) : (
                <span>{comment.user.username[0].toUpperCase()}</span>
              )}
            </span>
            <span style={{ fontWeight: 600, color: theme.colors.text }}>
              {comment.user.username}
            </span>
            <span style={{ color: theme.colors.textSecondary, fontSize: '12px' }}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="comment-content" style={{ color: theme.colors.text }}>
          {comment.content}
        </div>

        <div className="comment-actions">
          <div className="comment-votes">
            <button
              onClick={() => onVote(comment.id, 'up')}
              className={`vote-btn ${comment.userVote === 'up' ? 'active' : ''}`}
              style={{
                color: comment.userVote === 'up' ? theme.colors.success : theme.colors.textSecondary,
              }}
            >
              ▲ {comment.upvotes}
            </button>
            <button
              onClick={() => onVote(comment.id, 'down')}
              className={`vote-btn ${comment.userVote === 'down' ? 'active' : ''}`}
              style={{
                color: comment.userVote === 'down' ? theme.colors.error : theme.colors.textSecondary,
              }}
            >
              ▼ {comment.downvotes}
            </button>
          </div>
          {canNest && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              style={{ color: theme.colors.primary }}
              className="reply-btn"
            >
              Reply
            </button>
          )}
        </div>

        {isReplying && (
          <div className="reply-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.border}`,
                minHeight: '60px',
                fontFamily: theme.typography.fontFamily,
              }}
            />
            <div className="reply-actions">
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                style={{ color: theme.colors.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                style={{
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: theme.borderRadius.md,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reply
              </button>
            </div>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onVote={onVote}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

