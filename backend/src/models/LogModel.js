import { getDb } from "../config/database.js";

/**
 * Modelo de acesso ao banco de dados para logs de segurança.
 * Registra eventos de autenticação e atividades dos usuários.
 */
export const LogModel = {
  /**
   * Registra um evento de autenticação (login bem-sucedido, falha, logout).
   * @param {object} entry - { username, event, ip }
   */
  logAuth({ username, event, ip }) {
    const db = getDb();
    db.prepare(
      "INSERT INTO auth_logs (username, event, ip) VALUES (?, ?, ?)"
    ).run(username || "unknown", event, ip || "unknown");
  },

  /**
   * Registra uma atividade do usuário (busca, inserção).
   * @param {object} entry - { user_id, action, detail, ip }
   */
  logActivity({ user_id, action, detail, ip }) {
    const db = getDb();
    db.prepare(
      "INSERT INTO activity_logs (user_id, action, detail, ip) VALUES (?, ?, ?, ?)"
    ).run(user_id || null, action, detail || null, ip || "unknown");
  },
};
