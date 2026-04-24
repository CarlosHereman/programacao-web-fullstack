

import { useForm } from "react-hook-form";

const CATEGORIES = [
  { value: "Any", label: "Qualquer categoria" },
  { value: "Programming", label: "Programação" },
  { value: "Misc", label: "Variado" },
];

const LANGUAGES = [
  { value: "en", label: "Inglês" },
  { value: "pt", label: "Português" },
];

export default function SearchForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "Any",
      lang: "en",
      amount: 1,
    },
  });

  function onSubmit(data) {
    console.log(data);
  }

  return (
    <section className="search-section">
      <h2 className="search-section__title">Buscar Piadas</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Categoria</label>
          <select {...register("category", { required: "Obrigatório" })}>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && <span>{errors.category.message}</span>}
        </div>

        <div className="form-group">
          <label>Idioma</label>
          <select {...register("lang", { required: "Obrigatório" })}>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          {errors.lang && <span>{errors.lang.message}</span>}
        </div>

        <div className="form-group">
          <label>Quantidade</label>
          <input
            type="number"
            {...register("amount", {
              required: "Obrigatório",
              min: 1,
              max: 10,
            })}
          />
        </div>

        <button type="submit">Buscar</button>
      </form>
    </section>
  );
}