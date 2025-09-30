// frontend/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login"; // ✅ Only this Login is used now
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import MetricsPage from "./pages/MetricsPage";
import QADashboard from "./pages/QADashboard";
import ProtectedRoute from "./ProtectedRoute";

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

        {/* Metrics - Admin only */}
        <Route
          path="/metrics"
          element={
            <ProtectedRoute requiredRole="Admin">
              <MetricsPage />
            </ProtectedRoute>
          }
        />

        {/* QA Dashboard - QA only */}
        <Route
          path="/qa"
          element={
            <ProtectedRoute requiredRole="QA">
              <QADashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all → redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}