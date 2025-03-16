import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  BookmarkIcon, 
  ShareIcon, 
  FlagIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import './Post.css';

// Helper function to format date to "X days/hours/minutes ago"
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
};

// Helper to format view count (e.g. 2400 -> 2.4k)
const formatViewCount = (count) => {
  if (!count) return "0 views";
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k views';
  }
  return count + ' views';
};

const Post = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = user?.data?.token;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch the post data from backend
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1'}/posts/${postId}`,
          { headers }
        );
        
        console.log('API Response:', response.data);
        if (response.data) {
          // Transform API data to match our UI structure
          const postData = {
            ...response.data,
            _id: response.data._id || postId,
            location: response.data.location || 'Unknown Location',
            postedDate: response.data.createdAt ? `Posted ${formatTimeAgo(response.data.createdAt)}` : 'Recently posted',
            viewCount: formatViewCount(response.data.views || 0),
            commentCount: `${response.data.comments?.length || 0} comments`,
            comments: response.data.comments || [],
            tags: response.data.tags || ['Infrastructure'],
            solutions: response.data.solutions || [
              "Implement temporary road patches within 48 hours to address immediate safety concerns.",
              "Schedule comprehensive road resurfacing during off-peak hours to minimize traffic disruption.",
              "Install warning signs and temporary traffic management measures while repairs are pending."
            ],
            // Fallback images if none provided
            images: response.data.images || (response.data.image ? [response.data.image] : [])
          };
          setPost(postData);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, user, refreshData]);

  const handleVote = async (direction) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const token = user?.data?.token;
      if (!token) {
        navigate('/login');
        return;
      }

      const voteDirection = direction === 'up' ? 1 : -1;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1'}/posts/${postId}/vote`,
        { direction: voteDirection },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update post with new vote count
        setPost(prev => ({
          ...prev,
          votes: response.data.data.votes,
          userVote: voteDirection
        }));
      }
    } catch (err) {
      console.error('Error voting:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const token = user?.data?.token;
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1'}/posts/${postId}/comments`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Clear comment text
        setCommentText('');
        // Refresh post data to show new comment
        setRefreshData(prev => !prev);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const token = user?.data?.token;
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1'}/posts/${postId}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Refresh post data to show updated comment likes
        setRefreshData(prev => !prev);
      }
    } catch (err) {
      console.error('Error liking comment:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h2 className="text-lg font-semibold">Post Not Found</h2>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => navigate('/')}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-500">Home</Link>
            <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
            <Link to="/issues" className="hover:text-blue-500">Issues</Link>
            <svg className="w-3 h-3 mx-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
            <span>Road Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          {/* Post header */}
          <div className="flex p-4">
            {/* Vote buttons */}
            <div className="flex flex-col items-center mr-4">
              <button 
                onClick={() => handleVote('up')}
                className={`p-1 focus:outline-none ${post.userVote === 1 ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              >
                <ArrowUpIcon className="w-7 h-7" />
              </button>
              <span className="text-lg font-semibold my-1">{post.votes || 0}</span>
              <button 
                onClick={() => handleVote('down')}
                className={`p-1 focus:outline-none ${post.userVote === -1 ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              >
                <ArrowDownIcon className="w-7 h-7" />
              </button>
            </div>

            {/* Post content */}
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 mr-2">Infrastructure</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">Open</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
              
              {/* Post metadata */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center mr-4">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span>{post.location}</span>
                </div>
                <div className="flex items-center mr-4">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span>{post.postedDate}</span>
                </div>
                <div className="flex items-center mr-4">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  <span>{post.viewCount}</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                  <span>{post.commentCount}</span>
                </div>
              </div>
              
              {/* Post description */}
              <p className="text-gray-700 mb-6">{post.description || post.content}</p>
              
              {/* Post images */}
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {post.images.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden h-32">
                      <img 
                        src={image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${image}`}
                        alt={`Post visual ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-2">
                <button className={`p-1 focus:outline-none ${post.userBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}>
                  <BookmarkIcon className="w-5 h-5" />
                </button>
                <button className="p-1 text-gray-500 hover:text-blue-500 focus:outline-none">
                  <ShareIcon className="w-5 h-5" />
                </button>
                <button className="p-1 text-gray-500 hover:text-red-500 focus:outline-none">
                  <FlagIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* AI Suggested Solutions */}
          {post.solutions && post.solutions.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-1 rounded">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <h3 className="ml-2 text-lg font-semibold text-gray-900">AI-Suggested Solutions</h3>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <ol className="space-y-3 text-blue-800">
                  {post.solutions.map((solution, index) => (
                    <li key={index} className="flex">
                      <span className="font-semibold mr-2">{index + 1}.</span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ol>
                <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  See More Solutions
                </button>
              </div>
            </div>
          )}
          
          {/* Comments */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Comments ({post.comments ? post.comments.length : 0})
              </h3>
              <select className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option>Top</option>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </div>
            
            {/* Comment form */}
            <div className="flex mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <img 
                  src={user?.data?.user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} 
                  alt="Your avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://randomuser.me/api/portraits/men/32.jpg";
                  }}
                />
              </div>
              <form onSubmit={handleCommentSubmit} className="flex-1">
                <textarea
                  placeholder={user ? "What are your thoughts?" : "Please login to comment"}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 text-sm"
                  rows="2"
                  disabled={!user}
                />
                <div className="mt-2 flex justify-end">
                  {user ? (
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                    >
                      Comment
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
                    >
                      Login to Comment
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Comment list */}
            <div className="space-y-6">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment, index) => (
                  <div key={comment._id || index} className="flex">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                      <img 
                        src={comment.author?.avatar || `https://randomuser.me/api/portraits/people/${index + 10}.jpg`} 
                        alt={comment.author?.name || "Anonymous"} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://randomuser.me/api/portraits/people/${index + 10}.jpg`;
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.author?.name || "Anonymous"}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          {comment.createdAt ? formatTimeAgo(comment.createdAt) : "Recently"}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <button 
                          className={`mr-1 hover:text-blue-500 ${comment.userLiked ? 'text-blue-500' : ''}`}
                          onClick={() => handleLikeComment(comment._id)}
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <span className="mr-3">{comment.likes || 0}</span>
                        <button className="flex items-center hover:text-blue-500 mr-3">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                          </svg>
                          <span>{comment.replies?.length || 0} replies</span>
                        </button>
                        <button className="text-blue-500 hover:text-blue-600">Reply</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Post; 