import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    userAgent: { type: String, default: "", trim: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "", trim: true },
    passwordHash: { type: String, required: true, select: false },
    refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
