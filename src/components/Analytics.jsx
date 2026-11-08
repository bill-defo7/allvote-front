import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useUi } from '../context/UiContext'

// Google Analytics 4 — chargé UNIQUEMENT après consentement cookies.
// L'ID de mesure se met dans .env : VITE_GA_ID=G-XXXXXXXXXX
const GA_ID = import.meta.env.VITE_GA_ID

export default function Analytics() {
  const { consent } = useUi()
  const location = useLocation()

  useEffect(() => {
    if (consent !== 'accepted' || !GA_ID) return
    if (window.gtag) return
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(s)
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', GA_ID, { anonymize_ip: true })
  }, [consent])

  useEffect(() => {
    if (consent === 'accepted' && GA_ID && window.gtag) {
      window.gtag('event', 'page_view', { page_path: location.pathname + location.hash })
    }
  }, [location, consent])

  return null
}
