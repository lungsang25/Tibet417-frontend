import React, { forwardRef } from 'react'

/**
 * Replaces the `<img onClick>` pattern used throughout the app for icon
 * triggers (search, hamburger, cart delete, etc.) — those aren't focusable or
 * operable via keyboard and have no accessible name. This renders a real
 * button with the icon as decorative content. Forwards its ref so callers can
 * restore focus to the trigger after closing whatever it opened.
 */
const IconButton = forwardRef(({ icon, label, onClick, className = '', iconClassName = 'w-5', badge, type = 'button', ...rest }, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      aria-label={label}
      className={`relative inline-flex items-center justify-center cursor-pointer bg-transparent border-0 p-0 ${className}`}
      {...rest}
    >
      <img src={icon} alt='' className={iconClassName} />
      {badge}
    </button>
  )
})

export default IconButton
