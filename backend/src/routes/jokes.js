import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import { JokeModel } from "../models/JokeModel.js";
import { LogModel } from "../models/LogModel.js";
import { requireAuth } from "../config/auth.js";
import cache, { buildCacheKey } from "../config/cache.js";

const router = Router();

// Todas as rotas de piadas exigem autenticação
router.use(requireAuth);

/**
 * Rate limiting para buscas: máximo de 60 requisições por minuto por IP.
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { message: "Muitas buscas realizadas. Tente novamente em 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiting para inserções: máximo de 20 inserções por minuto por IP.
 */
const insertLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: "Muitas inserções realizadas. Tente novamente em 1 minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /api/jokes
 * Busca piadas no banco de dados com filtros opcionais.
 * Implementa busca híbrida (local + JokeAPI externa).
 */
router.get(
  "/",
  searchLimiter,
  [
    query("category")
      .optional()
      .trim()
      .isIn(["Any", "Programming", "Misc", "Pun", "Spooky", "Christmas"])
      .withMessage("Categoria inválida.")
      .escape(),
    query("type")
      .optional()
      .trim()
      .isIn(["", "single", "twopart"])
      .withMessage("Tipo inválido.")
      .escape(),
    query("lang")
      .optional()
      .trim()
      .isIn(["en", "de", "cs", "es", "fr", "pt"])
      .withMessage("Idioma inválido.")
      .escape(),
    query("contains")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Palavra-chave muito longa.")
      .matches(/^[a-zA-Z0-9 _-]*$/)
      .withMessage("Palavra-chave contém caracteres inválidos.")
      .escape(),
    query("amount")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("Quantidade deve ser entre 1 e 10.")
      .toInt(),
    query("safe")
      .optional()
      .isBoolean()
      .withMessage("O parâmetro safe deve ser true ou false.")
      .toBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { category, type, lang, contains, amount, safe } = req.query;
    const filters = { category, type, lang, contains, amount, safe };

    // Verificar cache antes de consultar
    const cacheKey = buildCacheKey(filters);
    const cached = cache.get(cacheKey);

    if (cached) {
      LogModel.logActivity({
        user_id: req.user.id,
        action: "SEARCH_CACHE_HIT",
        detail: JSON.stringify(filters),
        ip: req.ip,
      });
      return res.status(200).json({ jokes: cached, fromCache: true });
    }

    try {
      // Chama o método assíncrono que faz a busca híbrida
      const jokes = await JokeModel.findAll(filters);

      if (jokes.length === 0) {
        return res.status(404).json({ message: "Nenhuma piada encontrada com os filtros selecionados." });
      }

      // Armazenar resultado no cache
      cache.set(cacheKey, jokes);

      LogModel.logActivity({
        user_id: req.user.id,
        action: "SEARCH",
        detail: JSON.stringify(filters),
        ip: req.ip,
      });

      return res.status(200).json({ jokes, fromCache: false });
    } catch (err) {
      console.error("[JOKES] Erro na busca híbrida:", err);
      return res.status(500).json({ message: "Erro ao processar busca de piadas." });
    }
  }
);

/**
 * POST /api/jokes
 * Insere uma nova piada no banco de dados.
 */
router.post(
  "/",
  insertLimiter,
  [
    body("category")
      .trim()
      .notEmpty().withMessage("A categoria é obrigatória.")
      .isIn(["Programming", "Misc", "Pun", "Spooky", "Christmas"])
      .withMessage("Categoria inválida.")
      .escape(),
    body("type")
      .trim()
      .notEmpty().withMessage("O tipo é obrigatório.")
      .isIn(["single", "twopart"])
      .withMessage("Tipo deve ser 'single' ou 'twopart'.")
      .escape(),
    body("joke")
      .if(body("type").equals("single"))
      .trim()
      .notEmpty().withMessage("O texto da piada é obrigatório para o tipo 'single'.")
      .isLength({ max: 1000 }).withMessage("Piada muito longa (máximo 1000 caracteres).")
      .escape(),
    body("setup")
      .if(body("type").equals("twopart"))
      .trim()
      .notEmpty().withMessage("A pergunta (setup) é obrigatória para o tipo 'twopart'.")
      .isLength({ max: 500 }).withMessage("Pergunta muito longa (máximo 500 caracteres).")
      .escape(),
    body("delivery")
      .if(body("type").equals("twopart"))
      .trim()
      .notEmpty().withMessage("A resposta (delivery) é obrigatória para o tipo 'twopart'.")
      .isLength({ max: 500 }).withMessage("Resposta muito longa (máximo 500 caracteres).")
      .escape(),
    body("lang")
      .optional()
      .trim()
      .isIn(["en", "de", "cs", "es", "fr", "pt"])
      .withMessage("Idioma inválido.")
      .escape(),
    body("safe")
      .optional()
      .isBoolean().withMessage("O campo safe deve ser booleano.")
      .toBoolean(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { category, type, joke, setup, delivery, lang, safe } = req.body;

    try {
      const result = JokeModel.create({
        category,
        type,
        joke,
        setup,
        delivery,
        lang: lang || "en",
        safe: safe || false,
        created_by: req.user.id,
      });

      // Invalidar cache de buscas após inserção
      cache.flushAll();

      LogModel.logActivity({
        user_id: req.user.id,
        action: "INSERT_JOKE",
        detail: JSON.stringify({ category, type, lang }),
        ip: req.ip,
      });

      return res.status(201).json({
        message: "Piada inserida com sucesso.",
        id: result.id,
      });
    } catch (err) {
      console.error("[JOKES] Erro na inserção:", err);
      return res.status(500).json({ message: "Erro ao inserir piada." });
    }
  }
);

export default router;
