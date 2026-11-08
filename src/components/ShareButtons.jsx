import { useToast } from '../context/ToastContext'

export default function ShareButtons({ title = 'AllVote', url }) {
  const { show } = useToast()
  const link = url || (typeof window !== 'undefined' ? window.location.href : 'https://allvote.cm')
  const txt = encodeURIComponent(`${title} — Soutiens tes candidats sur AllVote ! `)
  const u = encodeURIComponent(link)

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); show('✅ Lien copié !') }
    catch { show('Impossible de copier le lien') }
  }

  return (
    <div className="share" aria-label="Partager">
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Facebook" title="Facebook" style={{ fontWeight: 800 }}>f</a>
      <a href={`https://wa.me/?text=${txt}${u}`} target="_blank" rel="noopener noreferrer" aria-label="Partager sur WhatsApp" title="WhatsApp">💬</a>
      <a href={`https://twitter.com/intent/tweet?text=${txt}&url=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Partager sur X" title="X (Twitter)" style={{ fontWeight: 800 }}>𝕏</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Partager sur LinkedIn" title="LinkedIn" style={{ fontWeight: 800, fontSize: '.8rem' }}>in</a>
      <button onClick={copy} aria-label="Copier le lien" title="Copier le lien">🔗</button>
    </div>
  )
}
