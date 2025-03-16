import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import './Search.css';

const SearchResults = () => {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const query = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  const [activeTab, setActiveTab] = useState(initialType);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    issues: [],
    people: [],
    topics: [],
    locations: []
  });

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Real API call to our backend
        const response = await api.get(`/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
        console.log(response.data);
        setResults(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Failed to load search results. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query, activeTab]);

  // Update the URL when tab changes without causing full page reload
  useEffect(() => {
    if (activeTab === 'all') {
      searchParams.delete('type');
    } else {
      searchParams.set('type', activeTab);
    }
    
    const newUrl = `${location.pathname}?${searchParams.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [activeTab, location.pathname, searchParams]);

  const totalResults = 
    results.issues.length + 
    results.people.length + 
    results.topics.length + 
    results.locations.length;

  const renderIssueResults = () => {
    if (results.issues.length === 0) {
      return <div className="no-results">No issues found for "{query}"</div>;
    }
    
    return (
      <div className="search-results-issues">
        {results.issues.map(issue => (
          <div key={issue.id} className="search-result-item issue-result">
            <div className="result-header">
              <Link to={`/post/${issue.id}`} className="result-title">
                {issue.title}
              </Link>
              <div className="result-meta">
                <span className={`result-status ${issue.status.toLowerCase().replace(' ', '-')}`}>
                  {issue.status}
                </span>
                <span className="result-category">{issue.category}</span>
              </div>
            </div>
            <div className="result-description">{issue.description}</div>
            <div className="result-footer">
              <div className="result-author">
                Posted by <Link to={`/@${issue.authorUsername}`}>{issue.author}</Link> {issue.postedAt}
              </div>
              <div className="result-stats">
                <span><i className="fas fa-arrow-up"></i> {issue.votes}</span>
                <span><i className="fas fa-comment"></i> {issue.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPeopleResults = () => {
    if (results.people.length === 0) {
      return <div className="no-results">No people found for "{query}"</div>;
    }
    
    return (
      <div className="search-results-people">
        {results.people.map(person => (
          <div key={person.id} className="search-result-item person-result">
            <Link to={`/@${person.username}`} className="person-avatar">
              <img src={person.avatar} alt={person.name} />
            </Link>
            <div className="person-info">
              <div className="person-name-container">
                <Link to={`/@${person.username}`} className="person-name">
                  {person.name}
                </Link>
                <span className="person-username">@{person.username}</span>
              </div>
              <div className="person-bio">{person.bio}</div>
              <div className="person-followers">
                <span><i className="fas fa-user-friends"></i> {person.followers} followers</span>
              </div>
            </div>
            <button className="follow-button">
              <i className="fas fa-user-plus"></i> Follow
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderTopicsResults = () => {
    if (results.topics.length === 0) {
      return <div className="no-results">No topics found for "{query}"</div>;
    }
    
    return (
      <div className="search-results-topics">
        {results.topics.map(topic => (
          <div key={topic.id} className="search-result-item topic-result">
            <div className="topic-icon">
              <i className="fas fa-hashtag"></i>
            </div>
            <div className="topic-info">
              <Link to={`/topic/${topic.name}`} className="topic-name">
                {topic.name}
              </Link>
              <div className="topic-description">{topic.description}</div>
              <div className="topic-count">
                <span><i className="fas fa-file-alt"></i> {topic.count} posts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLocationResults = () => {
    if (results.locations.length === 0) {
      return <div className="no-results">No locations found for "{query}"</div>;
    }
    
    return (
      <div className="search-results-locations">
        {results.locations.map(location => (
          <div key={location.id} className="search-result-item location-result">
            <div className="location-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="location-info">
              <Link to={`/location/${location.name}`} className="location-name">
                {location.name}
              </Link>
              <div className="location-type">{location.type}</div>
              <div className="location-count">
                <span><i className="fas fa-file-alt"></i> {location.count} posts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Searching for "{query}"...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="search-error">
          <div className="error-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (totalResults === 0) {
      return (
        <div className="search-no-results">
          <div className="no-results-icon">
            <i className="fas fa-search"></i>
          </div>
          <h2>No results found for "{query}"</h2>
          <p>Try using different keywords or checking for typos.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'all':
        return (
          <>
            {results.issues.length > 0 && (
              <div className="search-section">
                <div className="search-section-header">
                  <h2>Issues</h2>
                  {results.issues.length > 2 && (
                    <Link to={`/search?q=${query}&type=issues`} className="view-all-link">
                      View all
                    </Link>
                  )}
                </div>
                {renderIssueResults()}
              </div>
            )}
            
            {results.people.length > 0 && (
              <div className="search-section">
                <div className="search-section-header">
                  <h2>People</h2>
                  {results.people.length > 2 && (
                    <Link to={`/search?q=${query}&type=people`} className="view-all-link">
                      View all
                    </Link>
                  )}
                </div>
                {renderPeopleResults()}
              </div>
            )}
            
            {results.topics.length > 0 && (
              <div className="search-section">
                <div className="search-section-header">
                  <h2>Topics</h2>
                  {results.topics.length > 2 && (
                    <Link to={`/search?q=${query}&type=topics`} className="view-all-link">
                      View all
                    </Link>
                  )}
                </div>
                {renderTopicsResults()}
              </div>
            )}
            
            {results.locations.length > 0 && (
              <div className="search-section">
                <div className="search-section-header">
                  <h2>Locations</h2>
                  {results.locations.length > 2 && (
                    <Link to={`/search?q=${query}&type=locations`} className="view-all-link">
                      View all
                    </Link>
                  )}
                </div>
                {renderLocationResults()}
              </div>
            )}
          </>
        );
      case 'issues':
        return (
          <div className="search-section">
            <div className="search-section-header">
              <h2>Issues</h2>
            </div>
            {renderIssueResults()}
          </div>
        );
      case 'people':
        return (
          <div className="search-section">
            <div className="search-section-header">
              <h2>People</h2>
            </div>
            {renderPeopleResults()}
          </div>
        );
      case 'topics':
        return (
          <div className="search-section">
            <div className="search-section-header">
              <h2>Topics</h2>
            </div>
            {renderTopicsResults()}
          </div>
        );
      case 'locations':
        return (
          <div className="search-section">
            <div className="search-section-header">
              <h2>Locations</h2>
            </div>
            {renderLocationResults()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Results for "{query}"</h1>
        {!loading && totalResults > 0 && (
          <p>{totalResults} results found</p>
        )}
      </div>
      
      <div className="search-container">
        <div className="search-tabs">
          <button 
            className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`search-tab ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            Issues
            {results.issues.length > 0 && <span className="result-count">{results.issues.length}</span>}
          </button>
          <button 
            className={`search-tab ${activeTab === 'people' ? 'active' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            People
            {results.people.length > 0 && <span className="result-count">{results.people.length}</span>}
          </button>
          <button 
            className={`search-tab ${activeTab === 'topics' ? 'active' : ''}`}
            onClick={() => setActiveTab('topics')}
          >
            Topics
            {results.topics.length > 0 && <span className="result-count">{results.topics.length}</span>}
          </button>
          <button 
            className={`search-tab ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            Locations
            {results.locations.length > 0 && <span className="result-count">{results.locations.length}</span>}
          </button>
        </div>
        
        <div className="search-results">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 