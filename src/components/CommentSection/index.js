import React, { useState } from 'react';
import Comment from '../Comment';
import './CommentSection.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Provide default values for all props to prevent undefined errors
const CommentSection = ({ 
  post = null, 
  postId = null, 
  comments = [], 
  onAddComment = () => {}, 
  onLikeComment = () => {} 
}) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle both passing post object or separate postId and comments array
  const postIdToUse = post?._id || postId;
  // Safely access comments from either source
  const commentsToUse = post?.comments || comments || [];

  // Make sure commentsToUse is always an array
  const safeComments = Array.isArray(commentsToUse) ? commentsToUse : [];
  
  const visibleComments = showAllComments 
    ? safeComments 
    : safeComments.slice(-2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      // navigate('/login');
      return;
    }

    if (!newComment.trim() || isSubmitting || !postIdToUse) return;

    setIsSubmitting(true);
    setError('');

    try {
      await onAddComment(postIdToUse, newComment.trim());
      setNewComment('');
    } catch (error) {
      if (error.message && error.message.includes('Please login')) {
        navigate('/login');
      } else {
        setError('Failed to add comment. Please try again.');
        console.error('Failed to add comment:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we don't have a valid postId, render a message rather than crashing
  if (!postIdToUse) {
    console.warn('CommentSection: No valid postId provided');
    return (
      <div className="comment-section">
        <div className="comments-list">
          <div className="no-comments">Comments unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-section">
      {error && <div className="error-message">{error}</div>}
      
      {safeComments.length > 2 && !showAllComments && (
        <button 
          className="load-more-comments"
          onClick={() => setShowAllComments(true)}
        >
          View all {safeComments.length} comments
        </button>
      )}

      <div className="comments-list">
        {safeComments.length > 0 ? (
          visibleComments.map(comment => (
            <Comment
              key={comment._id || `comment-${Math.random()}`}
              comment={comment}
              onLike={() => onLikeComment(postIdToUse, comment._id)}
              isLiked={comment.userLiked || false}
            />
          ))
        ) : (
          <div className="no-comments">No comments yet. Be the first to comment!</div>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="comment-input"
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            disabled={!newComment.trim() || isSubmitting}
            className="comment-submit"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      ) : (
        <div className="login-prompt">
          <Link to="/login">Login to add a comment</Link>
        </div>
      )}
    </div>
  );
};

export default CommentSection; 