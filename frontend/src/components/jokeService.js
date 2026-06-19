import axios from "axios";

const URL_BASE = "https://v2.jokeapi.dev/joke";

/**
 * Busca piadas na JokeAPI com base nos parâmetros fornecidos.
 * Corrigido: Nomes das propriedades devem coincidir com o SearchForm.jsx
 * e os parâmetros da URL devem coincidir com a documentação da JokeAPI.
 */
export async function fetchJokes({
  category = "Any",
  type = "",
  contains = "",
  lang = "en",
  amount = 1,
  safe = false,
}) {
  const queryParams = new URLSearchParams();

  // Parâmetros oficiais da JokeAPI: lang, amount, type, contains, safe-mode
  if (lang) queryParams.set("lang", lang);
  if (amount && amount > 1) queryParams.set("amount", amount);
  if (type) queryParams.set("type", type);
  if (contains && contains.trim() !== "") queryParams.set("contains", contains.trim());
  if (safe) queryParams.set("safe-mode", "");

  const url = `${URL_BASE}/${category}?${queryParams.toString()}`;

  const res = await axios.get(url);
  const data = res.data;

  // A JokeAPI retorna { error: true } quando não encontra resultados
  if (data.error) {
    const mensagem =
      data.additionalInfo ||
      data.message ||
      "Nenhuma piada encontrada com os filtros selecionados.";
    throw new Error(mensagem);
  }

  // Quando a quantidade for maior que 1, a resposta vem em data.jokes. Se for 1, é um único objeto
  if (data.jokes) {
    return data.jokes;
  }

  return [data];
}
