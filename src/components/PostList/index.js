import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  HandThumbUpIcon 
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';
import { votePost, likePost, sharePost, addComment, likeComment } from '../../services/api';
import CommentSection from '../CommentSection';
import './PostList.css';

const PostCard = ({ post, onPostUpdate }) => {
  const [voteStatus, setVoteStatus] = useState(post.userVote || 0);
  const [voteCount, setVoteCount] = useState(post.votes || 0);
  const [isLiked, setIsLiked] = useState(post.userLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);

  const handleVote = async (e, direction) => {
    e.stopPropagation();
    try {
      const newStatus = voteStatus === direction ? 0 : direction;
      const response = await votePost(post._id, newStatus);
      
      if (response.success) {
        setVoteStatus(newStatus);
        setVoteCount(response.data.votes);
        onPostUpdate && onPostUpdate();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      console.log("Liking post:", post._id, "Current state:", isLiked);
      const newLikedState = !isLiked;
      
      // Optimistically update UI
      setIsLiked(newLikedState);
      setLikeCount(prevCount => newLikedState ? prevCount + 1 : Math.max(0, prevCount - 1));
      
      const response = await likePost(post._id, newLikedState);
      console.log("Like response:", response);
      
      if (response.success) {
        // Update with server response
        setIsLiked(!!response.data.userLiked);
        setLikeCount(response.data.likes || 0);
        onPostUpdate && onPostUpdate();
      } else {
        // Revert optimistic update if request failed
        setIsLiked(!newLikedState);
        setLikeCount(prevCount => !newLikedState ? prevCount + 1 : Math.max(0, prevCount - 1));
        console.error("Like operation failed:", response);
      }
    } catch (error) {
      console.error('Error liking:', error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount(prevCount => isLiked ? prevCount + 1 : Math.max(0, prevCount - 1));
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await sharePost(post._id);
      
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: `${window.location.origin}/posts/${post._id}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const response = await addComment(postId, content);
      if (response.success) {
        setComments(prevComments => [...prevComments, response.data]);
        onPostUpdate && onPostUpdate();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      console.log("Liking comment:", commentId, "for post:", postId);
      
      // Find the comment and toggle like status
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          const isCurrentlyLiked = comment.userLiked || false;
          const newLikeCount = isCurrentlyLiked 
            ? Math.max(0, (comment.likes || 0) - 1) 
            : (comment.likes || 0) + 1;
            
          // Optimistically update UI
          return {
            ...comment,
            userLiked: !isCurrentlyLiked,
            likes: newLikeCount
          };
        }
        return comment;
      });
      
      // Update local state immediately for better UX
      setComments(updatedComments);
      
      // Then send API request
      const response = await likeComment(postId, commentId);
      
      if (response.success) {
        // If the server returns the updated comment, use that data
        if (response.data && response.data.comments) {
          setComments(response.data.comments);
        }
        
        onPostUpdate && onPostUpdate();
      } else {
        // Revert optimistic update if request failed
        setComments(comments);
        console.error("Comment like operation failed:", response);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert optimistic update on error
      setComments(comments);
    }
  };

  return (
    <div className="post-card bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="post-votes flex flex-col items-center mr-4">
        <button 
          className={`p-1 rounded-full ${voteStatus === 1 ? 'text-blue-500 bg-blue-100' : 'text-gray-400 hover:text-blue-500'}`} 
          onClick={(e) => handleVote(e, 1)}
        >
          <ChevronUpIcon className="h-6 w-6" />
        </button>
        <span className="my-1 font-medium">{voteCount}</span>
        <button 
          className={`p-1 rounded-full ${voteStatus === -1 ? 'text-blue-500 bg-blue-100' : 'text-gray-400 hover:text-blue-500'}`} 
          onClick={(e) => handleVote(e, -1)}
        >
          <ChevronDownIcon className="h-6 w-6" />
        </button>
      </div>
      
      <div className="post-content flex-grow">
        <Link 
          to={`/post/${post._id}`} 
          className="post-title text-xl font-semibold mb-2 hover:text-blue-600"
        >
          {post.title}
        </Link>
        
        <div className="post-meta text-sm text-gray-600 mb-2">
          Posted by {post.author} • {post.timeAgo}
        </div>
        
        {post.image && (
          <Link to={`/post/${post._id}`} className="block mb-3">
            <img 
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${post.image}`} 
              alt={post.title}
              className="rounded-lg max-h-64 object-contain"
            />
          </Link>
        )}
        
        <Link 
          to={`/post/${post._id}`} 
          className="post-description mb-3 text-gray-700 hover:text-gray-900"
        >
          <p>{post.description.length > 300 ? `${post.description.substring(0, 300)}...` : post.description}</p>
        </Link>
        
        <div className="post-actions flex items-center space-x-4 mt-4">
          <button 
            className="flex items-center text-gray-500 hover:text-gray-700"
            onClick={() => setShowComments(!showComments)}
          >
            <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
            <span>{post.comments?.length || 0} Comments</span>
          </button>
          
          <button 
            className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            onClick={handleLike}
          >
            {isLiked ? (
              <HandThumbUpSolidIcon className="h-5 w-5 mr-1" />
            ) : (
              <HandThumbUpIcon className="h-5 w-5 mr-1" />
            )}
            <span>{likeCount} Likes</span>
          </button>
          
          <button 
            className="flex items-center text-gray-500 hover:text-blue-500"
            onClick={handleShare}
          >
            <ShareIcon className="h-5 w-5 mr-1" />
            <span>{post.shares || 0} Shares</span>
          </button>
        </div>
        
        {showComments && (
          <div className="post-comments mt-4">
            <CommentSection 
              postId={post._id}
              comments={comments || []} 
              onAddComment={handleAddComment}
              onLikeComment={handleLikeComment}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const PostList = ({ posts, onPostUpdate }) => {
  return (
    <div className="posts-list">
      {posts.map((post) => (
        <PostCard 
          key={post._id} 
          post={post}
          onPostUpdate={onPostUpdate}
        />
      ))}
    </div>
  );
};

PostList.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      username: PropTypes.string,
      authorAvatar: PropTypes.string,
      category: PropTypes.string,
      image: PropTypes.string,
      votes: PropTypes.number,
      likes: PropTypes.number,
      comments: PropTypes.array,
      userVote: PropTypes.number,
      userLiked: PropTypes.bool,
      timeAgo: PropTypes.string
    })
  ).isRequired,
  onPostUpdate: PropTypes.func
};

export default PostList; 