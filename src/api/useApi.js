import { useEffect, useRef, useState } from 'react'

/**
 * Charge des données depuis l'API.
 * - deps : relance le chargement quand elles changent
 * - refreshMs : rafraîchit en arrière-plan (sans écran de chargement), ex. scores en direct
 * En cas d'échec d'un rafraîchissement, on garde les dernières données affichées.
 *
 * Retour : { data, error, loading, reload (silencieux), recharger (avec écran de chargement) }
 */
export function useApi(fn, deps = [], { refreshMs } = {}) {
  const [nonce, setNonce] = useState(0)
  const cle = JSON.stringify(deps) + '|' + nonce
  const [state, setState] = useState({ cle: null, data: null, error: null })
  const fnRef = useRef(fn)
  const runRef = useRef(null)

  useEffect(() => { fnRef.current = fn })

  useEffect(() => {
    let actif = true
    const run = async (silencieux) => {
      try {
        const data = await fnRef.current()
        if (actif) setState({ cle, data, error: null })
      } catch (error) {
        if (!actif) return
        // rafraîchissement raté : on garde l'affichage précédent
        setState((s) => (silencieux && s.cle === cle ? s : { cle, data: null, error }))
      }
    }
    runRef.current = run
    run(false)
    let iv
    if (refreshMs) iv = setInterval(() => { if (!document.hidden) run(true) }, refreshMs)
    return () => { actif = false; if (iv) clearInterval(iv) }
  }, [cle, refreshMs])

  const aJour = state.cle === cle
  return {
    data: aJour ? state.data : null,
    error: aJour ? state.error : null,
    loading: !aJour,
    reload: () => runRef.current?.(true),
    recharger: () => setNonce((n) => n + 1),
  }
}
