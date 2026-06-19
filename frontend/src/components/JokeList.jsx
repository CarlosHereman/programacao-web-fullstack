import { useMemo } from "react";
import { useJoke } from "../contexts/JokeContext";
import JokeCard from "./JokeCard";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

export default function JokeList() {
  const { state } = useJoke();
  const { jokes, loading, error, apiError, lastSearch } = state;

  const searchSummary = useMemo(() => {
    if (!lastSearch) return null;
    const parts = [];
    if (lastSearch.category && lastSearch.category !== "Any") {
      parts.push(`categoria "${lastSearch.category}"`);
    }
    if (lastSearch.contains) {
      parts.push(`contendo "${lastSearch.contains}"`);
    }
    if (lastSearch.type) {
      parts.push(`tipo "${lastSearch.type}"`);
    }
    return parts.length > 0 ? parts.join(", ") : "qualquer filtro";
  }, [lastSearch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} type="network" />;
  }

  if (apiError) {
    return <ErrorMessage message={apiError} type="api" />;
  }

  if (!lastSearch) {
    return (
      <div className="empty-state">
        <span className="empty-state__emoji" aria-hidden="true">Busca</span>
        <p className="empty-state__text">
          Use o formulário acima para buscar piadas da JokeAPI.
        </p>
      </div>
    );
  }

  if (jokes.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__emoji" aria-hidden="true">Sem resultados</span>
        <p className="empty-state__text">
          Nenhuma piada encontrada para os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <section className="results-section">
      <div className="results-section__header">
        <h2 className="results-section__title">
          {jokes.length} {jokes.length === 1 ? "piada encontrada" : "piadas encontradas"}
        </h2>
        {searchSummary && (
          <p className="results-section__summary">
            Filtros aplicados: <em>{searchSummary}</em>
          </p>
        )}
      </div>

      <div className="joke-list">
        {jokes.map((joke, index) => (
          <JokeCard key={joke.id} joke={joke} index={index} />
        ))}
      </div>
    </section>
  );
}
