import axios from "axios";

const API_BASE = "http://localhost:3001/api";

export async function fetchJokes(
  { category = "Any", type = "", contains = "", lang = "en", amount = 1, safe = false },
  token
) {
  const queryParams = new URLSearchParams();

  if (category) queryParams.set("category", category);
  if (lang) queryParams.set("lang", lang);
  if (amount && amount > 0) queryParams.set("amount", amount);
  if (type) queryParams.set("type", type);
  if (contains && contains.trim() !== "") queryParams.set("contains", contains.trim());
  if (safe) queryParams.set("safe", "true");

  const url = `${API_BASE}/jokes?${queryParams.toString()}`;

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { jokes } = res.data;

  if (!jokes || jokes.length === 0) {
    const err = new Error("Nenhuma piada encontrada com os filtros selecionados.");
    err.isApiError = true;
    throw err;
  }

  return jokes;
}

/**
 * Insere uma nova piada no backend.
 * Requer token JWT de autenticação.
 */
export async function insertJoke(joke, token) {
  const res = await axios.post(`${API_BASE}/jokes`, joke, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}
