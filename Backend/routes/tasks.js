const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET all tasks (Admin sees all, Staff sees only their tasks, QA sees all pending for QA)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query;
    let params = [];

    if (req.user.role === "Admin") {
      query = `
        SELECT t.*, array_agg(u.full_name) AS assigned_staff
        FROM tasks t
        LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
        LEFT JOIN users u ON ta.staff_id = u.user_id
        GROUP BY t.task_id
        ORDER BY t.created_at DESC`;
    } else if (req.user.role === "Staff") {
      query = `
        SELECT t.*, array_agg(u.full_name) AS assigned_staff
        FROM tasks t
        JOIN task_assignments ta ON t.task_id = ta.task_id
        JOIN users u ON ta.staff_id = u.user_id
        WHERE ta.staff_id = $1
        GROUP BY t.task_id
        ORDER BY t.created_at DESC`;
      params = [req.user.user_id];
    } else if (req.user.department === "QA") {
      query = `
        SELECT t.*, array_agg(u.full_name) AS assigned_staff
        FROM tasks t
        LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
        LEFT JOIN users u ON ta.staff_id = u.user_id
        WHERE t.status = 'Ready for QA'
        GROUP BY t.task_id
        ORDER BY t.created_at DESC`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * CREATE a task (Admin only)
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { title, description, type, due_date, staff_ids } = req.body;

    const taskResult = await pool.query(
      `INSERT INTO tasks (title, description, type, assigned_by, due_date, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'Pending', NOW())
       RETURNING *`,
      [title, description, type, req.user.user_id, due_date]
    );

    const task = taskResult.rows[0];

    if (staff_ids && staff_ids.length > 0) {
      for (const staffId of staff_ids) {
        await pool.query(
          `INSERT INTO task_assignments (task_id, staff_id, assigned_at)
           VALUES ($1, $2, NOW())`,
          [task.task_id, staffId]
        );
      }
    }

    res.status(201).json(task);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * UPDATE task status (Staff can mark In Progress, move to Ready for QA)
 */
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Staff can only update their assigned tasks
    if (req.user.role === "Staff") {
      const check = await pool.query(
        `SELECT * FROM task_assignments WHERE task_id=$1 AND staff_id=$2`,
        [id, req.user.user_id]
      );
      if (check.rows.length === 0) {
        return res.status(403).json({ error: "You are not assigned to this task" });
      }
    }

    const result = await pool.query(
      `UPDATE tasks SET status=$1 WHERE task_id=$2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE task (Admin only)
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;
    await pool.query("DELETE FROM task_assignments WHERE task_id=$1", [id]);
    const result = await pool.query("DELETE FROM tasks WHERE task_id=$1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;