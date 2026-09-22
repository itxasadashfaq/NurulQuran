const mongoose = require("mongoose");

const TasbeehLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    dhikrId: {
      type: String,
      default: "general"
    },
    dhikrTitle: {
      type: String,
      required: true
    },
    arabicText: {
      type: String,
      default: ""
    },
    count: {
      type: Number,
      required: true,
      min: 1
    },
    target: {
      type: Number,
      default: 33
    },
    date: {
      type: String, // YYYY-MM-DD
      default: () => new Date().toISOString().split("T")[0],
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.TasbeehLog || mongoose.model("TasbeehLog", TasbeehLogSchema);
