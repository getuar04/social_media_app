import { Router } from "express";
import UserModel from "../models/User.model.js";
import { comparePassword } from "../util/password.js";
import { generateToken } from "../util/token.js";
import { AuthMiddleware } from "../middleware/Auth.middleware.js"; // ose verifyJWT nëse kështu e ke eksportin

export const LoginRouter = Router();

const toPublicUser = (u) => ({
  id: u._id,
  name: u.name,
  surname: u.surname,
  username: u.username,
  email: u.email,
  birthday: u.birthday,
});

LoginRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const userExists = await UserModel.findOne({ email });
  console.log("🚀 ~ LoginRouter ~ userExists:", userExists);

  if (!userExists) {
    return res.status(401).json({ message: "Wrong credentials" });
  }

  const isPasswordValid = await comparePassword(
    password,
    userExists.passwordHash,
  );
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Wrong credentials" });
  }


  const token = generateToken({ id: userExists._id, email: userExists.email });
  console.log("🚀 ~ LoginRouter ~ token:", token);

  return res.status(200).json({
    message: "Login successful",
    token,
    user: toPublicUser(userExists),
  });
});

LoginRouter.get("/me", AuthMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});
