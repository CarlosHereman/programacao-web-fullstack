import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/auth.js";
import jokesRoutes from "./routes/jokes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//  Logs de acesso com Morgan 
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const accessLogStream = fs.createWriteStream(
  path.join(logsDir, "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev"));

//  Segurança: Helmet 
// Ajustado para não bloquear requisições locais e permitir cross-origin
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Desabilitado para desenvolvimento local facilitar
  })
);

//  Compressão de respostas
app.use(compression());

//  CORS 
// Adicionado suporte explícito para 127.0.0.1 e pre-flight (OPTIONS)
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://127.0.0.1:5173", 
      "http://localhost:4173", 
      "http://127.0.0.1:4173",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

//  Parse de JSON e URL-encoded 
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

//  Rate limiting global 
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Aumentado para evitar bloqueios em testes intensos
  message: { message: "Muitas requisições. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

//  Rotas da API 
app.use("/api/auth", authRoutes);
app.use("/api/jokes", jokesRoutes);

//  Health check 
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

//  Rota não encontrada 
app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

//  Tratamento de erros global 
app.use((err, req, res, _next) => {
  console.error("[SERVER] Erro não tratado:", err);
  res.status(500).json({ message: "Erro interno no servidor." });
});

export default app;
