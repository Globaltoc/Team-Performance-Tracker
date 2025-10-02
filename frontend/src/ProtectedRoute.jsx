import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "./auth/AuthProvider.jsx";

export default function ProtectedRoute({ children, requiredRole, requiredDepartment }) {
  const { user, token } = useContext(AuthContext);

  // Not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize values for safe comparison
  const userRole = user.role?.toLowerCase();
  const userDept = user.department?.toLowerCase();

  // Role-based restriction
  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Department-based restriction
  if (requiredDepartment && userDept !== requiredDepartment.toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}