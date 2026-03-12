import { Router } from "express";
import UserModel from "../models/User.model.js";
import TokenModel from "../models/Token.model.js";
import { generatePasswordResetToken } from "../util/token.js";
import { sendEmail } from "../util/mailer.js";
import { hashPassword } from "../util/password.js";

export const PasswordRouter = Router();

PasswordRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await UserModel.findOne({ email: normalizedEmail });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    await TokenModel.deleteMany({ userId: userExists._id });

    const resetPasswordToken = generatePasswordResetToken();

    await TokenModel.create({
      userId: userExists._id,
      token: resetPasswordToken,
    });

    const frontendUrl =
      process.env.FRONTEND_URL || process.env.FRONTEND_ORIGIN;

    const resetLink = `${frontendUrl}/reset-password?token=${resetPasswordToken}`;

    await sendEmail({
      to: userExists.email,
      subject: "Password Reset Request",
      templateName: "reset-password",
      variables: { resetLink },
    });

    return res.status(200).json({
      message: "Password reset link sent successfully",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Failed to send reset password email",
      error: error.message,
    });
  }
});

PasswordRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body || {};

    console.log("BODY:", req.body);

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Token, password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const tokenEntry = await TokenModel.findOne({ token });
    console.log("TOKEN ENTRY:", tokenEntry);

    if (!tokenEntry) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await UserModel.findById(tokenEntry.userId);
    console.log("FOUND USER:", user?.email);

    if (!user) {
      await TokenModel.deleteOne({ _id: tokenEntry._id });
      return res.status(404).json({ message: "User not found" });
    }

    const newHashedPassword = await hashPassword(password);
    console.log("NEW HASH:", newHashedPassword);

    user.passwordHash = newHashedPassword;
    await user.save();

    await TokenModel.deleteMany({ userId: user._id });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Failed to reset password",
      error: error.message,
    });
  }
});

// http://undefined/reset-password?token=ac09dbb541c9b606e3a255a1d0c44835ec95a0329b2c478e8b4609d5f7c61bd7
