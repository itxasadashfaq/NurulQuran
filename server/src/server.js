const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { connectDB, getStatus } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { getConfig } = require("./controllers/authController");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (with graceful non-blocking fallback)
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = getStatus();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "NurulQuran MERN Server",
    database: dbStatus.connected ? "connected" : "standalone/offline"
  });
});

// Legacy direct endpoints for backward compatibility
app.get("/api/config", getConfig);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Uncaught Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(`🌙 NurulQuran MERN Server Running on Port: ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth API:    http://localhost:${PORT}/api/auth`);
    console.log(`===========================================`);
  });
}

module.exports = app;
