import React, { useState, useEffect, useContext } from "react";
import Layout from "../components/Layout";
import api from "../api/api.js";
import AuthContext from "../auth/AuthProvider.jsx";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(user); // local copy
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // 🔹 Fetch fresh profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfile();
  }, []);

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
      setMessage("Password updated successfully. Please login again.");
      logout();
    } catch (err) {
      setMessage("Error updating password. Check your current password.");
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-white shadow rounded-xl p-6 max-w-lg">
        <p className="mb-4">
          <strong>Username:</strong> {profile?.username}
        </p>
        <p className="mb-6">
          <strong>Role:</strong> {profile?.role}
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
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