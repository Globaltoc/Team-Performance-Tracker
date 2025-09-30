// frontend/pages/QADashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import api from "../api/api.js";
import TaskTable from "../components/TaskTable";
import AuthContext from "../auth/AuthProvider.jsx";

export default function QADashboard() {
  const { user } = useContext(AuthContext);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get("/qa/pending");
      setPendingTasks(res.data);
    } catch (err) {
      console.error("Error fetching QA queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (taskId, status) => {
    try {
      await api.post(`/qa/review/${taskId}`, { status });
      setPendingTasks((prev) => prev.filter((t) => t.task_id !== taskId));
    } catch (err) {
      console.error("Error reviewing task:", err);
    }
  };

  // Restrict page to QA department only
  if (user?.department !== "QA") {
    return (
      <Layout>
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          This page is only available to the QA department.
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 text-sky-600">QA Review Queue</h1>

      {loading ? (
        <p>Loading tasks...</p>
      ) : pendingTasks.length === 0 ? (
        <p className="text-gray-500">No tasks awaiting review.</p>
      ) : (
        <div className="bg-white shadow rounded-xl p-6">
          {/* Task list with review buttons */}
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div
                key={task.task_id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-500">
                    Assigned to: {task.assigned_to_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(task.task_id, "approved")}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(task.task_id, "rejected")}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}