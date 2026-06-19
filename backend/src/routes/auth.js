import { Router } from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/UserModel.js";
import { LogModel } from "../models/LogModel.js";
import { generateToken, invalidateToken, requireAuth } from "../config/auth.js";

const router = Router();

/**
 * Rate limiting para login: máximo de 10 tentativas por IP em 15 minutos.
 * Previne ataques automatizados de força bruta (OWASP: Broken Authentication).
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Muitas tentativas de login. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Autentica o usuário com username e password.
 * Retorna um token JWT em caso de sucesso.
 */
router.post(
  "/login",
  loginLimiter,
  [
    body("username")
      .trim()
      .notEmpty().withMessage("O nome de usuário é obrigatório.")
      .isLength({ max: 50 }).withMessage("Nome de usuário muito longo.")
      .escape(),
    body("password")
      .notEmpty().withMessage("A senha é obrigatória.")
      .isLength({ min: 4, max: 100 }).withMessage("Senha inválida."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, password } = req.body;

    try {
      const user = UserModel.findByUsername(username);

      if (!user) {
        LogModel.logAuth({ username, event: "LOGIN_FAILED_USER_NOT_FOUND", ip: req.ip });
        // Resposta genérica para não revelar se o usuário existe (segurança)
        return res.status(401).json({ message: "Usuário ou senha inválidos." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        LogModel.logAuth({ username, event: "LOGIN_FAILED_WRONG_PASSWORD", ip: req.ip });
        return res.status(401).json({ message: "Usuário ou senha inválidos." });
      }

      const token = generateToken({ id: user.id, username: user.username });

      LogModel.logAuth({ username, event: "LOGIN_SUCCESS", ip: req.ip });

      return res.status(200).json({
        message: "Login realizado com sucesso.",
        token,
        user: { id: user.id, username: user.username },
      });
    } catch (err) {
      console.error("[AUTH] Erro no login:", err);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }
);

/**
 * POST /api/auth/logout
 * Invalida o token JWT do usuário (adiciona à blacklist).
 * Requer autenticação.
 */
router.post("/logout", requireAuth, (req, res) => {
  invalidateToken(req.token);
  LogModel.logAuth({ username: req.user.username, event: "LOGOUT", ip: req.ip });
  return res.status(200).json({ message: "Logout realizado com sucesso." });
});

/**
 * GET /api/auth/me
 * Retorna os dados do usuário autenticado.
 * Requer autenticação.
 */
router.get("/me", requireAuth, (req, res) => {
  const user = UserModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }
  return res.status(200).json({ user });
});

export default router;
