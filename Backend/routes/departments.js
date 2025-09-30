// backend/routes/departments.js
const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Get all departments (Admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      "SELECT department_id, department_name FROM departments ORDER BY department_id ASC"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new department (Admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { department_name } = req.body;

    const result = await pool.query(
      `INSERT INTO departments (department_name)
       VALUES ($1)
       RETURNING department_id, department_name`,
      [department_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update department (Admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;
    const { department_name } = req.body;

    const result = await pool.query(
      `UPDATE departments
       SET department_name = COALESCE($1, department_name)
       WHERE department_id = $2
       RETURNING department_id, department_name`,
      [department_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete department (Admin only, cannot delete QA department)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;

    // Prevent deleting QA department
    const check = await pool.query("SELECT department_name FROM departments WHERE department_id = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Department not found" });
    }
    if (check.rows[0].department_name === "QA") {
      return res.status(400).json({ error: "Cannot delete QA department" });
    }

    await pool.query("DELETE FROM departments WHERE department_id = $1", [id]);
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;