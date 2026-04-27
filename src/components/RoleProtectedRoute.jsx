import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getDashboardPath } from '../utils/auth.js';

const shellStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: '2rem',
  background: '#f4f7ff',
  color: '#0b1d66',
  fontWeight: 600
};

const RoleProtectedRoute = ({ children, user, isLoading = false, allowedRoles = [] }) => {
  const location = useLocation();

  if (isLoading) {
    return <div style={shellStyle}>Loading your workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
