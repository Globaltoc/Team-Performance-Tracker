// frontend/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "./auth/AuthProvider.jsx";

export default function ProtectedRoute({ children, requiredRole, requiredDepartment }) {
  const { user, token } = useContext(AuthContext);

  // Not logged in → redirect
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based restriction
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Department-based restriction
  if (requiredDepartment && user.department !== requiredDepartment) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}