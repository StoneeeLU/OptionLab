import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, useI18n } from './I18nContext';
import { LanguageToggle } from './LanguageToggle';

const TestComponent = () => {
  const { t, language } = useI18n();
  return (
    <div>
      <p data-testid="lang">{language}</p>
      <p data-testid="title">{t('common.appTitle')}</p>
      <p data-testid="nested">{t('options.chain')}</p>
      <p data-testid="fallback">{t('common.onlyEnglish')}</p>
      <p data-testid="missing">{t('missing.key')}</p>
    </div>
  );
};

describe('I18n System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides translations for the default language (en)', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('title').textContent).toBe('OptionLab');
    expect(screen.getByTestId('nested').textContent).toBe('Options Chain');
  });

  it('returns the key if translation is missing', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('missing').textContent).toBe('missing.key');
  });

  it('switches language and updates translations', () => {
    render(
      <I18nProvider>
        <LanguageToggle />
        <TestComponent />
      </I18nProvider>
    );

    const toggle = screen.getByTestId('language-toggle');
    
    // Initial state: EN
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('title').textContent).toBe('OptionLab');

    // Click toggle to switch to ZH
    fireEvent.click(toggle);

    expect(screen.getByTestId('lang').textContent).toBe('zh');
    expect(screen.getByTestId('title').textContent).toBe('期权实验室');
    expect(toggle.textContent).toContain('ZH');

    // Click toggle again to switch back to EN
    fireEvent.click(toggle);

    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('title').textContent).toBe('OptionLab');
    expect(toggle.textContent).toContain('EN');
  });

  it('falls back to English if translation is missing in current language', () => {
    // Seed localStorage with 'zh'
    localStorage.setItem('optionlab-language', 'zh');
    
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('lang').textContent).toBe('zh');
    // 'common.onlyEnglish' is missing in zh.json, should show English value
    expect(screen.getByTestId('fallback').textContent).toBe('English Only Content');
  });

  it('persists language selection in localStorage', () => {
    const { unmount } = render(
      <I18nProvider>
        <LanguageToggle />
      </I18nProvider>
    );

    fireEvent.click(screen.getByTestId('language-toggle'));
    expect(localStorage.getItem('optionlab-language')).toBe('zh');

    unmount();

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('lang').textContent).toBe('zh');
  });
});
