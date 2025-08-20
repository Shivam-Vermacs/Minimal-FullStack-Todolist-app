const path = require("path");
const express = require("express");
const cors = require("cors");

const { loadEnv } = require("./config/env");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const errorHandler = require("./middleware/errorHandler");

loadEnv();
connectDB();

const app = express();

// JSON parsing
app.use(express.json());

// CORS (same-origin; harmless to enable during dev)
app.use(cors());

// Static files (serve frontend)
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// Central error handler
app.use(errorHandler);

// Fallback to index.html (for direct navigation)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
