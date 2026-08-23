import React from 'react'

/**
 * Shared loading spinner, extracted from VerifyTwint.jsx's already-correct
 * pattern and re-themed onto the ink/stone tokens. Used as the route-level
 * Suspense fallback and to fix Verify.jsx/Orders.jsx's missing loading states.
 */
const PageLoader = ({ title, label }) => {
  return (
    <div className='min-h-[60vh] flex items-center justify-center' role='status'>
      <div className='text-center'>
        <div className='w-16 h-16 border-4 border-line border-t-ink rounded-full animate-spin mx-auto mb-4' aria-hidden='true' />
        {title && <p className='text-lg'>{title}</p>}
        {label && <p className='text-sm text-stone mt-2'>{label}</p>}
      </div>
    </div>
  )
}

export default PageLoader
