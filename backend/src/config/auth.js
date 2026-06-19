import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { LogModel } from "../models/LogModel.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_BLACKLIST = new Set(); 

export const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "2h" });
};

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token de autenticação não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  if (TOKEN_BLACKLIST.has(token)) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado." });
    }
    return res.status(401).json({ message: "Token inválido." });
  }
};

export const invalidateToken = (token) => {
  TOKEN_BLACKLIST.add(token);
};