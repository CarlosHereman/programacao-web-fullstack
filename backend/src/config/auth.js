import jwt from "jsonwebtoken";
import { LogModel } from "../models/LogModel.js";

// Conjunto em memória de tokens invalidados (blacklist para logout)
const tokenBlacklist = new Set();

/**
 * Gera um token JWT para o usuário autenticado.
 * @param {object} payload - { id, username }
 * @returns {string}
 */
export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  });
}

/**
 * Invalida um token JWT (logout), adicionando-o à blacklist.
 * @param {string} token
 */
export function invalidateToken(token) {
  tokenBlacklist.add(token);
}

/**
 * Middleware de autenticação JWT.
 * Verifica o token no header Authorization: Bearer <token>.
 * Bloqueia requisições com tokens inválidos, expirados ou na blacklist.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de autenticação não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  // Verifica se o token foi invalidado (logout)
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: "Sessão encerrada. Faça login novamente." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Token expirado. Faça login novamente."
        : "Token inválido.";

    LogModel.logAuth({
      username: "unknown",
      event: `TOKEN_INVALID: ${err.name}`,
      ip: req.ip,
    });

    return res.status(401).json({ message });
  }
}
