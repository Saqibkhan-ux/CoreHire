import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  // 1. While the AuthContext is checking for a session, show a loading indicator.
  //    This prevents a flicker from the "unauthenticated" state to the "authenticated" state.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#050508', color: '#00ffcc', fontFamily: 'monospace' }}>
        INITIALIZING SECURE SESSION...
      </div>
    );
  }

  // 2. If the user is not authenticated (no token), redirect them to the login page.
  //    We also pass the original location they were trying to visit, so we can redirect back after login.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If the route requires a specific role and the user's role doesn't match, redirect them.
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect unauthorized roles to the homepage.
  }

  // 4. If all checks pass, render the child components via the <Outlet />.
  return <Outlet />;
};

export default ProtectedRoute;