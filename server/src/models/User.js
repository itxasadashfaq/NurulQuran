const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const BookmarkSchema = new mongoose.Schema({
  id: { type: String },
  surahNumber: { type: Number, required: true },
  surahName: { type: String, default: "" },
  ayahNumber: { type: Number, required: true },
  arabicText: { type: String, default: "" },
  translationText: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"]
    },
    email: {
      type: String,
      required: [true, "Please provide an email address"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email"
      ]
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false
    },
    uid: {
      type: String,
      sparse: true,
      index: true
    },
    photoURL: {
      type: String,
      default: ""
    },
    readingStreak: {
      type: Number,
      default: 5
    },
    memorizedSurahs: {
      type: Number,
      default: 12
    },
    lastRead: {
      surahNumber: { type: Number, default: 1 },
      surahName: { type: String, default: "Al-Fatihah" },
      ayahNumber: { type: Number, default: 1 },
      updatedAt: { type: Date, default: Date.now }
    },
    bookmarks: [BookmarkSchema],
    preferences: {
      theme: { type: String, default: "system" },
      accent: { type: String, default: "emerald" },
      arabicFontSize: { type: Number, default: 28 },
      reciterId: { type: String, default: "ar.alafasy" },
      calculationMethod: { type: Number, default: 2 }, // ISNA / MWL / etc.
      juristicSchool: { type: String, default: "hanafi" } // hanafi / shafii
    },
    lastLoginAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function () {
  const secret = process.env.JWT_SECRET || "nurulquran_dev_jwt_secret_key_change_in_production_2026";
  const expiresIn = process.env.JWT_EXPIRES_IN || "30d";
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      name: this.name,
      uid: this.uid || this._id.toString()
    },
    secret,
    { expiresIn }
  );
};

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
