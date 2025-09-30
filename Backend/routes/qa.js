const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET tasks pending QA review (QA only)
 */
router.get("/review", authenticateToken, async (req, res) => {
  try {
    if (req.user.department !== "QA") {
      return res.status(403).json({ error: "Access denied. QA only." });
    }

    const result = await pool.query(
      `SELECT t.*, array_agg(u.full_name) AS assigned_staff
       FROM tasks t
       LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
       LEFT JOIN users u ON ta.staff_id = u.user_id
       WHERE t.status = 'Ready for QA'
       GROUP BY t.task_id
       ORDER BY t.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching QA tasks:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST QA review (approve/reject task)
 */
router.post("/review/:taskId", authenticateToken, async (req, res) => {
  try {
    if (req.user.department !== "QA") {
      return res.status(403).json({ error: "Access denied. QA only." });
    }

    const { taskId } = req.params;
    const { status, comments } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be Approved or Rejected" });
    }

    await pool.query(
      `INSERT INTO qa_reviews (task_id, qa_id, status, comments, reviewed_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [taskId, req.user.user_id, status, comments]
    );

    // Update task status
    const newStatus = status === "Approved" ? "Completed" : "Rejected";
    const result = await pool.query(
      `UPDATE tasks SET status=$1 WHERE task_id=$2 RETURNING *`,
      [newStatus, taskId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error submitting QA review:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;