import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Note: In JSDOM, importing CSS doesn't automatically apply it to the document.
// We need to manually inject it for testing computed styles.
const cssPath = path.resolve(__dirname, './theme.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const variableNames = [
  '--options-call-bg',
  '--options-call-text',
  '--options-put-bg',
  '--options-put-text',
  '--options-strike-bg',
  '--options-atm-border',
  '--options-atm-bg',
  '--options-atm-text',
  '--options-itm-bg',
  '--options-otm-bg',
  '--options-selected-bg',
  '--options-selected-border',
  '--options-hover-bg',
  '--options-iv-low',
  '--options-iv-mid',
  '--options-iv-high',
  '--options-volume-low',
  '--options-volume-high'
];

describe('Theme CSS Variables', () => {
  beforeAll(() => {
    const style = document.createElement('style');
    style.innerHTML = cssContent;
    document.head.appendChild(style);
  });

  const themes = ['light', 'dark'] as const;

  themes.forEach((theme) => {
    it(`should have all options chain variables defined for ${theme} theme`, () => {
      document.documentElement.setAttribute('data-theme', theme);
      
      const computedStyle = getComputedStyle(document.documentElement);
      
      variableNames.forEach((name) => {
        const value = computedStyle.getPropertyValue(name).trim();
        expect(value, `Variable ${name} should not be empty for ${theme} theme`).not.toBe('');
      });
    });
  });
});
