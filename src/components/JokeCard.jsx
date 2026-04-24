const CATEGORY_LABELS = {
  Programming: "Programação",
  Misc: "Variado",
  Pun: "Trocadilho",
  Spooky: "Assustador",
  Christmas: "Natal",
};

const CATEGORY_COLORS = {
  Programming: "#4f46e5",
  Misc: "#0891b2",
  Pun: "#d97706",
  Spooky: "#7c3aed",
  Christmas: "#dc2626",
};

export default function JokeCard({ joke, index }) {
  const categoryLabel = CATEGORY_LABELS[joke.category] || joke.category;
  const categoryColor = CATEGORY_COLORS[joke.category] || "#6b7280";

  return (
    <article className="joke-card">
      <div className="joke-card__header">
        <span
          className="joke-card__badge"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryLabel}
        </span>
        <span className="joke-card__number">#{index + 1}</span>
      </div>

      <div className="joke-card__body">
        {joke.type === "single" ? (
          <p className="joke-card__single">{joke.joke}</p>
        ) : (
          <>
            <p className="joke-card__setup">
              <span className="joke-card__label">Pergunta:</span> {joke.setup}
            </p>
            <p className="joke-card__delivery">
              <span className="joke-card__label">Resposta:</span>{" "}
              <strong>{joke.delivery}</strong>
            </p>
          </>
        )}
      </div>

      <div className="joke-card__footer">
        <span className="joke-card__meta">
          Tipo: <em>{joke.type === "single" ? "Piada única" : "Pergunta e resposta"}</em>
        </span>
        {joke.flags && Object.values(joke.flags).some(Boolean) && (
          <span className="joke-card__flags">
            ⚠️{" "}
            {Object.entries(joke.flags)
              .filter(([, v]) => v)
              .map(([k]) => k)
              .join(", ")}
          </span>
        )}
      </div>
    </article>
  );
}
