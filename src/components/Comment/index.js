import React from 'react';
import { HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';
import './Comment.css';

const Comment = ({ comment = {}, onLike = () => {}, isLiked = false }) => {
  // Safely access comment properties with fallbacks
  const { 
    _id = `comment-${Math.random()}`,
    author = 'Anonymous', 
    content = 'No content', 
    likes = 0, 
    createdAt = new Date(),
    userLiked = false 
  } = comment || {};
  
  // Use either the passed isLiked prop or the comment's userLiked property
  const isCommentLiked = isLiked || userLiked || false;
  
  // Handle author that can be a string or an object
  const authorName = typeof author === 'string' ? author : author?.name || 'Anonymous';
  
  const timeAgo = (date) => {
    try {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + 'y';
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + 'mo';
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + 'd';
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + 'h';
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + 'm';
      return Math.floor(seconds) + 's';
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'recently';
    }
  };

  const handleLike = () => {
    try {
      console.log("Liking comment with ID:", _id, "Current like status:", isCommentLiked);
      onLike(_id);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="comment">
      <div className="comment-avatar">
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`} 
          alt={authorName} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
          }}
        />
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{authorName}</span>
          <span className="comment-time">{timeAgo(createdAt)}</span>
        </div>
        <p className="comment-text">{content}</p>
        <div className="comment-actions">
          <button 
            className={`like-button ${isCommentLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            {isCommentLiked ? (
              <HandThumbUpSolidIcon className="like-icon" />
            ) : (
              <HandThumbUpIcon className="like-icon" />
            )}
            {likes > 0 && <span>{likes}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Comment; 