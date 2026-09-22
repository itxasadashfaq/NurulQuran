const mongoose = require("mongoose");

const ZakatLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    currency: {
      type: String,
      default: "USD"
    },
    cash: {
      type: Number,
      default: 0
    },
    goldWeightGrams: {
      type: Number,
      default: 0
    },
    silverWeightGrams: {
      type: Number,
      default: 0
    },
    investments: {
      type: Number,
      default: 0
    },
    otherAssets: {
      type: Number,
      default: 0
    },
    liabilities: {
      type: Number,
      default: 0
    },
    netWealth: {
      type: Number,
      required: true
    },
    basis: {
      type: String,
      enum: ["gold", "silver"],
      default: "gold"
    },
    nisabThreshold: {
      type: Number,
      required: true
    },
    isEligible: {
      type: Boolean,
      default: false
    },
    zakatDue: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.ZakatLog || mongoose.model("ZakatLog", ZakatLogSchema);
