import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../services/api';
import ProtectedRoute, { getHomeForRole } from './ProtectedRoute';

export default function RoleHomeRedirect() {
  const user = getStoredUser();

  return (
    <ProtectedRoute>
      <Navigate to={getHomeForRole(user?.role)} replace />
    </ProtectedRoute>
  );
}
