import { getDb } from "../config/database.js";
import axios from "axios";

const EXTERNAL_API_URL = "https://v2.jokeapi.dev/joke";

/**
 * Modelo de acesso ao banco de dados para a entidade Joke.
 * Implementa busca híbrida: tenta localmente, se não encontrar, busca na JokeAPI externa.
 */
export const JokeModel = {
  /**
   * Busca piadas localmente.
   */
  findLocal({ category, type, lang, contains, safe, amount } = {}) {
    const db = getDb();
    let sql = "SELECT * FROM jokes WHERE 1=1";
    const params = [];

    if (category && category !== "Any") {
      sql += " AND category = ?";
      params.push(category);
    }
    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }
    if (lang) {
      sql += " AND lang = ?";
      params.push(lang);
    }
    if (contains && contains.trim() !== "") {
      sql += " AND (joke LIKE ? OR setup LIKE ? OR delivery LIKE ?)";
      const term = `%${contains.trim()}%`;
      params.push(term, term, term);
    }
    if (safe) {
      sql += " AND safe = 1";
    }

    sql += " ORDER BY RANDOM()"; // Aleatório para variar os resultados locais

    if (amount && Number(amount) > 0) {
      sql += " LIMIT ?";
      params.push(Number(amount));
    }

    return db.prepare(sql).all(...params);
  },

  /**
   * Busca piadas na JokeAPI externa e as salva no banco local.
   */
  async fetchExternal({ category = "Any", type, lang = "en", contains, safe, amount = 1 }) {
    try {
      const queryParams = new URLSearchParams();
      if (lang) queryParams.set("lang", lang);
      if (amount && amount > 1) queryParams.set("amount", amount);
      if (type) queryParams.set("type", type);
      if (contains && contains.trim() !== "") queryParams.set("contains", contains.trim());
      if (safe) queryParams.set("safe-mode", "");

      const url = `${EXTERNAL_API_URL}/${category}?${queryParams.toString()}`;
      const response = await axios.get(url);
      const data = response.data;

      if (data.error) return [];

      const externalJokes = data.jokes ? data.jokes : [data];
      const savedJokes = [];

      // Salva as piadas externas no banco local para futuras buscas
      for (const j of externalJokes) {
        // Verifica se já existe para evitar duplicatas (busca por texto/setup)
        const db = getDb();
        const existing = db.prepare("SELECT id FROM jokes WHERE (joke = ? AND joke IS NOT NULL) OR (setup = ? AND setup IS NOT NULL)").get(j.joke || null, j.setup || null);
        
        if (!existing) {
          const result = this.create({
            category: j.category,
            type: j.type,
            joke: j.joke,
            setup: j.setup,
            delivery: j.delivery,
            lang: j.lang,
            safe: j.safe || (j.flags && !j.flags.nsfw && !j.flags.religious && !j.flags.political && !j.flags.racist && !j.flags.sexist && !j.flags.explicit),
            created_by: 1 // Atribuído ao usuário 'admin' (ID 1)
          });
          
          // Busca a piada recém criada para retornar o objeto completo
          const newJoke = this.findById(result.id);
          savedJokes.push(newJoke);
        } else {
          savedJokes.push(this.findById(existing.id));
        }
      }

      return savedJokes;
    } catch (error) {
      console.error("[JokeModel] Erro ao buscar na API externa:", error.message);
      return [];
    }
  },

  /**
   * Método principal de busca: tenta local, se falhar ou for pouco, tenta externa.
   */
  async findAll(filters) {
    // 1. Tenta buscar no banco local
    let results = this.findLocal(filters);

    // 2. Se não encontrou nada localmente, busca na API externa
    if (results.length === 0) {
      results = await this.fetchExternal(filters);
    }

    return results;
  },

  findById(id) {
    const db = getDb();
    return db.prepare("SELECT * FROM jokes WHERE id = ?").get(id);
  },

  create({ category, type, joke, setup, delivery, lang, safe, created_by }) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO jokes (category, type, joke, setup, delivery, lang, safe, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      category,
      type,
      joke || null,
      setup || null,
      delivery || null,
      lang || "en",
      safe ? 1 : 0,
      created_by
    );
    return { id: result.lastInsertRowid, changes: result.changes };
  },
};
