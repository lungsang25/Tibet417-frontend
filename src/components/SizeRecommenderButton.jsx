import React from 'react';
import { useTranslation } from 'react-i18next';

const SizeRecommenderButton = ({ onClick, className = '' }) => {
  const { t } = useTranslation('sizeRecommender');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-sm text-ink underline hover:no-underline ${className}`}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
      {t('buttonText')}
    </button>
  );
};

export default SizeRecommenderButton;
