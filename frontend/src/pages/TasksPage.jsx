// frontend/pages/TasksPage.jsx
import React, { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
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

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Count tasks by status
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

      {/* Task Table */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Task List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border">Title</th>
                <th className="p-3 border">Description</th>
                <th className="p-3 border">Assigned By</th>
                <th className="p-3 border">Due Date</th>
                <th className="p-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.task_id} className="hover:bg-gray-50">
                  <td className="p-3 border">{task.title}</td>
                  <td className="p-3 border">{task.description}</td>
                  <td className="p-3 border">{task.assigned_by}</td>
                  <td className="p-3 border">
                    {new Date(task.due_date).toLocaleDateString()}
                  </td>
                  <td className="p-3 border">{task.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}