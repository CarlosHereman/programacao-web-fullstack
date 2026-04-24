import axios from "axios";

const URL_BASE = "https://v2.jokeapi.dev/joke";

export async function fetchJokes({
  categoria = "Any",
  tipo = "",
  contains = "",
  idioma = "pt",
  quant = 1,
  seguro = false,
}) {
  const queryParams = new URLSearchParams();

  if (idioma) queryParams.set("idioma", idioma);
  if (quant && quant > 1) queryParams.set("quant", quant);
  if (tipo) queryParams.set("tipo", tipo);
  if (contains && contains.trim() !== "") queryParams.set("contains", contains.trim());
  if (seguro) queryParams.set("modo-seguro", "");

  const url = `${URL_BASE}/${categoria}?${queryParams.toString()}`;

  const res = await axios.get(url);
  const data = res.data;

  // retorna { error: true } quando não encontra resultados
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
