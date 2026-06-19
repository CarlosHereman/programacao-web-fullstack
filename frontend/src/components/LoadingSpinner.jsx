export default function LoadingSpinner() {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="loading-text">Buscando piadas...</p>
    </div>
  );
}
