import React from 'react';
import PropTypes from 'prop-types';
import './UserProfile.css';

const UserStatsCard = ({ stats }) => {
  return (
    <div className="stats-container">
      <h2 className="stats-title">Activity Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <span className="stat-value">{stats.totalPosts}</span>
          <span className="stat-label">Issues Reported</span>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-comments"></i>
          </div>
          <span className="stat-value">{stats.totalComments}</span>
          <span className="stat-label">Comments</span>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-vote-yea"></i>
          </div>
          <span className="stat-value">{stats.totalVotes}</span>
          <span className="stat-label">Total Votes</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <span className="stat-value">
            {((stats.totalVotes / (stats.totalPosts || 1)).toFixed(1))}
          </span>
          <span className="stat-label">Avg. Votes per Issue</span>
        </div>
      </div>
    </div>
  );
};

UserStatsCard.propTypes = {
  stats: PropTypes.shape({
    totalPosts: PropTypes.number.isRequired,
    totalComments: PropTypes.number.isRequired,
    totalVotes: PropTypes.number.isRequired
  }).isRequired
};

export default UserStatsCard; 