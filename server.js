const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the frontend (e.g. running on Live Server port 5500) can communicate with it
app.use(cors());
app.use(express.json());

// 1. MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is not defined in your environmental variables. MongoDB connection will fail.");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));
}

// 2. Mongoose User Schema
const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    displayName: { type: String, default: "" },
    photoURL: { type: String, default: "" },
    lastLoginAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// 3. API Routes

// API to serve public Firebase configuration credentials to the frontend app
app.get("/api/config", (req, res) => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID
  };

  // If apiKey is undefined, warn the user
  if (!firebaseConfig.apiKey) {
    return res.status(500).json({ error: "Firebase configurations are missing on server .env file." });
  }

  res.json(firebaseConfig);
});

// API to sync firebase user authentication data to MongoDB
app.post("/api/auth/sync", async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: "Missing required fields: uid or email" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "MongoDB connection is currently offline." });
    }

    const updatedUser = await User.findOneAndUpdate(
      { uid },
      {
        email,
        displayName,
        photoURL,
        lastLoginAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Database synchronization failed:", error);
    res.status(500).json({ error: "Database synchronization failed", details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`NurulQuran Server is running on port: ${PORT}`);
  console.log(`Serve Firebase configs at: http://localhost:${PORT}/api/config`);
});
