import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * A removable pill for one active filter (category, subcategory, search
 * term). Used by Collection's active-filters row.
 */
const FilterChip = ({ label, onRemove }) => {
  const { t } = useTranslation('common')

  return (
    <span className='inline-flex items-center gap-2 border border-line px-3 py-1 text-xs text-ink'>
      {label}
      <button
        type='button'
        onClick={onRemove}
        aria-label={t('filterChip.remove', { label })}
        className='cursor-pointer bg-transparent border-0 p-0 text-stone hover:text-ink leading-none'
      >
        ×
      </button>
    </span>
  )
}

export default FilterChip
