/** États d'écran partagés : chargement et erreur. */

export function Chargement({ texte = 'Chargement…' }) {
  return (
    <div className="etat" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{texte}</p>
    </div>
  )
}

export function Erreur({ error, onRetry }) {
  return (
    <div className="etat etat-err" role="alert">
      <p>⚠️ {error?.message || 'Une erreur est survenue.'}</p>
      {onRetry && <button className="btn btn-ghost btn-sm" onClick={onRetry}>Réessayer</button>}
    </div>
  )
}
