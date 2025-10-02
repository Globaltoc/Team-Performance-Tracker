// frontend/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import MetricsPage from "./pages/MetricsPage";
import QADashboard from "./pages/QADashboard";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./ProtectedRoute";

// 🔹 Admin management pages (Users, Roles, Departments)
import CreateUser from "./pages/admin/CreateUser";
import EditUser from "./pages/admin/EditUser";
import DeleteUser from "./pages/admin/DeleteUser";

import CreateRole from "./pages/admin/CreateRole";
import EditRole from "./pages/admin/EditRole";
import AssignUserRole from "./pages/admin/AssignUserRole";

import CreateDepartment from "./pages/admin/CreateDepartment";
import EditDepartment from "./pages/admin/EditDepartment";
import DeleteDepartment from "./pages/admin/DeleteDepartment";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/metrics"
          element={
            <ProtectedRoute requiredRole="Admin">
              <MetricsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/qa"
          element={
            <ProtectedRoute requiredRole="QA">
              <QADashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 🔹 Admin-only Routes */}
        <Route
          path="/admin/users/create"
          element={
            <ProtectedRoute requiredRole="Admin">
              <CreateUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/edit"
          element={
            <ProtectedRoute requiredRole="Admin">
              <EditUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/delete"
          element={
            <ProtectedRoute requiredRole="Admin">
              <DeleteUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/roles/create"
          element={
            <ProtectedRoute requiredRole="Admin">
              <CreateRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/edit"
          element={
            <ProtectedRoute requiredRole="Admin">
              <EditRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles/assign"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AssignUserRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/departments/create"
          element={
            <ProtectedRoute requiredRole="Admin">
              <CreateDepartment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments/edit"
          element={
            <ProtectedRoute requiredRole="Admin">
              <EditDepartment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments/delete"
          element={
            <ProtectedRoute requiredRole="Admin">
              <DeleteDepartment />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch-all → redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}