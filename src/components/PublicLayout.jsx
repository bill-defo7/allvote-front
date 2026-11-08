import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CookieBanner from './CookieBanner'
import Analytics from './Analytics'
import { ScrollProgress, Particles } from './Decorations'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])
  return null
}

export default function PublicLayout() {
  return (
    <>
      <ScrollProgress />
      <Particles />
      <Analytics />
      <ScrollManager />
      <Navbar />
      <div className="wrap">
        <Outlet />
        <Footer />
      </div>
      <CookieBanner />
    </>
  )
}
