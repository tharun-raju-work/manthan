import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message }) => {
  return (
    <div className="error-container">
      <div className="error-content">
        <h2>Error</h2>
        <p>{message || 'An unexpected error occurred.'}</p>
      </div>
    </div>
  );
};

export default ErrorMessage; 