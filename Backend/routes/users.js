// backend/routes/users.js
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users (Admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.username,
              r.role_name AS role, d.name AS department
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN departments d ON u.department_id = d.department_id
       ORDER BY u.user_id ASC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new user (Admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { full_name, email, username, role_id, department_id } = req.body;

    // Default password
    const defaultPassword = "1234567";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, username, password_hash, role_id, department_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, full_name, email, username, role_id, department_id`,
      [full_name, email, username, hashedPassword, role_id, department_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user (Admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;
    const { full_name, email, role_id, department_id } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           role_id = COALESCE($3, role_id),
           department_id = COALESCE($4, department_id)
       WHERE user_id = $5
       RETURNING user_id, full_name, email, username, role_id, department_id`,
      [full_name, email, role_id, department_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user (Admin only, cannot delete themselves)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;

    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({ error: "Admins cannot delete themselves" });
    }

    const result = await pool.query("DELETE FROM users WHERE user_id = $1 RETURNING user_id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;