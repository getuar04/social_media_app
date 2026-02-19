import { Router } from "express";
import UserModel from "../models/User.model.js";
import { hashPassword } from "../util/password.js";

export const RegisterRouter = Router();

RegisterRouter.post("/", async (req, res) => {
  // Handle user registration
  const { name, surname, username, email, birthday, password } = req.body;

  console.log("🚀 ~ RegisterRouter ~ email:", email);

  // (si te profes: validim i thjeshtë)
  if (!name || !surname || !username || !email || !birthday || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // (përshtatur: kontrollon email OSE username)
  const userExists = await UserModel.findOne({
    $or: [{ email }, { username }],
  });

  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new UserModel({
    name,
    surname,
    username,
    email,
    birthday,
    passwordHash: hashedPassword,
  });

  await newUser.save();

  return res.status(201).json({ message: "User registered successfully" });
});
