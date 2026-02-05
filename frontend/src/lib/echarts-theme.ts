import * as echarts from 'echarts'

export type OptionLabThemeMode = 'light' | 'dark'
export type OptionLabEChartsThemeName = 'optionlab-light' | 'optionlab-dark'

export const optionlabEChartsThemeLight = {
  backgroundColor: 'transparent',
  color: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
  textStyle: {
    color: '#1a1a1a',
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  title: {
    textStyle: { color: '#1a1a1a' },
  },
  legend: {
    textStyle: { color: '#666666' },
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#d0d0d0',
    textStyle: { color: '#1a1a1a' },
  },
  axisPointer: {
    lineStyle: { color: '#2563eb' },
    crossStyle: { color: '#2563eb' },
    label: { color: '#ffffff', backgroundColor: '#2563eb' },
  },
  grid: {
    borderColor: '#d0d0d0',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#d0d0d0' } },
    axisTick: { lineStyle: { color: '#d0d0d0' } },
    axisLabel: { color: '#666666' },
    splitLine: { lineStyle: { color: '#d0d0d0', type: 'dashed' } },
    splitArea: { areaStyle: { color: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.02)'] } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: '#d0d0d0' } },
    axisTick: { lineStyle: { color: '#d0d0d0' } },
    axisLabel: { color: '#666666' },
    splitLine: { lineStyle: { color: '#d0d0d0', type: 'dashed' } },
    splitArea: { areaStyle: { color: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.02)'] } },
  },
} as const

export const optionlabEChartsThemeDark = {
  backgroundColor: 'transparent',
  color: ['#58a6ff', '#3fb950', '#d29922', '#f85149', '#79c0ff'],
  textStyle: {
    color: '#c9d1d9',
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  title: {
    textStyle: { color: '#c9d1d9' },
  },
  legend: {
    textStyle: { color: '#8b949e' },
  },
  tooltip: {
    backgroundColor: '#161b22',
    borderColor: '#30363d',
    textStyle: { color: '#c9d1d9' },
  },
  axisPointer: {
    lineStyle: { color: '#58a6ff' },
    crossStyle: { color: '#58a6ff' },
    label: { color: '#0d1117', backgroundColor: '#58a6ff' },
  },
  grid: {
    borderColor: '#30363d',
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#30363d' } },
    axisTick: { lineStyle: { color: '#30363d' } },
    axisLabel: { color: '#8b949e' },
    splitLine: { lineStyle: { color: '#30363d', type: 'dashed' } },
    splitArea: { areaStyle: { color: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)'] } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: '#30363d' } },
    axisTick: { lineStyle: { color: '#30363d' } },
    axisLabel: { color: '#8b949e' },
    splitLine: { lineStyle: { color: '#30363d', type: 'dashed' } },
    splitArea: { areaStyle: { color: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)'] } },
  },
} as const

export function getOptionLabEChartsThemeName(theme: OptionLabThemeMode): OptionLabEChartsThemeName {
  return theme === 'dark' ? 'optionlab-dark' : 'optionlab-light'
}

let themesRegistered = false

export function registerOptionLabEChartsThemes() {
  if (themesRegistered) return

  echarts.registerTheme('optionlab-light', optionlabEChartsThemeLight)
  echarts.registerTheme('optionlab-dark', optionlabEChartsThemeDark)

  themesRegistered = true
}
