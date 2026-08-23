import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps Tab/Shift+Tab focus inside containerRef while active, calls onEscape
 * on the Escape key, and restores focus to whatever was focused before
 * activation once it becomes inactive. Backs Modal and the Navbar mobile
 * drawer — the only two places in the app that need this.
 */
const useFocusTrap = (active, containerRef, { onEscape } = {}) => {
  const previouslyFocused = useRef(null)
  // Callers typically pass an inline `() => ...` for onEscape, which is a new
  // function every render. Reading it through a ref (updated every render,
  // but not itself a dependency) keeps the effect below from tearing down and
  // rebuilding — and yanking focus back out via its cleanup — on every
  // unrelated re-render while the trap is active.
  const onEscapeRef = useRef(onEscape)
  onEscapeRef.current = onEscape

  useEffect(() => {
    if (!active) return undefined

    const container = containerRef.current
    if (!container) return undefined

    previouslyFocused.current = document.activeElement

    const getFocusable = () =>
      Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null
      )

    const focusable = getFocusable()
    ;(focusable[0] || container).focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onEscapeRef.current?.()
        return
      }

      if (event.key !== 'Tab') return

      const items = getFocusable()
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [active, containerRef])
}

export default useFocusTrap
