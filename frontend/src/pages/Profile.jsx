// frontend/pages/Profile.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/api.js";
import AuthContext from "../auth/AuthProvider.jsx";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  // 🔹 Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔹 Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setMessage("Password updated successfully. Redirecting to login...");
      logout();
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("Error updating password. Check your current password.");
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-white shadow rounded-xl p-6 max-w-lg space-y-8">
        {/* 🔹 Show profile info */}
        <div className="border-b pb-4">
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Department:</strong> {user?.department}</p>
        </div>

        {/* 🔹 Change Password */}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h2 className="text-xl font-semibold">Change Password</h2>

          <div>
            <label className="block text-sm font-medium">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Update Password
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        )}
      </div>
    </Layout>
  );
}