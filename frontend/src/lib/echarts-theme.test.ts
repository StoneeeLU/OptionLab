import { describe, expect, it } from 'vitest'

import {
  getOptionLabEChartsThemeName,
  optionlabEChartsThemeDark,
  optionlabEChartsThemeLight,
  registerOptionLabEChartsThemes,
} from './echarts-theme'

describe('echarts-theme', () => {
  it('maps theme name correctly', () => {
    expect(getOptionLabEChartsThemeName('dark')).toBe('optionlab-dark')
    expect(getOptionLabEChartsThemeName('light')).toBe('optionlab-light')
  })

  it('exports coherent theme tokens', () => {
    expect(optionlabEChartsThemeDark.textStyle.color).toBe('#c9d1d9')
    expect(optionlabEChartsThemeLight.textStyle.color).toBe('#1a1a1a')
  })

  it('registers themes without throwing', () => {
    expect(() => registerOptionLabEChartsThemes()).not.toThrow()
    expect(() => registerOptionLabEChartsThemes()).not.toThrow()
  })
})
