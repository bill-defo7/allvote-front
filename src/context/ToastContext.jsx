import { createContext, useContext, useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ToastContext = createContext(null)
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)
  const timer = useRef(null)

  const show = useCallback((text) => {
    setMsg(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 3600)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <AnimatePresence>
        {msg && (
          <motion.div
            className="toast" role="status" aria-live="polite"
            initial={{ opacity: 0, y: 60, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 60, x: '-50%' }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  )
}
