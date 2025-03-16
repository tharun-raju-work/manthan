import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPosts, createPost, getTopContributors } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ReportIssueModal from '../../components/ReportIssueModal';
import './Home.css';
import PostList from '../../components/PostList';
import TopContributors from '../../components/TopContributors';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';


const Home = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { refetch: refetchPosts } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    onError: (error) => {
      console.error('Failed to fetch posts:', error);
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [postsData, contributorsData] = await Promise.all([
          fetchPosts(),
          getTopContributors()
        ]);
        console.log(postsData);
        setPosts(postsData);
        setContributors(contributorsData);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreatePost = async (formData) => {
    try {
      await createPost(formData);
      await refetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const trendingTopics = [
    { id: 1, title: 'Road Safety' },
    { id: 2, title: 'Park Maintenance' },
    { id: 3, title: 'Public Transport' },
    { id: 4, title: 'Waste Management' },
    { id: 5, title: 'Street Lighting' }
  ];

  const sidebarLinks = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1L1 6V15H6V9H10V15H15V6L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: 'Home',
      href: '/'
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2H7V7H2V2ZM9 2H14V7H9V2ZM2 9H7V14H2V9ZM9 9H14V14H9V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: 'My Feed',
      href: '/feed'
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <ErrorMessage 
          message={error || 'Failed to load posts'} 
          onRetry={refetchPosts}
        />
      </div>
    );
  }

  return (
    <>
      <div className="app-layout">
        <aside className="left-sidebar">
          <div className="sidebar-section">
            {sidebarLinks.map((link, index) => (
              <a key={index} href={link.href} className="sidebar-link">
                {link.icon}
                {link.label}
              </a>
            ))}
          </div>

          <div className="categories-section">
            <h3>Categories</h3>
            <div className="category-list">
              <a href="/category/traffic" className="category-item traffic">Traffic</a>
              <a href="/category/environment" className="category-item environment">Environment</a>
              <a href="/category/public-safety" className="category-item public-safety">Public Safety</a>
              <a href="/category/sanitation" className="category-item sanitation">Sanitation</a>
            </div>
          </div>

          {user ? (
            <button 
              className="report-issue-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Report an Issue
            </button>
          ) : (
            <Link to="/login" className="report-issue-btn login-required">
              Login to Report an Issue
            </Link>
          )}
        </aside>

        <main className="main-content">
          <div className="content-header">
            <div className="tab-navigation">
              <button className="tab-button active">Top</button>
              <button className="tab-button">New</button>
              <button className="tab-button">Trending</button>
            </div>
          </div>

          {!user && (
            <div className="guest-banner">
              <div className="guest-banner-content">
                <h2>Join the community to get more features</h2>
                <p>Create an account to report issues, vote, comment, and track your contributions.</p>
                <div className="guest-banner-buttons">
                  <Link to="/login" className="banner-btn login">Log In</Link>
                  <Link to="/register" className="banner-btn register">Sign Up</Link>
                </div>
              </div>
            </div>
          )}

          <div className="issues-list">
            <PostList posts={posts} />
          </div>
        </main>

        <aside className="right-sidebar">
          <div className="stats-card">
            <h3 className="stats-title">Community Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">234</div>
                <div className="stat-label">Active Issues</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">1.2k</div>
                <div className="stat-label">Resolved</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">5.6k</div>
                <div className="stat-label">Members</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">892</div>
                <div className="stat-label">Contributors</div>
              </div>
            </div>
          </div>

          <div className="contributors-card">
            <h3 className="contributors-title">Top Contributors</h3>
            <div className="contributors-list">
              <TopContributors contributors={contributors} />
            </div>
          </div>

          <div className="trending-card">
            <h3 className="trending-title">Trending Topics</h3>
            <div className="trending-list">
              {trendingTopics.map(topic => (
                <a key={topic.id} href={`/topics/${topic.id}`} className="trending-item">
                  <svg className="trending-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
                  </svg>
                  <span>{topic.title}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <ReportIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </>
  );
};

export default Home; 