import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProfilePosts.css';

const ProfilePosts = ({ type, userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call like:
        // const data = await api.getUserPosts(userId, type);
        
        // For now, we'll simulate an API response with mock data
        // but with a delay to simulate network request
        setTimeout(() => {
          const mockPosts = [
            {
              id: 1,
              title: 'Traffic Signal Malfunction',
              description: 'The traffic signal at Market & 4th has been malfunctioning for 3 days',
              status: 'In Progress',
              category: 'Infrastructure',
              timeAgo: '2 days ago',
              votes: 45,
              comments: 12,
              likes: 89
            },
            {
              id: 2,
              title: 'Park Cleanup Initiative',
              description: 'Organizing a community cleanup at Golden Gate Park',
              status: 'Open',
              category: 'Environment',
              timeAgo: '1 week ago',
              votes: 89,
              comments: 24,
              likes: 156
            },
            {
              id: 3,
              title: 'Bike Lane Safety Improvements',
              description: 'Request for additional safety measures on Market Street bike lanes',
              status: 'In Progress',
              category: 'Transportation',
              timeAgo: '3 days ago',
              votes: 67,
              comments: 15,
              likes: 42
            },
            {
              id: 4,
              title: 'Public Library Hours Extension',
              description: 'Proposal to extend library hours during exam season',
              status: 'Resolved',
              category: 'Education',
              timeAgo: '2 weeks ago',
              votes: 156,
              comments: 38,
              likes: 113
            }
          ];
          
          setPosts(mockPosts);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error(`Error fetching ${type}:`, err);
        setError(`Failed to load ${type}`);
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [type, userId]);

  if (loading) {
    return (
      <div className="posts-loading">
        <div className="loading-spinner"></div>
        <p>Loading {type}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="posts-error">
        <p>{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="no-posts">
        <p>No {type} found.</p>
        {type === 'issues' && (
          <Link to="/new-issue" className="create-post-btn">
            Report an Issue
          </Link>
        )}
        {type === 'proposals' && (
          <Link to="/new-proposal" className="create-post-btn">
            Create a Proposal
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="profile-posts">
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <div className="post-votes">
            <button className="vote-btn">
              <span className="up-arrow">▲</span>
            </button>
            <span className="vote-count">{post.votes}</span>
            <button className="vote-btn">
              <span className="down-arrow">▼</span>
            </button>
          </div>
          
          <div className="post-content">
            <div className="post-header">
              <Link to={`/post/${post.id}`} className="post-title-link">
                <h3 className="post-title">{post.title}</h3>
              </Link>
              <div className="post-meta">
                <span className={`post-status ${post.status.toLowerCase().replace(' ', '-')}`}>
                  {post.status}
                </span>
                <span className="post-category">{post.category}</span>
                <span className="post-time">{post.timeAgo}</span>
              </div>
            </div>
            
            <p className="post-description">{post.description}</p>
            
            <div className="post-actions">
              <Link to={`/post/${post.id}#comments`} className="action-btn">
                <span className="comment-icon">💬</span>
                <span>{post.comments}</span>
              </Link>
              <button className="action-btn">
                <span className="like-icon">❤️</span>
                <span>{post.likes}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePosts; 