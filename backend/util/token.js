import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY;
console.log("🚀 ~ token.js:6 ~ JWT_SECRET:", JWT_SECRET);
const JWT_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN;
console.log("🚀 ~ token.js:8 ~ JWT_EXPIRES_IN:", JWT_EXPIRES_IN);

export const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return token;
  } catch (err) {
    console.error("Token generation failed:", err);
    throw err;
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return null;
  }
};

//export default { generateToken, verifyToken };
