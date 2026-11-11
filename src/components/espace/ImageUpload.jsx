import { useState } from 'react'
import { orgaApi } from '../../api/endpoints'
import { mediaUrl } from '../../utils/helpers'

const TYPES = ['image/jpeg', 'image/png']
const MAX = 5 * 1024 * 1024

/**
 * Choix d'une image (JPG/PNG ≤ 5 Mo) : envoyée tout de suite à l'API, qui la nettoie et la redimensionne.
 * value = "/uploads/xxx.jpg" ou null ; onChange(url|null)
 */
export default function ImageUpload({ id, label, value, onChange, rond = false, portrait = false }) {
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  const choisir = async (e) => {
    const f = e.target.files?.[0]; e.target.value = ''
    if (!f) return
    if (!TYPES.includes(f.type)) { setErreur('Formats acceptés : JPG ou PNG.'); return }
    if (f.size > MAX) { setErreur('Image trop lourde (5 Mo maximum).'); return }
    setEnvoi(true); setErreur('')
    try { onChange((await orgaApi.upload(f)).url) }
    catch (ex) { setErreur(ex.message) }
    finally { setEnvoi(false) }
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="img-up">
        <div className={`img-up-prev${rond ? ' rond' : portrait ? ' portrait' : ''}`}>
          {value ? <img src={mediaUrl(value)} alt="Aperçu" /> : <span>Aucune image</span>}
        </div>
        <div className="img-up-acts">
          <label className="btn btn-sm btn-ghost" htmlFor={id}>{envoi ? 'Envoi…' : value ? 'Changer' : 'Choisir une image'}</label>
          <input id={id} type="file" accept="image/jpeg,image/png" onChange={choisir} disabled={envoi} className="sr-only" />
          {value && <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange(null)}>Retirer</button>}
          <span className="hint">{portrait ? 'Format portrait 3:4 recommandé (JPG/PNG ≤ 5 Mo)' : 'JPG ou PNG, 5 Mo max.'}</span>
        </div>
      </div>
      {erreur && <div className="err">{erreur}</div>}
    </div>
  )
}
