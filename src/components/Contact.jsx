import ShareButtons from './ShareButtons'
import { CONTACT } from '../config'

/** Bloc partage + contact (accueil). Les coordonnées viennent du .env (masquées si vides). */
export default function Contact() {
  const aContact = CONTACT.tel || CONTACT.email
  return (
    <section id="contact" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <span className="sec-kicker">Partage &amp; contact</span>
        <h2 className="sec-title">Fais passer le <span className="blue-text">mot</span></h2>
        <p className="sec-sub">Partage AllVote et soutiens tes candidats. Une question ? Notre équipe reste disponible.</p>
        <ShareButtons url={typeof window !== 'undefined' ? window.location.origin : undefined} />
        {aContact && (
          <div style={{ textAlign: 'center', marginTop: 26, color: 'var(--muted)', fontSize: '.9rem' }}>
            {CONTACT.tel && <>📞 <b style={{ color: 'var(--text)' }}>{CONTACT.tel}</b></>}
            {CONTACT.tel && CONTACT.email && <> &nbsp;·&nbsp; </>}
            {CONTACT.email && <>✉️ <b style={{ color: 'var(--text)' }}>{CONTACT.email}</b></>}
          </div>
        )}
        {CONTACT.whatsapp && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-blue">💬 Discuter sur WhatsApp</a>
          </div>
        )}
      </div>
    </section>
  )
}
