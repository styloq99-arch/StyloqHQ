import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/signin"
}) {
  const { user, loading, isAuthenticated, getRoleRedirect, needsRoleSelection } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  // OAuth user who hasn't picked a role yet
  if (needsRoleSelection) {
    return <Navigate to="/select-role" replace />;
  }

  // Not authenticated - redirect to signin
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to correct dashboard based on role
    const correctPath = getRoleRedirect(user?.role);
    return <Navigate to={correctPath} replace />;
  }

  return children;
}
