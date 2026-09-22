const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nurulquran";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at "${uri}". Running in standalone mode with graceful fallback.`);
    console.warn(`Error message: ${error.message}`);
  }

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("[MongoDB] Connection lost.");
  });

  mongoose.connection.on("reconnected", () => {
    isConnected = true;
    console.log("[MongoDB] Reconnected to database.");
  });
};

const getStatus = () => ({
  connected: isConnected && mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState
});

module.exports = { connectDB, getStatus };
