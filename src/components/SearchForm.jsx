

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
  return (
    <section className="search-section">
      <h2 className="search-section__title">Buscar Piadas</h2>

      <form className="search-form">
        <div className="form-group">
          <label>Categoria</label>
          <select>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Idioma</label>
          <select>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantidade</label>
          <input type="number" />
        </div>

        <button type="submit">Buscar</button>
      </form>
    </section>
  );
}