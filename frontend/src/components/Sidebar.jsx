// frontend/components/Sidebar.jsx
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "../auth/AuthProvider.jsx";

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  const linkClass =
    "block px-4 py-2 rounded-lg hover:bg-blue-100 transition text-gray-700";

  return (
    <aside className="w-64 bg-white shadow-md p-4 hidden md:block">
      <nav className="space-y-2">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? "bg-blue-500 text-white" : ""}`
          }
        >
          Dashboard
        </NavLink>

        {/* Tasks */}
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? "bg-blue-500 text-white" : ""}`
          }
        >
          Tasks
        </NavLink>

        {/* QA Dashboard - only for QA role */}
        {user?.role === "QA" && (
          <NavLink
            to="/qa"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? "bg-blue-500 text-white" : ""}`
            }
          >
            QA Dashboard
          </NavLink>
        )}

        {/* Metrics - role based */}
        {user?.role === "Admin" ? (
          <NavLink
            to="/metrics"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? "bg-blue-500 text-white" : ""}`
            }
          >
            Metrics (Global)
          </NavLink>
        ) : (
          <NavLink
            to="/metrics"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? "bg-blue-500 text-white" : ""}`
            }
          >
            My Metrics
          </NavLink>
        )}

        {/* Profile (all roles) */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? "bg-blue-500 text-white" : ""}`
          }
        >
          Profile
        </NavLink>
      </nav>
    </aside>
  );
}