import { Router } from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import { UserModel } from "../models/UserModel.js";
import { LogModel } from "../models/LogModel.js";
import { generateToken, invalidateToken } from "../config/auth.js";

const router = Router();

// limitador de tentativas para login: máximo de 10 tentativas por 15 minutos por IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { message: "Muitas tentativas de login. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false, 
});

//POST /api/auth/login
router.post(
  "/login",
  loginLimiter,
  [
    body("username")
      .trim()
      .notEmpty().withMessage("O nome de usuário é obrigatório.")
      .isLength({ min: 3, max: 20 }).withMessage("O nome de usuário deve ter entre 3 e 20 caracteres.")
      .matches(/^[a-zA-Z0-9_]+$/).withMessage("O nome de usuário pode conter apenas letras, números e _.")
      .escape(),
    body("password")
      .notEmpty().withMessage("A senha é obrigatória.")
      .isLength({ min: 4 }).withMessage("A senha deve ter no mínimo 4 caracteres.")
      .escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      LogModel.logAuth(req.body.username, "LOGIN_VALIDATION_FAIL", req.ip);
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { username, password } = req.body;

    try {
      const user = UserModel.findByUsername(username);

      if (!user || !(await UserModel.validatePassword(password, user.password))) {
        LogModel.logAuth(username, "LOGIN_FAIL", req.ip);
        return res.status(401).json({ message: "Usuário ou senha inválidos." });
      }

      const token = generateToken(user);
      LogModel.logAuth(username, "LOGIN_SUCCESS", req.ip);

      return res.status(200).json({
        message: "Login realizado com sucesso.",
        token,
        user: { id: user.id, username: user.username },
      });
    } catch (err) {
      console.error("[AUTH] Erro no login:", err);
      LogModel.logAuth(username, "LOGIN_ERROR", req.ip);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }
);

//POST /api/auth/logout
router.post("/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    invalidateToken(token);
  }
  return res.status(200).json({ message: "Logout realizado com sucesso." });
});

export default router;