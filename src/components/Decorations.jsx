import { useEffect, useRef, useState } from 'react'

export function ScrollProgress() {
  const [w, setW] = useState(0)
  useEffect(() => {
    const on = () => {
      const h = document.body.scrollHeight - window.innerHeight
      setW(h > 0 ? (window.scrollY / h) * 100 : 0)
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return <div id="scrollProgress" style={{ width: `${w}%` }} />
}

export function Particles() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const cx = cv.getContext('2d')
    let raf, ps = []
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight }
    resize()
    for (let i = 0; i < 55; i++) ps.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, r: Math.random() * 1.8 + 0.4, s: Math.random() * 0.4 + 0.1 })
    const loop = () => {
      cx.clearRect(0, 0, cv.width, cv.height)
      ps.forEach((p) => {
        p.y -= p.s; if (p.y < 0) p.y = cv.height
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7)
        cx.fillStyle = 'rgba(212,175,55,.6)'; cx.fill()
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas id="particles" ref={ref} aria-hidden="true" />
}
