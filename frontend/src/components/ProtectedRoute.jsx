import React from 'react';
import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import {
  getStoredUser,
  isAuthenticated,
  logoutUser,
} from '../services/api';

// oxlint-disable-next-line react/only-export-components -- Shared by login and dashboard redirects.
export function getHomeForRole(role) {
  switch (role) {
    case 'user':
      return '/app';
    case 'waste_bank':
      return '/bank';
    case 'organization':
      return '/organization';
    default:
      return '/';
  }
}

export default function ProtectedRoute({
  allowedRoles,
  children,
}) {
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const user = getStoredUser();

  if (!user?.role) {
    logoutUser();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }

  return children || <Outlet />;
}
