import { Router } from "express";
import crypto from "crypto";
import UserModel from "../models/User.model.js";
import TwoFactorCodeModel from "../models/TwoFactorCode.model.js";
import { comparePassword } from "../util/password.js";
import { generateToken } from "../util/token.js";
import { AuthMiddleware } from "../middleware/Auth.middleware.js";
import { sendEmail } from "../util/mailer.js";

export const LoginRouter = Router();

const toPublicUser = (u) => ({
  id: u._id,
  name: u.name,
  surname: u.surname,
  username: u.username,
  email: u.email,
  birthday: u.birthday,
  twoFactorEnabled: u.twoFactorEnabled,
});

const normalizeEmail = (email) => String(email || "").toLowerCase().trim();

const random6Digits = () => String(crypto.randomInt(100000, 1000000));

LoginRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const userExists = await UserModel.findOne({ email: normalizedEmail });

    if (!userExists) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    const isPasswordValid = await comparePassword(password, userExists.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    if (userExists.twoFactorEnabled) {
      await TwoFactorCodeModel.deleteMany({ userId: userExists._id });

      const code = random6Digits();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const codeDoc = await TwoFactorCodeModel.create({
        userId: userExists._id,
        code,
        expiresAt,
      });

      try {
        await sendEmail({
          to: userExists.email,
          subject: "Your verification code",
          templateName: "two-factor-code",
          variables: { code },
        });
      } catch (emailError) {
        await TwoFactorCodeModel.deleteOne({ _id: codeDoc._id });
        throw emailError;
      }

      return res.status(200).json({
        message: "2FA required",
        twoFactorRequired: true,
        email: userExists.email,
      });
    }

    const token = generateToken({
      id: userExists._id,
      email: userExists.email,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: toPublicUser(userExists),
    });
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

LoginRouter.post("/verify-2fa", async (req, res) => {
  try {
    const { email, code } = req.body || {};

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedCode = String(code).trim();

    const userExists = await UserModel.findOne({ email: normalizedEmail });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const codeRecord = await TwoFactorCodeModel.findOne({
      userId: userExists._id,
      code: normalizedCode,
    });

    if (!codeRecord) {
      return res.status(400).json({ message: "Invalid code" });
    }

    if (codeRecord.expiresAt < new Date()) {
      await TwoFactorCodeModel.deleteMany({ userId: userExists._id });
      return res.status(400).json({ message: "Code expired" });
    }

    await TwoFactorCodeModel.deleteMany({ userId: userExists._id });

    const token = generateToken({
      id: userExists._id,
      email: userExists.email,
    });

    return res.status(200).json({
      message: "2FA verified",
      token,
      user: toPublicUser(userExists),
    });
  } catch (error) {
    console.error("Error in verify 2FA:", error);
    return res.status(500).json({ message: "2FA verification failed" });
  }
});

LoginRouter.get("/me", AuthMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("Error in /me:", err);
    return res.status(500).json({ message: "Server error" });
  }
});