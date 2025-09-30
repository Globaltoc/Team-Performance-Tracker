import React, { useEffect, useState } from "react";
import api from "../api/api.js";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get("/roles");
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/roles", { role_name: name });
      setName("");
      fetchRoles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/roles/${id}`);
      fetchRoles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (role) => {
    setEditId(role.role_id);
    setEditName(role.role_name);
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/roles/${editId}`, { role_name: editName });
      setShowEdit(false);
      setEditId(null);
      setEditName("");
      fetchRoles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="Admin" />
      <div className="flex-1 flex flex-col">
        <Navbar title="Roles" />
        <main className="p-6 space-y-6">
          {/* Create Role */}
          <form className="card p-4" onSubmit={handleCreate}>
            <h2 className="text-lg font-semibold mb-3">Create Role</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Role Name"
              className="w-full border p-2 rounded mb-2"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Create
            </button>
          </form>

          {/* List Roles */}
          <div className="card overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-sm text-gray-600">
                  <th className="py-2">Role Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr key={r.role_id} className="border-t">
                    <td className="py-2">{r.role_name}</td>
                    <td className="space-x-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="px-2 py-1 bg-blue-100 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.role_id)}
                        className="px-2 py-1 bg-red-100 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Modal */}
          {showEdit && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-lg font-semibold mb-4">Edit Role</h2>
                <form onSubmit={handleUpdate}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border p-2 rounded mb-3"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowEdit(false)}
                      className="px-4 py-2 bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}