// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/roles", require("./routes/roles"));
app.use("/departments", require("./routes/departments"));
app.use("/tasks", require("./routes/tasks"));
app.use("/qa", require("./routes/qa"));
app.use("/metrics", require("./routes/metrics"));

// Root
app.get("/", (req, res) => {
  res.json({ message: "Team Performance Tracker API running..." });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});