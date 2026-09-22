const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route. No token provided."
    });
  }

  // Support mock / guest mode for zero-config testing
  if (token.startsWith("mock-")) {
    req.user = {
      _id: "mock_user_id_12345",
      id: "mock_user_id_12345",
      uid: "mock-uid-guest",
      name: "Guest Companion",
      email: "companion@nurulquran.local",
      readingStreak: 5,
      memorizedSurahs: 12,
      bookmarks: [],
      preferences: { theme: "system", accent: "emerald" }
    };
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || "nurulquran_dev_jwt_secret_key_change_in_production_2026";
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);
    if (!user) {
      // User might be identified by uid if created via firebase sync
      const userByUid = await User.findOne({ uid: decoded.uid || decoded.id });
      if (userByUid) {
        req.user = userByUid;
        return next();
      }
      return res.status(401).json({ success: false, error: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this route. Invalid token."
    });
  }
};

module.exports = { protect };
