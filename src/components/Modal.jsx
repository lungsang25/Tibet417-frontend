import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import useFocusTrap from '../hooks/useFocusTrap'

/**
 * Shared dialog primitive. Replaces PlaceOrder's raw-DOM Twint QR modal
 * (document.createElement + innerHTML) and backs the PDP image lightbox —
 * both need the same portal/focus-trap/scroll-lock behavior.
 */
const Modal = ({ isOpen, onClose, titleId, children, className = '' }) => {
  const containerRef = useRef(null)

  useFocusTrap(isOpen, containerRef, { onEscape: onClose })

  useEffect(() => {
    if (!isOpen) return undefined
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-ink/50'
        onClick={onClose}
        aria-hidden='true'
      />
      <div
        ref={containerRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative bg-paper shadow-modal max-h-[90vh] overflow-y-auto outline-none ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Modal
