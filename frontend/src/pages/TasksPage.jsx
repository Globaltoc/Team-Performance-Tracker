// frontend/pages/TasksPage.jsx
import React, { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import TaskTable from "../components/TaskTable";
import api from "../api/api.js";
import AuthContext from "../auth/AuthProvider.jsx";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function TasksPage() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: "",
    assigned_to: [],
    type: "", // ✅ added type
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // --- Handlers ---
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleApprove = async (taskId) => {
    try {
      await api.post(`/qa/review`, { task_id: taskId, status: "approved" });
      fetchTasks();
    } catch (err) {
      console.error("Error approving task:", err);
    }
  };

  const handleReject = async (taskId) => {
    try {
      await api.post(`/qa/review`, { task_id: taskId, status: "rejected" });
      fetchTasks();
    } catch (err) {
      console.error("Error rejecting task:", err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleCreateTask = async () => {
    try {
      await api.post("/tasks", {
        title: form.title,
        description: form.description,
        due_date: form.due_date,
        assigned_to: form.assigned_to,
        type: form.type, // ✅ send type
      });
      setShowCreateModal(false);
      setForm({ title: "", description: "", due_date: "", assigned_to: [], type: "" });
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleEditTask = async () => {
    try {
      await api.put(`/tasks/${showEditModal.task_id}`, {
        title: form.title || showEditModal.title,
        description: form.description || showEditModal.description,
        due_date: form.due_date || showEditModal.due_date,
        type: form.type || showEditModal.type, // ✅ allow type update
      });
      setShowEditModal(null);
      setForm({ title: "", description: "", due_date: "", assigned_to: [], type: "" });
      fetchTasks();
    } catch (err) {
      console.error("Error editing task:", err);
    }
  };

  const handleReassignTask = async () => {
    try {
      await api.put(`/tasks/${showReassignModal.task_id}`, {
        assigned_to: form.assigned_to,
      });
      setShowReassignModal(null);
      setForm({ title: "", description: "", due_date: "", assigned_to: [], type: "" });
      fetchTasks();
    } catch (err) {
      console.error("Error reassigning task:", err);
    }
  };

  // --- Chart data ---
  const statusCounts = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    },
    {}
  );

  const barData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Tasks by Status",
        data: Object.values(statusCounts),
        backgroundColor: "#3B82F6",
      },
    ],
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>

      {/* Chart */}
      <div className="bg-white shadow rounded-xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
        <Bar data={barData} />
      </div>

      {/* Admin: Create Task Button */}
      {user?.role?.toLowerCase() === "admin" && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Create Task
        </button>
      )}

      {/* Task Table */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Task List</h2>
        <TaskTable
          tasks={tasks}
          role={user?.role?.toLowerCase()}
          department={user?.department?.toLowerCase()}
          onUpdateStatus={
            user?.role?.toLowerCase() === "staff" ? handleUpdateStatus : null
          }
          onApprove={user?.role?.toLowerCase() === "qa" ? handleApprove : null}
          onReject={user?.role?.toLowerCase() === "qa" ? handleReject : null}
          onDelete={user?.role?.toLowerCase() === "admin" ? handleDelete : null}
          onEdit={user?.role?.toLowerCase() === "admin" ? setShowEditModal : null}
          onReassign={
            user?.role?.toLowerCase() === "admin" ? setShowReassignModal : null
          }
        />
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow w-1/3">
            <h2 className="text-lg font-semibold mb-4">Create Task</h2>
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border p-2 mb-3"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border p-2 mb-3"
            />
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full border p-2 mb-3"
            />

            {/* Task Type */}
            <label className="block mb-2">Task Type:</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border p-2 mb-3"
              required
            >
              <option value="">-- Select Type --</option>
              <option value="group">group</option>
              <option value="individual">individual</option>
            </select>

            <label className="block mb-2">Assign To:</label>
            <select
              multiple
              value={form.assigned_to}
              onChange={(e) =>
                setForm({
                  ...form,
                  assigned_to: Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value
                  ),
                })
              }
              className="w-full border p-2 mb-3"
            >
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.full_name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow w-1/3">
            <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
            <input
              type="text"
              placeholder="Title"
              value={form.title || showEditModal.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border p-2 mb-3"
            />
            <textarea
              placeholder="Description"
              value={form.description || showEditModal.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border p-2 mb-3"
            />
            <input
              type="date"
              value={form.due_date || showEditModal.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full border p-2 mb-3"
            />

            {/* Task Type */}
            <label className="block mb-2">Task Type:</label>
            <select
              value={form.type || showEditModal.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border p-2 mb-3"
            >
              <option value="group">group</option>
              <option value="individual">individual</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTask}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Task Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow w-1/3">
            <h2 className="text-lg font-semibold mb-4">Reassign Task</h2>
            <label className="block mb-2">Assign To:</label>
            <select
              multiple
              value={form.assigned_to}
              onChange={(e) =>
                setForm({
                  ...form,
                  assigned_to: Array.from(
                    e.target.selectedOptions,
                    (opt) => opt.value
                  ),
                })
              }
              className="w-full border p-2 mb-3"
            >
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.full_name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReassignModal(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignTask}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}