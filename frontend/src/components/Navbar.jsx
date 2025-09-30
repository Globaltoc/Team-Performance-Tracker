// frontend/components/Navbar.jsx
import React, { useContext } from "react";
import AuthContext from "../auth/AuthProvider.jsx";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow flex justify-between items-center px-6 py-3">
      <h1 className="text-xl font-semibold text-gray-800">Team Task Tracker</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">Hello, {user?.username}</span>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}