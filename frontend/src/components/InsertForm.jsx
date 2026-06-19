import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { insertJoke } from "./jokeService";

const CATEGORIES = [
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

/**
 * Componente de formulário para inserção de novas piadas no banco de dados.
 * Suporta piadas do tipo 'single' e 'twopart'.
 */
export default function InsertForm() {
  const { token } = useAuth();
  const [successMsg, setSuccessMsg] = useState(null);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      category: "Programming",
      type: "single",
      joke: "",
      setup: "",
      delivery: "",
      lang: "en",
      safe: false,
    },
  });

  const jokeType = watch("type");

  async function onSubmit(data) {
    setSuccessMsg(null);
    setServerError(null);

    try {
      const payload = {
        category: data.category,
        type: data.type,
        lang: data.lang,
        safe: data.safe,
      };

      if (data.type === "single") {
        payload.joke = data.joke;
      } else {
        payload.setup = data.setup;
        payload.delivery = data.delivery;
      }

      await insertJoke(payload, token);
      setSuccessMsg("Piada inserida com sucesso!");
      reset();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Erro ao inserir a piada. Tente novamente.";
      setServerError(msg);
    }
  }

  return (
    <section className="search-section">
      <h2 className="search-section__title">Inserir Nova Piada</h2>

      <form className="search-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {successMsg && (
          <div className="insert-success" role="status">
            {successMsg}
          </div>
        )}
        {serverError && (
          <div className="insert-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="ins-category" className="form-label">
            Categoria <span className="required">*</span>
          </label>
          <select
            id="ins-category"
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
          <label htmlFor="ins-type" className="form-label">
            Tipo de piada <span className="required">*</span>
          </label>
          <select
            id="ins-type"
            className="form-control"
            {...register("type", { required: "Selecione o tipo." })}
          >
            <option value="single">Piada única (single)</option>
            <option value="twopart">Pergunta e resposta (two-part)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ins-lang" className="form-label">
            Idioma <span className="required">*</span>
          </label>
          <select
            id="ins-lang"
            className="form-control"
            {...register("lang", { required: "Selecione um idioma." })}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {jokeType === "single" ? (
          <div className="form-group">
            <label htmlFor="ins-joke" className="form-label">
              Texto da piada <span className="required">*</span>
            </label>
            <textarea
              id="ins-joke"
              rows={4}
              placeholder="Digite o texto completo da piada..."
              className={`form-control ${errors.joke ? "form-control--error" : ""}`}
              {...register("joke", {
                required: "O texto da piada é obrigatório.",
                maxLength: { value: 1000, message: "Piada muito longa (máximo 1000 caracteres)." },
              })}
            />
            {errors.joke && (
              <span className="error-msg">{errors.joke.message}</span>
            )}
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="ins-setup" className="form-label">
                Pergunta (setup) <span className="required">*</span>
              </label>
              <input
                id="ins-setup"
                type="text"
                placeholder="Ex: Why do programmers prefer dark mode?"
                className={`form-control ${errors.setup ? "form-control--error" : ""}`}
                {...register("setup", {
                  required: "A pergunta é obrigatória.",
                  maxLength: { value: 500, message: "Pergunta muito longa (máximo 500 caracteres)." },
                })}
              />
              {errors.setup && (
                <span className="error-msg">{errors.setup.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="ins-delivery" className="form-label">
                Resposta (delivery) <span className="required">*</span>
              </label>
              <input
                id="ins-delivery"
                type="text"
                placeholder="Ex: Because light attracts bugs!"
                className={`form-control ${errors.delivery ? "form-control--error" : ""}`}
                {...register("delivery", {
                  required: "A resposta é obrigatória.",
                  maxLength: { value: 500, message: "Resposta muito longa (máximo 500 caracteres)." },
                })}
              />
              {errors.delivery && (
                <span className="error-msg">{errors.delivery.message}</span>
              )}
            </div>
          </>
        )}

        <div className="form-group form-group--checkbox">
          <label className="form-label form-label--checkbox">
            <input
              type="checkbox"
              className="form-checkbox"
              {...register("safe")}
            />
            Conteúdo seguro (sem conteúdo explícito)
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Inserindo..." : "Inserir Piada"}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => { reset(); setSuccessMsg(null); setServerError(null); }}
          >
            Limpar
          </button>
        </div>
      </form>
    </section>
  );
}
