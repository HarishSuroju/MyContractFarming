import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginPrompt from './LoginPrompt';
import { getAuthValue, getToken } from '../utils/authStorage';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = getToken();
  const userRole = getAuthValue('userRole');

  // If no token, show login prompt
  if (!token) {
    return <LoginPrompt />;
  }

  // If specific role required and user doesn't have it, redirect to unauthorized
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
