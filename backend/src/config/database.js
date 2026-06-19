import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.join(__dirname, "jokehub.db");

let _db = null;

export function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    _db.pragma("busy_timeout = 5000");

    initializeSchema(_db);
    seedData(_db);
  }
  return _db;
}

function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT    NOT NULL UNIQUE,
      password  TEXT    NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jokes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category    TEXT    NOT NULL,
      type        TEXT    NOT NULL CHECK(type IN ('single','twopart')),
      joke        TEXT,
      setup       TEXT,
      delivery    TEXT,
      lang        TEXT    NOT NULL DEFAULT 'en',
      safe        INTEGER NOT NULL DEFAULT 0,
      created_by  INTEGER REFERENCES users(id),
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auth_logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT,
      event      TEXT    NOT NULL,
      ip         TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER REFERENCES users(id),
      action     TEXT    NOT NULL,
      detail     TEXT,
      ip         TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function seedData(db) {
  // 1. Seed Users
  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get();
  if (userCount.c === 0) {
    const users = [
      { username: "abner", password: "senha123" },
      { username: "carlos", password: "senha123" },
      { username: "admin", password: "admin123" },
    ];
    const insertUser = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 12);
      insertUser.run(u.username, hash);
    }
    console.log("[DB] Usuários iniciais inseridos.");
  }

  // 2. Seed Jokes (para não iniciar vazio)
  const jokeCount = db.prepare("SELECT COUNT(*) as c FROM jokes").get();
  if (jokeCount.c === 0) {
    const jokes = [
      {
        category: "Programming",
        type: "single",
        joke: "A SQL query goes into a bar, walks up to two tables, and asks, 'Can I join you?'",
        lang: "en",
        safe: 1,
        created_by: 1
      },
      {
        category: "Programming",
        type: "twopart",
        setup: "Why do programmers prefer dark mode?",
        delivery: "Because light attracts bugs!",
        lang: "en",
        safe: 1,
        created_by: 1
      },
      {
        category: "Misc",
        type: "single",
        joke: "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        lang: "en",
        safe: 1,
        created_by: 1
      }
    ];
    const insertJoke = db.prepare(`
      INSERT INTO jokes (category, type, joke, setup, delivery, lang, safe, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const j of jokes) {
      insertJoke.run(j.category, j.type, j.joke || null, j.setup || null, j.delivery || null, j.lang, j.safe, j.created_by);
    }
    console.log("[DB] Piadas iniciais inseridas.");
  }
}

export default getDb;
