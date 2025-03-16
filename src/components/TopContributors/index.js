import React from 'react';
import { Link } from 'react-router-dom';
import './TopContributors.css';

const TopContributors = ({ contributors = [] }) => {
  // Make sure we have at least some dummy data if none is provided
  const displayContributors = contributors.length > 0 ? 
    contributors : 
    [
      { id: 1, name: 'Alex Johnson', points: 95, avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff' },
      { id: 2, name: 'Priya Sharma', points: 82, avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=F17300&color=fff' },
      { id: 3, name: 'Michael Wong', points: 76, avatar: 'https://ui-avatars.com/api/?name=Michael+Wong&background=0076B2&color=fff' },
      { id: 4, name: 'Sarah Garcia', points: 63, avatar: 'https://ui-avatars.com/api/?name=Sarah+Garcia&background=8E44AD&color=fff' },
      { id: 5, name: 'James Wilson', points: 58, avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=27AE60&color=fff' }
    ];

  return (
    <div className="top-contributors-container">
      <div className="top-contributors-header">
        <h3 className="top-contributors-title">
          <i className="fas fa-medal"></i> Top Contributors
        </h3>
        <Link to="/leaderboard" className="view-all-link">View All</Link>
      </div>
      
      {displayContributors.slice(0, 5).map((contributor, index) => (
        <div 
          key={contributor.id || index}
          className="contributor-item"
        >
          <div className="contributor-rank">
            {index === 0 && <span className="rank-badge first-rank">#1</span>}
            {index === 1 && <span className="rank-badge second-rank">#2</span>}
            {index === 2 && <span className="rank-badge third-rank">#3</span>}
            {index > 2 && <span className="rank-badge">{`#${index + 1}`}</span>}
          </div>
          
          <Link to={`/profile/${contributor.id}`} className="contributor-avatar">
            <img 
              src={contributor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=random`} 
              alt={contributor.name}
              className="avatar-img"
            />
          </Link>
          
          <div className="contributor-details">
            <Link to={`/profile/${contributor.id}`} className="contributor-name">
              {contributor.name}
            </Link>
            <div className="contributor-stats">
              <span className="points">
                <i className="fas fa-star"></i> {contributor.points}
              </span>
              
              <div className="badge-container">
                {contributor.points >= 80 && (
                  <span className="contributor-badge expert" title="Expert Contributor">
                    <i className="fas fa-award"></i>
                  </span>
                )}
                {contributor.points >= 50 && (
                  <span className="contributor-badge active" title="Active Contributor">
                    <i className="fas fa-fire"></i>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="become-contributor">
        <i className="fas fa-lightbulb idea-icon"></i>
        <div className="become-contributor-text">
          <p>Want to be featured here?</p>
          <Link to="/how-to-contribute" className="contribute-link">How to contribute</Link>
        </div>
      </div>
    </div>
  );
};

export default TopContributors; 