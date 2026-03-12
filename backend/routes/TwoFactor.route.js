import { Router } from "express";
import TwoFactorCode from "../models/TwoFactorCode.model.js";
import User from "../models/User.model.js";
import { generateToken } from "../util/token.js";

export const TwoFactorRouter = Router();

TwoFactorRouter.post("/verify-2fa", async (req, res) => {
  const { email, code } = req.body || {};

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const codeEntry = await TwoFactorCode.findOne({
    userId: user._id,
    code,
  });

  if (!codeEntry) {
    return res.status(400).json({ message: "Invalid code" });
  }

  if (codeEntry.expiresAt < new Date()) {
    return res.status(400).json({ message: "Code expired" });
  }

  await TwoFactorCode.deleteMany({ userId: user._id });

  const token = generateToken({
    id: user._id,
    email: user.email,
  });

  return res.status(200).json({
    message: "Login successful",
    token,
  });
});
