import React, { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { initializeApi } from './services/api';

function AppContent({ children }) {
  const auth = useAuth();

  useEffect(() => {
    initializeApi(auth);
  }, [auth]);

  if (auth.loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return children;
}

export default AppContent; 