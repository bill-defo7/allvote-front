import { adminApi } from '../../../api/endpoints'
import { useApi } from '../../../api/useApi'

/** Liste déroulante des organisateurs (filtre). value = id en texte, '' = tous. */
export default function FiltreOrganisateur({ value, onChange }) {
  const { data } = useApi(() => adminApi.organisateurs({ taille: 100 }), [])
  return (
    <select className="filtre" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Organisateur">
      <option value="">Tous les organisateurs</option>
      {(data?.contenu || []).map((o) => <option key={o.idOrganisateur} value={String(o.idOrganisateur)}>{o.nom}</option>)}
    </select>
  )
}
