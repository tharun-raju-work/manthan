import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../services/api';
import ProfilePosts from '../../components/ProfilePosts';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('issues');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Remove @ from username if present
  const cleanUsername = username?.startsWith('@') ? username.substring(1) : username;
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(cleanUsername);
        
        // Calculate stats for display
        const displayStats = {
          issues: data.stats?.totalPosts || 0,
          solutions: Math.floor((data.stats?.totalPosts || 0) * 0.6), // Example calculation
          comments: data.stats?.totalComments || 0
        };
        
        // Calculate achievements
        const karma = ((data.stats?.totalPosts || 0) * 10) + 
                      ((data.stats?.totalComments || 0) * 5) + 
                      ((data.stats?.totalVotes || 0) * 2);
        
        // Format the join date
        const joinDate = new Date(data.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short'
        });
        
        setProfileData({
          ...data,
          stats: displayStats,
          joinDate,
          achievements: {
            karma,
            rank: Math.floor(Math.random() * 100) + 1, // This would be calculated on the server in a real app
            streak: Math.floor(Math.random() * 30) + 1 // This would be calculated on the server in a real app
          }
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };
    
    if (cleanUsername) {
      fetchProfileData();
    }
  }, [cleanUsername]);
  
  if (!cleanUsername) {
    return <Navigate to="/" replace />;
  }
  
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="profile-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }
  
  if (!profileData) {
    return (
      <div className="profile-not-found">
        <h2>Profile Not Found</h2>
        <p>The user you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  // Tabs configuration
  const tabs = [
    { id: 'issues', label: 'My Issues' },
    { id: 'proposals', label: 'My Proposals' },
    { id: 'comments', label: 'My Comments' },
    { id: 'achievements', label: 'Achievements' },
  ];

  // Badges configuration - in a real app, these would come from the API
  const badges = [
    { icon: '🏆', name: 'Problem Solver' },
    { icon: '📈', name: 'Trending' },
    { icon: '📊', name: 'Influencer' },
    { icon: '✅', name: 'Verified' },
    { icon: '💡', name: 'Innovator' },
    { icon: '💬', name: 'Communicator' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'issues':
        return <ProfilePosts type="issues" userId={profileData._id} />;
      case 'proposals':
        return <ProfilePosts type="proposals" userId={profileData._id} />;
      case 'comments':
        return <ProfilePosts type="comments" userId={profileData._id} />;
      case 'achievements':
        return <div className="achievements-content">Achievements content</div>;
      default:
        return null;
    }
  };

  // Check if the profile belongs to the current user
  const isOwnProfile = currentUser && (currentUser._id === profileData._id || currentUser.username === profileData.username);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Left Column - Profile Info */}
        <div className="profile-header">
          <img 
            src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&size=200`} 
            alt={profileData.name} 
            className="profile-avatar"
          />
          <h1 className="profile-name">{profileData.name}</h1>
          {profileData.location && (
            <div className="profile-location">
              <span className="location-icon">📍</span>
              <span>{profileData.location}</span>
            </div>
          )}
          <div className="profile-member-since">
            <span className="calendar-icon">📅</span>
            <span>Member since {profileData.joinDate}</span>
          </div>
          {isOwnProfile && (
            <button className="edit-profile-btn" onClick={() => navigate('/settings/profile')}>
              <span className="edit-icon">✏️</span>
              Edit Profile
            </button>
          )}
          
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{profileData.stats.issues}</div>
              <div className="stat-label">Issues Reported</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{profileData.stats.solutions}</div>
              <div className="stat-label">Solutions Proposed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{profileData.stats.comments}</div>
              <div className="stat-label">Comments Made</div>
            </div>
          </div>
        </div>

        {/* Middle Column - Content */}
        <div className="profile-content">
          <div className="content-tabs">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Column - Achievement Summary */}
        <div>
          <div className="achievement-summary">
            <h2 className="summary-title">Achievement Summary</h2>
            <div className="summary-item">
              <span className="summary-label">Karma Points</span>
              <span className="summary-value">{profileData.achievements.karma.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Community Rank</span>
              <span className="summary-value">#{profileData.achievements.rank}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Participation Streak</span>
              <span className="summary-value">{profileData.achievements.streak} days</span>
            </div>
          </div>

          <div className="badges-section">
            <h2 className="summary-title">Recent Badges</h2>
            <div className="badges-grid">
              {badges.map((badge, index) => (
                <div key={index} className="badge-item">
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 