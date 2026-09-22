const mongoose = require("mongoose");

const PrayerLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
      index: true
    },
    prayers: {
      fajr: { type: Boolean, default: false },
      dhuhr: { type: Boolean, default: false },
      asr: { type: Boolean, default: false },
      maghrib: { type: Boolean, default: false },
      isha: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// Compound index so a user only has one log per calendar day
PrayerLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.PrayerLog || mongoose.model("PrayerLog", PrayerLogSchema);
