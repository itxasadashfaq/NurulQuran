const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getUserData,
  syncUserData,
  savePrayerLog,
  saveTasbeehLog,
  saveZakatLog,
  toggleBookmark
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.put("/profile", protect, updateProfile);
router.get("/data/:uid?", getUserData);
router.post("/data/sync", syncUserData);
router.post("/prayer-log", protect, savePrayerLog);
router.post("/tasbeeh-log", protect, saveTasbeehLog);
router.post("/zakat-log", protect, saveZakatLog);
router.post("/bookmark", protect, toggleBookmark);

module.exports = router;
