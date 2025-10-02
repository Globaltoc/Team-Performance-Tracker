// frontend/components/Sidebar.jsx
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  Shield,
  Building,
  ClipboardList,
  BarChart3,   // <-- new icon for Metrics
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import AuthContext from "../auth/AuthProvider";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div className="w-64 bg-sky-600 text-white h-screen flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-6">Team Tracker</h2>

      {/* Dashboard always visible */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 p-2 hover:bg-sky-500 rounded"
      >
        <LayoutDashboard size={18} />
        Dashboard
      </Link>

      {/* Tasks */}
      <Link
        to="/tasks"
        className="flex items-center gap-2 p-2 hover:bg-sky-500 rounded"
      >
        <ClipboardList size={18} />
        My Tasks
      </Link>

      {/* Metrics */}
      <Link
        to="/metrics"
        className="flex items-center gap-2 p-2 hover:bg-sky-500 rounded"
      >
        <BarChart3 size={18} />
        Metrics
      </Link>

      {/* Profile */}
      <Link
        to="/profile"
        className="flex items-center gap-2 p-2 hover:bg-sky-500 rounded"
      >
        <User size={18} />
        Profile
      </Link>

      {/* Admin-only sections */}
      {user?.role === "Admin" && (
        <div className="mt-4">
          {/* User Management */}
          <div>
            <button
              onClick={() => toggleMenu("users")}
              className="flex items-center justify-between w-full p-2 hover:bg-sky-500 rounded"
            >
              <span className="flex items-center gap-2">
                <Users size={18} />
                User Management
              </span>
              {openMenus["users"] ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
            {openMenus["users"] && (
              <div className="ml-6 mt-1 flex flex-col gap-1">
                <Link to="/admin/users/create" className="hover:underline">
                  Create User
                </Link>
                <Link to="/admin/users/edit" className="hover:underline">
                  Edit User
                </Link>
                <Link to="/admin/users/delete" className="hover:underline">
                  Delete User
                </Link>
              </div>
            )}
          </div>

          {/* Role Management */}
          <div>
            <button
              onClick={() => toggleMenu("roles")}
              className="flex items-center justify-between w-full p-2 hover:bg-sky-500 rounded"
            >
              <span className="flex items-center gap-2">
                <Shield size={18} />
                Role Management
              </span>
              {openMenus["roles"] ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
            {openMenus["roles"] && (
              <div className="ml-6 mt-1 flex flex-col gap-1">
                <Link to="/admin/roles/create" className="hover:underline">
                  Create Role
                </Link>
                <Link to="/admin/roles/edit" className="hover:underline">
                  Edit Role
                </Link>
                <Link to="/admin/roles/assign" className="hover:underline">
                  Assign User Role
                </Link>
              </div>
            )}
          </div>

          {/* Department Management */}
          <div>
            <button
              onClick={() => toggleMenu("departments")}
              className="flex items-center justify-between w-full p-2 hover:bg-sky-500 rounded"
            >
              <span className="flex items-center gap-2">
                <Building size={18} />
                Department Management
              </span>
              {openMenus["departments"] ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
            {openMenus["departments"] && (
              <div className="ml-6 mt-1 flex flex-col gap-1">
                <Link to="/admin/departments/create" className="hover:underline">
                  Create Department
                </Link>
                <Link to="/admin/departments/edit" className="hover:underline">
                  Edit Department
                </Link>
                <Link to="/admin/departments/delete" className="hover:underline">
                  Delete Department
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}