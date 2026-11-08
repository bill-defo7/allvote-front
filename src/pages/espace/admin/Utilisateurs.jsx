import { useEffect, useState } from 'react'
import Seo from '../../../components/Seo'
import { Chargement, Erreur } from '../../../components/Etat'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { adminApi } from '../../../api/endpoints'
import { useApi } from '../../../api/useApi'
import { fmtDate } from '../../../utils/helpers'

const ROLE = { SUPER_ADMIN: 'Super-admin', ORGA_ADMIN: 'Responsable', ORGA_MEMBRE: 'Membre' }

export default function Utilisateurs() {
  const { utilisateur } = useAuth()
  const { show } = useToast()
  const [saisie, setSaisie] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  useEffect(() => { const t = setTimeout(() => { setQ(saisie.trim()); setPage(0) }, 400); return () => clearTimeout(t) }, [saisie])
  const { data, error, loading, recharger, reload } = useApi(() => adminApi.utilisateurs({ q: q || undefined, page }), [q, page])

  const action = async (fn, msg) => { try { await fn(); show(`✅ ${msg}`); reload() } catch (ex) { show(`⚠️ ${ex.message}`) } }

  return (
    <>
      <Seo path="/espace/utilisateurs" title="Utilisateurs" noindex />
      <div className="admin-top">
        <h1><span className="gold-text">Utilisateurs</span></h1>
        <input type="search" className="filtre" style={{ minWidth: 260 }} placeholder="Rechercher (email ou nom)…" value={saisie} onChange={(e) => setSaisie(e.target.value)} aria-label="Rechercher un utilisateur" />
      </div>
      <div className="panel">
        {loading && <Chargement />}
        {error && <Erreur error={error} onRetry={recharger} />}
        {data && data.contenu.length === 0 && <p className="hint">Aucun utilisateur trouvé.</p>}
        {data && data.contenu.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Organisation</th><th>Dernière connexion</th><th>État</th><th /></tr></thead>
              <tbody>
                {data.contenu.map((u) => {
                  const moi = u.idUtilisateur === utilisateur?.idUtilisateur
                  const sa = u.roles.includes('SUPER_ADMIN')
                  return (
                    <tr key={u.idUtilisateur}>
                      <td><b>{u.prenom} {u.nom}</b>{moi && <span className="hint"> (vous)</span>}</td>
                      <td>{u.email}</td>
                      <td>{u.roles.map((r) => ROLE[r] || r).join(', ')}</td>
                      <td>{u.organisateurNom || '—'}</td>
                      <td>{u.derniereConnexion ? fmtDate(u.derniereConnexion) : '—'}</td>
                      <td>
                        <span className={`badge ${u.actif ? 'b-open' : 'b-closed'}`}>{u.actif ? 'Actif' : 'Désactivé'}</span>
                        {u.verrouille && <> <span className="badge b-echoue">Verrouillé</span></>}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {u.verrouille && <button className="btn btn-sm btn-gold" onClick={() => action(() => adminApi.deverrouiller(u.idUtilisateur), 'Compte déverrouillé')}>Déverrouiller</button>}{' '}
                        {!moi && !sa && (
                          <button className="btn btn-sm btn-ghost" onClick={() => {
                            if (!u.actif || confirm(`Désactiver le compte de ${u.prenom} ${u.nom} ? Il sera déconnecté immédiatement.`)) {
                              action(() => adminApi.activerUtilisateur(u.idUtilisateur, !u.actif), u.actif ? 'Compte désactivé' : 'Compte réactivé')
                            }
                          }}>{u.actif ? 'Désactiver' : 'Réactiver'}</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="pager">
            <button className="btn btn-sm btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>←</button>
            <span className="hint">Page {page + 1} / {data.totalPages}</span>
            <button className="btn btn-sm btn-ghost" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>→</button>
          </div>
        )}
      </div>
    </>
  )
}
