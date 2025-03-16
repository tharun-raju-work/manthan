import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/api';
import UserProfileCard from './UserProfileCard';
import UserStatsCard from './UserStatsCard';
import './UserProfile.css';

const UserProfile = ({ username }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: null,
    createdAt: null,
    lastActive: null
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalVotes: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserProfile(username);
      setProfile({
        name: data.name,
        email: data.email,
        bio: data.bio || '',
        avatar: data.avatar,
        createdAt: data.createdAt,
        lastActive: data.lastActive
      });
      setStats(data.stats);
    } catch (err) {
      if (err.includes('not found')) {
        setError('User not found');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError('Failed to load profile');
      }
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setProfile(prev => ({ ...prev, avatar: file }));
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      if (profile.avatar instanceof File) {
        data.append('avatar', profile.avatar);
      }

      await updateUserProfile(data);
      setIsEditing(false);
      await fetchUserProfile();
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (error === 'User not found') {
    return (
      <div className="user-profile-error">
        <h2>User Not Found</h2>
        <p>The user you're looking for doesn't exist.</p>
        <p>Redirecting to home page...</p>
      </div>
    );
  }

  const isOwnProfile = user && user.username === username;

  return (
    <div className="user-profile-container">
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      <UserProfileCard
        profile={profile}
        onEdit={() => setIsEditing(true)}
        isEditing={isEditing && isOwnProfile}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        previewImage={previewImage}
        loading={loading}
        canEdit={isOwnProfile}
      />

      <UserStatsCard stats={stats} />
    </div>
  );
};

export default UserProfile; 