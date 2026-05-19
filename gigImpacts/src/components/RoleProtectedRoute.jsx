import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getDashboardPath } from '../utils/auth.js';
import RouteFallback from './RouteFallback.jsx';
// import PageLoader from './PageLoader.jsx';

const RoleProtectedRoute = ({ children, user, isLoading = false, allowedRoles = [] }) => {
  const location = useLocation();

  // Show shared route fallback while auth state is resolving
  if (isLoading) {
    return <RouteFallback />;
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
