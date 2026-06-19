export default function ErrorMessage({ message, type = "network" }) {
  const isNetwork = type === "network";

  return (
    <div
      className={`error-container ${isNetwork ? "error-container--network" : "error-container--api"}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="error-container__icon" aria-hidden="true">
        {isNetwork ? "🌐" : "⚠️"}
      </span>
      <div className="error-container__content">
        <strong className="error-container__title">
          {isNetwork ? "Erro de conexão" : "Erro da API"}
        </strong>
        <p className="error-container__message">{message}</p>
        {isNetwork && (
          <p className="error-container__hint">
            Verifique sua conexão com a internet e tente novamente.
          </p>
        )}
        {!isNetwork && (
          <p className="error-container__hint">
            Tente ajustar os filtros de busca. Algumas combinações podem não
            retornar resultados.
          </p>
        )}
      </div>
    </div>
  );
}