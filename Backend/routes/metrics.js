// backend/routes/metrics.js
const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET /metrics/global
 * Admin only → Returns overall efficiency, on-time rate, and staff breakdown
 */
router.get("/global", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Staff efficiency (average score)
    const staffEfficiency = await pool.query(
      `SELECT u.user_id, u.full_name AS name,
              COALESCE(AVG(m.efficiency_score), 0)::NUMERIC(5,2) AS efficiency_score
       FROM users u
       LEFT JOIN metrics_log m ON u.user_id = m.user_id
       GROUP BY u.user_id, u.full_name
       ORDER BY u.user_id ASC`
    );

    // On-time rate (percentage of tasks completed before deadline)
    const onTime = await pool.query(
      `SELECT COALESCE(100.0 * SUM(CASE WHEN m.on_time THEN 1 ELSE 0 END) / NULLIF(COUNT(*),0),0) AS on_time_rate
       FROM metrics_log m`
    );

    res.json({
      staff: staffEfficiency.rows,
      onTimeRate: parseFloat(onTime.rows[0].on_time_rate),
    });
  } catch (err) {
    console.error("Error fetching global metrics:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /metrics/:userId
 * Staff/QA → Returns personal task summary + counts
 */
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) !== req.user.user_id && req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Count tasks by status for this user
    const tasks = await pool.query(
      `SELECT t.status, COUNT(*) AS count
       FROM task_assignments ta
       JOIN tasks t ON ta.task_id = t.task_id
       WHERE ta.staff_id = $1
       GROUP BY t.status`,
      [userId]
    );

    let total = 0,
      pending = 0,
      approved = 0,
      rejected = 0;

    tasks.rows.forEach((row) => {
      total += parseInt(row.count);
      if (row.status === "Pending" || row.status === "In Progress") pending += parseInt(row.count);
      if (row.status === "Approved" || row.status === "Completed") approved += parseInt(row.count);
      if (row.status === "Rejected") rejected += parseInt(row.count);
    });

    res.json({ total, pending, approved, rejected });
  } catch (err) {
    console.error("Error fetching user metrics:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;