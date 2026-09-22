const express = require("express");
const router = express.Router();
const { register, login, getMe, syncFirebase, getConfig } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/sync", syncFirebase); // Backward compatibility for /api/auth/sync
router.get("/config", getConfig);   // Backward compatibility for /api/config

module.exports = router;
