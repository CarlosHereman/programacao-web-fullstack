import { useForm } from "react-hook-form";
import { useJoke } from "../contexts/JokeContext";
import { ACTIONS } from "../contexts/JokeContext";
import { fetchJokes } from "./jokeService";

const CATEGORIES = [
  { value: "Any", label: "Qualquer categoria" },
  { value: "Programming", label: "Programação" },
  { value: "Misc", label: "Variado" },
  { value: "Pun", label: "Trocadilho" },
  { value: "Spooky", label: "Assustador" },
  { value: "Christmas", label: "Natal" },
];

const LANGUAGES = [
  { value: "en", label: "Inglês" },
  { value: "de", label: "Alemão" },
  { value: "cs", label: "Tcheco" },
  { value: "es", label: "Espanhol" },
  { value: "fr", label: "Francês" },
  { value: "pt", label: "Português" },
];

export default function SearchForm() {
  const { dispatch } = useJoke();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      category: "Any",
      type: "",
      contains: "",
      lang: "en",
      amount: 1,
      safe: false,
    },
  });

  async function onSubmit(data) {
    dispatch({
      type: ACTIONS.FETCH_START,
      payload: data,
    });

    try {
      const jokes = await fetchJokes({
        category: data.category,
        type: data.type,
        contains: data.contains,
        lang: data.lang,
        amount: Number(data.amount),
        safe: data.safe,
      });

      dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: jokes });
    } catch (err) {
      if (err.response) {
        dispatch({
          type: ACTIONS.API_ERROR,
          payload:
            err.response.data?.message ||
            `Erro da API: ${err.response.status}`,
        });
      } else {
        dispatch({
          type: ACTIONS.FETCH_ERROR,
          payload: err.message || "Erro ao buscar piadas. Tente novamente.",
        });
      }
    }
  }

  function handleClear() {
    reset();
    dispatch({ type: ACTIONS.CLEAR_RESULTS });
  }

  return (
    <section className="search-section">
      <h2 className="search-section__title">Buscar Piadas</h2>

      <form className="search-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Categoria <span className="required">*</span>
          </label>
          <select
            id="category"
            className={`form-control ${errors.category ? "form-control--error" : ""}`}
            {...register("category", { required: "Selecione uma categoria." })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="error-msg">{errors.category.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Tipo de piada
          </label>
          <select
            id="type"
            className="form-control"
            {...register("type")}
          >
            <option value="">Ambos</option>
            <option value="single">Piada única (single)</option>
            <option value="twopart">Pergunta e resposta (two-part)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="lang" className="form-label">
            Idioma <span className="required">*</span>
          </label>
          <select
            id="lang"
            className={`form-control ${errors.lang ? "form-control--error" : ""}`}
            {...register("lang", { required: "Selecione um idioma." })}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          {errors.lang && (
            <span className="error-msg">{errors.lang.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contains" className="form-label">
            Palavra-chave (opcional)
          </label>
          <input
            id="contains"
            type="text"
            placeholder="Ex: computer, cat, love..."
            className={`form-control ${errors.contains ? "form-control--error" : ""}`}
            {...register("contains", {
              maxLength: {
                value: 50,
                message: "A palavra-chave deve ter no máximo 50 caracteres.",
              },
              pattern: {
                value: /^[a-zA-Z0-9 _-]*$/,
                message: "Use apenas letras, números, espaços, hífens ou underscores.",
              },
            })}
          />
          {errors.contains && (
            <span className="error-msg">{errors.contains.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Quantidade <span className="required">*</span>
          </label>
          <input
            id="amount"
            type="number"
            className={`form-control ${errors.amount ? "form-control--error" : ""}`}
            {...register("amount", {
              required: "Informe a quantidade de piadas.",
              min: { value: 1, message: "Mínimo de 1 piada." },
              max: { value: 10, message: "Máximo de 10 piadas por busca." },
              valueAsNumber: true,
            })}
          />
          {errors.amount && (
            <span className="error-msg">{errors.amount.message}</span>
          )}
        </div>

        <div className="form-group form-group--checkbox">
          <label className="form-label form-label--checkbox">
            <input
              type="checkbox"
              className="form-checkbox"
              {...register("safe")}
            />
            Modo seguro (filtrar conteúdo explícito)
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Buscando..." : "Buscar Piadas"}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleClear}
          >
            Limpar
          </button>
        </div>
      </form>
    </section>
  );
}