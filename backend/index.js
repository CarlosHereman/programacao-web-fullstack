import dotenv from "dotenv";
dotenv.config();

import app from "./src/server.js";
import { getDb } from "./src/config/database.js";

const PORT = process.env.PORT || 3001;

// Inicializa o banco de dados antes de iniciar o servidor
async function start() {
  try {
    getDb(); // Inicializa e semeia o banco
    app.listen(PORT, () => {
      console.log(`[SERVER] JokeHub Backend rodando na porta ${PORT}`);
      console.log(`[SERVER] Ambiente: ${process.env.NODE_ENV || "development"}`);
      console.log(`[SERVER] API disponível em http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("[SERVER] Falha ao iniciar:", err);
    process.exit(1);
  }
}

start();
