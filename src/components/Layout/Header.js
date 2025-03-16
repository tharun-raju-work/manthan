import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import NotificationBell from '../NotificationBell';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const profileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Fetch search suggestions from the API
  const fetchSuggestions = async (query) => {
    if (!query || query.trim().length < 2) return [];
    
    setIsLoadingSuggestions(true);
    
    try {
      const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      setIsLoadingSuggestions(false);
      return response.data;
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setIsLoadingSuggestions(false);
      return [];
    }
  };

  useEffect(() => {
    // Clear any existing timeout to debounce API calls
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.trim().length > 1) {
      // Set a debounce timeout for API calls to avoid excessive requests
      searchTimeoutRef.current = setTimeout(async () => {
        const suggestions = await fetchSuggestions(searchQuery);
        setSearchSuggestions(suggestions);
        setShowSearchDropdown(true);
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSearchDropdown(searchQuery.trim().length === 0 && isSearchFocused && recentSearches.length > 0);
    }
    
    // Cleanup timeout on component unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, isSearchFocused, recentSearches]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileMenuOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      executeSearch(searchQuery);
    }
  };

  const executeSearch = (query) => {
    // Add to recent searches if not already there
    if (query.trim()) {
      const updatedSearches = [
        { text: query, timestamp: new Date().toISOString() },
        ...recentSearches.filter(item => item.text !== query).slice(0, 4)
      ];
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      // Navigate to search page
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setShowSearchDropdown(false);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      executeSearch(searchQuery);
    }
  };

  const removeRecentSearch = (e, searchText) => {
    e.stopPropagation();
    const updatedSearches = recentSearches.filter(item => item.text !== searchText);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const clearAllRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Close the profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuRef, searchRef]);

  // Handle keyboard navigation in search dropdown
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSearchDropdown(false);
      searchInputRef.current.blur();
    } else {
      handleSearch(e);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">Manthan</Link>
        
        <div className="search-wrapper" ref={searchRef}>
          <div className={`search-container ${isSearchFocused ? 'focused' : ''}`}>
            <i className="fas fa-search search-icon"></i>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search issues, proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsSearchFocused(true);
                setShowSearchDropdown(recentSearches.length > 0 || searchQuery.trim().length > 1);
              }}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn" 
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current.focus();
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
            <button 
              className={`search-button ${searchQuery ? 'active' : ''}`} 
              onClick={handleSearchClick}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          {showSearchDropdown && (
            <div className="search-dropdown">
              {searchQuery.trim().length > 1 ? (
                // Show search suggestions
                <>
                  <div className="search-dropdown-header">
                    <span>Search Suggestions</span>
                  </div>
                  <div className="search-dropdown-content">
                    {searchSuggestions.length > 0 ? (
                      searchSuggestions.map(suggestion => (
                        <div 
                          key={suggestion.id} 
                          className="suggestion-item"
                          onClick={() => executeSearch(suggestion.text)}
                        >
                          {suggestion.type === 'issue' && <i className="fas fa-exclamation-circle suggestion-icon issue"></i>}
                          {suggestion.type === 'topic' && <i className="fas fa-hashtag suggestion-icon topic"></i>}
                          {suggestion.type === 'user' && <i className="fas fa-user suggestion-icon user"></i>}
                          {suggestion.type === 'location' && <i className="fas fa-map-marker-alt suggestion-icon location"></i>}
                          <div className="suggestion-text">{suggestion.text}</div>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">
                        {isLoadingSuggestions ? 'Loading suggestions...' : 'No suggestions found'}
                      </div>
                    )}
                    <div 
                      className="search-item search-all"
                      onClick={() => executeSearch(searchQuery)}
                    >
                      <i className="fas fa-search"></i>
                      <span>Search for "{searchQuery}"</span>
                    </div>
                  </div>
                </>
              ) : (
                // Show recent searches
                <>
                  <div className="search-dropdown-header">
                    <span>Recent Searches</span>
                    {recentSearches.length > 0 && (
                      <button 
                        className="clear-all-btn"
                        onClick={clearAllRecentSearches}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="search-dropdown-content">
                    {recentSearches.length > 0 ? (
                      recentSearches.map((item, index) => (
                        <div 
                          key={index} 
                          className="recent-search-item"
                          onClick={() => executeSearch(item.text)}
                        >
                          <i className="fas fa-history"></i>
                          <span className="recent-search-text">{item.text}</span>
                          <button 
                            className="remove-search-btn"
                            onClick={(e) => removeRecentSearch(e, item.text)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">No recent searches</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            Home
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
            About
          </NavLink>
          {user && (
            <NavLink to="/notifications/test" className={({ isActive }) => isActive ? 'active' : ''}>
              Test Notifications
            </NavLink>
          )}
        </nav>
        
        <div className="header-actions">
          <button className="icon-button">
            <i className="fas fa-bell"></i>
          </button>
          <button className="icon-button">
            <i className="fas fa-envelope"></i>
          </button>
          
          {user ? (
            <>
              <NotificationBell />
              <div className="profile-container" ref={profileMenuRef}>
                <button 
                  className="profile-button" 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`} 
                    alt={user.name || 'User'} 
                    className="profile-avatar"
                  />
                </button>
                
                {isProfileMenuOpen && (
                  <ul className="profile-dropdown">
                    <li>
                      <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)}>
                        <i className="fas fa-user-circle"></i> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" onClick={() => setIsProfileMenuOpen(false)}>
                        <i className="fas fa-cog"></i> Settings
                      </Link>
                    </li>
                    <li>
                      <Link to="/my-posts" onClick={() => setIsProfileMenuOpen(false)}>
                        <i className="fas fa-file-alt"></i> My Posts
                      </Link>
                    </li>
                    <li className="dropdown-divider"></li>
                    <li>
                      <button className="logout-button" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button login">Login</Link>
              <Link to="/register" className="auth-button register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 