import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

let activePortalCount = 0
let previousBodyOverflow = ''

export function ModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (activePortalCount === 0) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    activePortalCount += 1

    return () => {
      activePortalCount = Math.max(0, activePortalCount - 1)
      if (activePortalCount === 0) {
        document.body.style.overflow = previousBodyOverflow
      }
    }
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}
