import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/dateUtils';
import './UserProfile.css';

const UserProfileCard = ({ 
  profile, 
  onEdit, 
  isEditing, 
  onImageChange, 
  onSubmit, 
  previewImage, 
  loading,
  canEdit 
}) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio || ''
  });

  useEffect(() => {
    setFormData({
      name: profile.name,
      bio: profile.bio || ''
    });
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-container">
            <img 
              src={previewImage || profile.avatar || '/default-avatar.png'} 
              alt={profile.name} 
              className="profile-avatar"
            />
            {isEditing && (
              <div className="avatar-upload">
                <label htmlFor="avatar-input" className="avatar-upload-label">
                  <i className="fas fa-camera"></i>
                  <span className="avatar-upload-text">Change Photo</span>
                </label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        <div className="profile-info">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-input bio-input"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button" disabled={loading}>
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => onEdit(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-header-info">
                <h1 className="profile-name">{profile.name}</h1>
                <p className="profile-email">{profile.email}</p>
                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                {canEdit && (
                  <button 
                    className="edit-profile-button"
                    onClick={() => onEdit(true)}
                  >
                    <i className="fas fa-edit"></i>
                    Edit Profile
                  </button>
                )}
              </div>
              <div className="profile-meta">
                <span className="profile-joined">
                  <i className="fas fa-calendar"></i>
                  Joined {formatDate(profile.createdAt)}
                </span>
                <span className="profile-last-active">
                  <i className="fas fa-clock"></i>
                  Last active {formatDate(profile.lastActive)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

UserProfileCard.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    bio: PropTypes.string,
    avatar: PropTypes.string,
    createdAt: PropTypes.string,
    lastActive: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onImageChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  previewImage: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool
};

export default UserProfileCard; 