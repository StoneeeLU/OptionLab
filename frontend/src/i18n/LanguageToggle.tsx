import React from 'react';
import { useI18n } from './I18nContext';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage, t } = useI18n();

  return (
    <button
      onClick={toggleLanguage}
      data-testid="language-toggle"
      className="language-toggle-btn"
      title={t('common.language')}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color, #ccc)',
        backgroundColor: 'var(--bg-secondary, #f0f0f0)',
        color: 'var(--text-primary, #333)',
        cursor: 'pointer',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
      }}
    >
      {language === 'en' ? 'EN' : 'ZH'}
    </button>
  );
};
