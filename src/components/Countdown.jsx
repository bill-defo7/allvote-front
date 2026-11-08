import { useEffect, useRef, useState } from 'react'
import { remaining } from '../utils/helpers'

function Box({ v, u }) {
  return <div className="cd-box"><div className="v">{String(v).padStart(2, '0')}</div><div className="u">{u}</div></div>
}

/** Compte à rebours calé sur l'heure du serveur. onDone : appelé une fois à zéro (ex. recharger). */
export default function Countdown({ target, small = false, onDone }) {
  const [, setTick] = useState(0)
  const doneRef = useRef(onDone)
  useEffect(() => { doneRef.current = onDone })

  useEffect(() => {
    let fini = remaining(target).done
    const iv = setInterval(() => {
      setTick((t) => t + 1)
      if (!fini && remaining(target).done) { fini = true; doneRef.current?.() }
    }, 1000)
    return () => clearInterval(iv)
  }, [target])

  const r = remaining(target)
  return (
    <div className={`countdown${small ? ' cd-sm' : ''}`} aria-label="Compte à rebours">
      <Box v={r.days} u="Jours" /><Box v={r.hours} u="Heures" />
      <Box v={r.mins} u="Min" /><Box v={r.secs} u="Sec" />
    </div>
  )
}
