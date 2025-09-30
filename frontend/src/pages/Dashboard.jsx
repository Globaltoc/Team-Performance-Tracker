// frontend/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import api from "../api/api.js";
import AuthContext from "../auth/AuthProvider.jsx";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalTasks: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [departmentData, setDepartmentData] = useState([]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const [usersRes, tasksRes, metricsRes] = await Promise.all([
        api.get("/users"),
        api.get("/tasks"),
        api.get("/metrics/global"),
      ]);

      setSummary({
        totalUsers: usersRes.data.length,
        totalTasks: tasksRes.data.length,
        pending: metricsRes.data.pending || 0,
        approved: metricsRes.data.approved || 0,
        rejected: metricsRes.data.rejected || 0,
      });

      setDepartmentData(metricsRes.data.departments || []); // expected: [{name:"QA", count:5}, ...]
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
    }
  };

  // Pie chart: Task Status
  const statusData = {
    labels: ["Pending", "Approved", "Rejected"],
    datasets: [
      {
        label: "Task Status",
        data: [summary.pending, summary.approved, summary.rejected],
        backgroundColor: ["#60A5FA", "#34D399", "#F87171"],
        borderWidth: 1,
      },
    ],
  };

  // Bar chart: Tasks per Department
  const departmentChart = {
    labels: departmentData.map((d) => d.name),
    datasets: [
      {
        label: "Tasks",
        data: departmentData.map((d) => d.count),
        backgroundColor: "#3B82F6",
      },
    ],
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.username}</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-3xl mt-2">{summary.totalUsers}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold">Total Tasks</h2>
          <p className="text-3xl mt-2">{summary.totalTasks}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold">Pending Tasks</h2>
          <p className="text-3xl mt-2">{summary.pending}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold">Approved Tasks</h2>
          <p className="text-3xl mt-2">{summary.approved}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold">Rejected Tasks</h2>
          <p className="text-3xl mt-2">{summary.rejected}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Task Status</h2>
          <Pie data={statusData} />
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks per Department</h2>
          <Bar data={departmentChart} />
        </div>
      </div>
    </Layout>
  );
}