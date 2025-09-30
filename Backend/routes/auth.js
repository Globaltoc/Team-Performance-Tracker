const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// -----------------------------
// JWT Middleware
// -----------------------------
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, role, department }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

// -----------------------------
// Login
// -----------------------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.password_hash, u.full_name, u.email,
              r.role_name AS role, d.name AS department
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN departments d ON u.department_id = d.department_id
       WHERE u.username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    delete user.password_hash;

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------
// Change Password
// -----------------------------
router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password_hash = $1 WHERE user_id = $2", [
      hashedPassword,
      req.user.user_id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------
// Get Current User Profile
// -----------------------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.full_name, u.email,
              r.role_name AS role, d.name AS department
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.role_id
       LEFT JOIN departments d ON u.department_id = d.department_id
       WHERE u.user_id = $1`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;