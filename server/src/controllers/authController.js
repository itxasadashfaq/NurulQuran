const User = require("../models/User");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email, and password"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists"
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        readingStreak: user.readingStreak,
        memorizedSurahs: user.memorizedSurahs,
        lastRead: user.lastRead,
        bookmarks: user.bookmarks,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      error: "Server registration failed",
      details: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password"
      });
    }

    // Find user with password selected
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        readingStreak: user.readingStreak,
        memorizedSurahs: user.memorizedSurahs,
        lastRead: user.lastRead,
        bookmarks: user.bookmarks,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      error: "Server login failed",
      details: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        readingStreak: user.readingStreak,
        memorizedSurahs: user.memorizedSurahs,
        lastRead: user.lastRead,
        bookmarks: user.bookmarks,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Sync Firebase account into MongoDB (Backward Compatibility)
// @route   POST /api/auth/sync
// @access  Public
exports.syncFirebase = async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: "Missing required fields: uid or email" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { $or: [{ uid }, { email: email.toLowerCase().trim() }] },
      {
        $set: {
          uid,
          email: email.toLowerCase().trim(),
          name: displayName || "Brother/Sister",
          photoURL: photoURL || "",
          lastLoginAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const token = updatedUser.generateAuthToken();

    res.json({
      success: true,
      token,
      user: updatedUser
    });
  } catch (error) {
    console.error("Database synchronization failed:", error);
    res.status(500).json({ error: "Database synchronization failed", details: error.message });
  }
};

// @desc    Serve Firebase client configs (Backward Compatibility)
// @route   GET /api/config
// @access  Public
exports.getConfig = (req, res) => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "mock-api-key-for-build-purposes-only",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "mock-auth-domain-for-build",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "mock-project-id",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "mock-app-id"
  };

  res.json(firebaseConfig);
};
