import { getDb } from "../config/database.js";

/**
 * Modelo de acesso ao banco de dados para a entidade User.
 * Encapsula todas as queries SQL relacionadas a usuários.
 */
export const UserModel = {
  /**
   * Busca um usuário pelo nome de usuário.
   * @param {string} username
   * @returns {object|undefined}
   */
  findByUsername(username) {
    const db = getDb();
    return db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);
  },

  /**
   * Busca um usuário pelo ID.
   * @param {number} id
   * @returns {object|undefined}
   */
  findById(id) {
    const db = getDb();
    return db
      .prepare("SELECT id, username, created_at FROM users WHERE id = ?")
      .get(id);
  },
};
