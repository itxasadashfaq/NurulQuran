const User = require("../models/User");
const PrayerLog = require("../models/PrayerLog");
const TasbeehLog = require("../models/TasbeehLog");
const ZakatLog = require("../models/ZakatLog");

// @desc    Update user profile & preferences
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, photoURL, readingStreak, memorizedSurahs, lastRead, preferences } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (photoURL !== undefined) updateFields.photoURL = photoURL;
    if (readingStreak !== undefined) updateFields.readingStreak = readingStreak;
    if (memorizedSurahs !== undefined) updateFields.memorizedSurahs = memorizedSurahs;
    if (lastRead !== undefined) updateFields.lastRead = lastRead;
    if (preferences !== undefined) updateFields.preferences = { ...req.user.preferences, ...preferences };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, error: "Failed to update profile", details: error.message });
  }
};

// @desc    Get user companion data (streaks, bookmarks, logs)
// @route   GET /api/user/data/:uid?
// @access  Private / Optional Public with uid param
exports.getUserData = async (req, res) => {
  try {
    const uid = req.params.uid || (req.user && (req.user.uid || req.user._id));

    if (!uid) {
      return res.status(400).json({ error: "Missing required parameter: uid or user token" });
    }

    let user = null;
    if (req.user && (req.user._id || req.user.id)) {
      user = await User.findById(req.user._id || req.user.id);
    }
    if (!user) {
      user = await User.findOne({ $or: [{ uid: uid.toString() }, { _id: uid.toString().match(/^[0-9a-fA-F]{24}$/) ? uid : null }] });
    }

    if (!user) {
      // Return safe defaults for guest or non-existent user
      return res.json({
        success: true,
        data: {
          readingStreak: 5,
          memorizedSurahs: 12,
          bookmarks: [],
          zakatHistory: [],
          tasbeehHistory: [],
          prayerLogs: []
        }
      });
    }

    // Fetch related logs
    const [tasbeehLogs, zakatLogs, prayerLogs] = await Promise.all([
      TasbeehLog.find({ userId: user._id }).sort({ createdAt: -1 }).limit(30),
      ZakatLog.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
      PrayerLog.find({ userId: user._id }).sort({ date: -1 }).limit(30)
    ]);

    res.json({
      success: true,
      data: {
        readingStreak: user.readingStreak,
        memorizedSurahs: user.memorizedSurahs,
        lastRead: user.lastRead,
        bookmarks: user.bookmarks || [],
        preferences: user.preferences,
        zakatHistory: zakatLogs,
        tasbeehHistory: tasbeehLogs,
        prayerLogs: prayerLogs
      }
    });
  } catch (error) {
    console.error("Get User Data Error:", error);
    res.status(500).json({ error: "Failed to retrieve user data", details: error.message });
  }
};

// @desc    Sync user companion state (Backward Compatibility with /api/user/data/sync)
// @route   POST /api/user/data/sync
// @access  Public / Private
exports.syncUserData = async (req, res) => {
  try {
    const { uid, readingStreak, memorizedSurahs, bookmarks, zakatHistory, tasbeehHistory, lastRead } = req.body;
    const targetUid = uid || (req.user && (req.user.uid || req.user._id));

    if (!targetUid) {
      return res.status(400).json({ error: "Missing required identifier: uid" });
    }

    const updateDoc = {};
    if (readingStreak !== undefined) updateDoc.readingStreak = readingStreak;
    if (memorizedSurahs !== undefined) updateDoc.memorizedSurahs = memorizedSurahs;
    if (bookmarks) updateDoc.bookmarks = bookmarks;
    if (lastRead) updateDoc.lastRead = lastRead;

    const updatedUser = await User.findOneAndUpdate(
      { $or: [{ uid: targetUid }, { _id: targetUid.toString().match(/^[0-9a-fA-F]{24}$/) ? targetUid : null }] },
      { $set: updateDoc },
      { upsert: true, new: true }
    );

    // If tasbeehHistory array was passed and has items, upsert them
    if (Array.isArray(tasbeehHistory) && tasbeehHistory.length > 0 && updatedUser) {
      for (const item of tasbeehHistory.slice(0, 10)) {
        if (item.count) {
          await TasbeehLog.create({
            userId: updatedUser._id,
            dhikrTitle: item.title || item.dhikrTitle || "Dhikr",
            count: item.count,
            target: item.target || 33,
            date: item.date || new Date().toISOString().split("T")[0]
          }).catch(() => {});
        }
      }
    }

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Sync User Data Error:", error);
    res.status(500).json({ error: "Failed to sync user data", details: error.message });
  }
};

// @desc    Save daily prayer tracking checklist
// @route   POST /api/user/prayer-log
// @access  Private
exports.savePrayerLog = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { date, prayers } = req.body;

    const targetDate = date || new Date().toISOString().split("T")[0];

    const log = await PrayerLog.findOneAndUpdate(
      { userId, date: targetDate },
      { $set: { prayers } },
      { upsert: true, new: true }
    );

    res.json({ success: true, log });
  } catch (error) {
    console.error("Save Prayer Log Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Save Tasbeeh Dhikr log
// @route   POST /api/user/tasbeeh-log
// @access  Private
exports.saveTasbeehLog = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { dhikrTitle, arabicText, count, target, date } = req.body;

    const log = await TasbeehLog.create({
      userId,
      dhikrTitle: dhikrTitle || "Dhikr Session",
      arabicText: arabicText || "",
      count: count || 33,
      target: target || 33,
      date: date || new Date().toISOString().split("T")[0]
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Save Tasbeeh Log Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Save Zakat calculation
// @route   POST /api/user/zakat-log
// @access  Private
exports.saveZakatLog = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { currency, cash, goldWeightGrams, silverWeightGrams, investments, liabilities, netWealth, basis, nisabThreshold, zakatDue } = req.body;

    const log = await ZakatLog.create({
      userId,
      currency: currency || "USD",
      cash: cash || 0,
      goldWeightGrams: goldWeightGrams || 0,
      silverWeightGrams: silverWeightGrams || 0,
      investments: investments || 0,
      liabilities: liabilities || 0,
      netWealth: netWealth || 0,
      basis: basis || "gold",
      nisabThreshold: nisabThreshold || 0,
      isEligible: zakatDue > 0,
      zakatDue: zakatDue || 0
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    console.error("Save Zakat Log Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle Bookmark for an Ayah
// @route   POST /api/user/bookmark
// @access  Private
exports.toggleBookmark = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { surahNumber, ayahNumber, surahName, arabicText, translationText } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const bookmarkId = `${surahNumber}:${ayahNumber}`;
    const existingIndex = user.bookmarks.findIndex(
      (b) => b.id === bookmarkId || (b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
    );

    let isBookmarked = false;
    if (existingIndex !== -1) {
      // Remove bookmark
      user.bookmarks.splice(existingIndex, 1);
      isBookmarked = false;
    } else {
      // Add bookmark
      user.bookmarks.push({
        id: bookmarkId,
        surahNumber,
        surahName: surahName || `Surah ${surahNumber}`,
        ayahNumber,
        arabicText: arabicText || "",
        translationText: translationText || "",
        timestamp: new Date()
      });
      isBookmarked = true;
    }

    await user.save();

    res.json({
      success: true,
      isBookmarked,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    console.error("Toggle Bookmark Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
