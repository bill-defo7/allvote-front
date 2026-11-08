import { Helmet } from 'react-helmet-async'
import { SITE_URL, SITE_NAME } from '../config'

const OG = `${SITE_URL}/og-image.jpg`

export default function Seo({ title, description, path = '/', noindex = false, image = OG }) {
  const full = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Votez pour vos candidats en ligne`
  const desc = description || 'AllVote : la plateforme de vote en ligne pour vos concours et événements. Paiement MTN Mobile Money et Orange Money.'
  const url = `${SITE_URL}${path}`
  return (
    <Helmet>
      <title>{full}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={full} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
