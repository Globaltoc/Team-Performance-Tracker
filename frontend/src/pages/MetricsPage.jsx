// frontend/pages/MetricsPage.jsx
import React, { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import api from "../api/api.js";
import AuthContext from "../auth/AuthProvider.jsx";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function MetricsPage() {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState({
    efficiency: [],
    onTimeRate: 0,
    completion: [],
    staff: [],
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      if (user?.role === "Admin") {
        const res = await api.get("/metrics/global");
        setMetrics(res.data);
      } else {
        const res = await api.get(`/metrics/${user.user_id}`);
        setMetrics(res.data);
      }
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  };

  // Line chart: Efficiency trend (Admin only)
  const efficiencyData = {
    labels: metrics.staff.map((s) => s.name),
    datasets: [
      {
        label: "Efficiency",
        data: metrics.staff.map((s) => s.efficiency_score),
        borderColor: "#3B82F6",
        backgroundColor: "#93C5FD",
        fill: true,
      },
    ],
  };

  // Pie chart: On-time rate (Admin only)
  const onTimeData = {
    labels: ["On Time", "Late"],
    datasets: [
      {
        label: "On-Time Rate",
        data: [metrics.onTimeRate || 0, 100 - (metrics.onTimeRate || 0)],
        backgroundColor: ["#34D399", "#F87171"],
      },
    ],
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Performance Metrics</h1>

      {user?.role === "Admin" ? (
        // Admin View: Charts
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Efficiency by Staff</h2>
            <Line data={efficiencyData} />
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">On-Time Rate</h2>
            <Pie data={onTimeData} />
          </div>
        </div>
      ) : (
        // Staff/QA View: Summary Cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold">Total Tasks</h2>
            <p className="text-3xl mt-2">{metrics.total}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold">Pending</h2>
            <p className="text-3xl mt-2">{metrics.pending}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold">Approved</h2>
            <p className="text-3xl mt-2">{metrics.approved}</p>
          </div>

          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold">Rejected</h2>
            <p className="text-3xl mt-2">{metrics.rejected}</p>
          </div>
        </div>
      )}
    </Layout>
  );
}