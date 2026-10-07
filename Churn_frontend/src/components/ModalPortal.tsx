import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

let activePortalCount = 0
let previousBodyOverflow = ''
// Stack of open portals so Escape only closes the top-most modal.
const escapeStack: Array<{ current: (() => void) | undefined }> = []

export function ModalPortal({ children, onEscape }: { children: ReactNode; onEscape?: () => void }) {
  const [mounted, setMounted] = useState(false)
  const escapeRef = useRef(onEscape)
  escapeRef.current = onEscape

  useEffect(() => {
    setMounted(true)

    if (activePortalCount === 0) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    activePortalCount += 1
    escapeStack.push(escapeRef)

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (escapeStack[escapeStack.length - 1] !== escapeRef) return
      escapeRef.current?.()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      const index = escapeStack.indexOf(escapeRef)
      if (index !== -1) escapeStack.splice(index, 1)
      activePortalCount = Math.max(0, activePortalCount - 1)
      if (activePortalCount === 0) {
        document.body.style.overflow = previousBodyOverflow
      }
    }
  }, [])

  if (!mounted) return null

  return createPortal(children, document.body)
}
