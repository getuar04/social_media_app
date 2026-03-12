import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import { LoginRouter } from "./routes/Login.route.js";
import { RegisterRouter } from "./routes/Register.route.js";
import PostRouter from "./routes/Post.route.js";
import { PasswordRouter } from "./routes/Password.route.js";
import { TwoFactorRouter } from "./routes/TwoFactor.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options(/.*/, cors({ origin: FRONTEND_ORIGIN }));

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => {
    console.log("🌲 Connected to the database");
  })
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
  });

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", RegisterRouter); // POST /auth
app.use("/auth", LoginRouter); // POST /auth/login, GET /auth/me
app.use("/posts", PostRouter); // posts CRUD
app.use("/uploads", express.static("uploads"));
app.use("/password", PasswordRouter); // POST /password/forgot-password

app.use("/auth", TwoFactorRouter);


app.listen(PORT, () => {
  console.log(`🫡  Server running on http://localhost:${PORT}`);
});
