// backend/routes/roles.js
const express = require("express");
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Get all roles (Admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      "SELECT role_id, role_name FROM roles ORDER BY role_id ASC"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new role (Admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { role_name } = req.body;

    const result = await pool.query(
      "INSERT INTO roles (role_name) VALUES ($1) RETURNING role_id, role_name",
      [role_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update role (Admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;
    const { role_name } = req.body;

    const result = await pool.query(
      `UPDATE roles
       SET role_name = COALESCE($1, role_name)
       WHERE role_id = $2
       RETURNING role_id, role_name`,
      [role_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete role (Admin only, cannot delete Admin role)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;

    // Prevent deleting the "Admin" role
    const check = await pool.query("SELECT role_name FROM roles WHERE role_id = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Role not found" });
    }
    if (check.rows[0].role_name === "Admin") {
      return res.status(400).json({ error: "Cannot delete Admin role" });
    }

    await pool.query("DELETE FROM roles WHERE role_id = $1", [id]);
    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("Error deleting role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;