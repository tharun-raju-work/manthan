import React, { useState } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import './ReportIssueModal.css';

const categories = [
  { id: 'traffic', label: 'Traffic', color: '#FEE2E2', textColor: '#991B1B' },
  { id: 'environment', label: 'Environment', color: '#DCFCE7', textColor: '#166534' },
  { id: 'public-safety', label: 'Public Safety', color: '#FEF3C7', textColor: '#92400E' },
  { id: 'sanitation', label: 'Sanitation', color: '#E0E7FF', textColor: '#3730A3' }
];

const ReportIssueModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await onSubmit(formDataToSend);
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to submit issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Report an Issue</h2>
          <button onClick={onClose} className="close-button">
            <XMarkIcon className="close-icon" />
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title for the issue"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <div className="category-buttons">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`category-button ${formData.category === category.label ? 'selected' : ''}`}
                  style={{
                    '--category-color': category.color,
                    '--category-text-color': category.textColor
                  }}
                  onClick={() => handleChange({ target: { name: 'category', value: category.label } })}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the issue"
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">
              Add Image
              <span className="optional">(optional)</span>
            </label>
            <div className="image-upload-area">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden-input"
              />
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="remove-image"
                  >
                    <XMarkIcon className="remove-icon" />
                  </button>
                </div>
              ) : (
                <label htmlFor="image" className="upload-placeholder">
                  <PhotoIcon className="upload-icon" />
                  <span>Click to upload image</span>
                </label>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={!formData.title || !formData.description || !formData.category || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssueModal; 