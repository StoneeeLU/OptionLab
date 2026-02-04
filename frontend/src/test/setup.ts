import '@testing-library/jest-dom'

import { vi } from 'vitest'

vi.mock('echarts', () => {
  class LinearGradient {
    constructor(..._args: unknown[]) {
      void _args
    }
  }

  return {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
    })),
    graphic: {
      LinearGradient,
    },
    registerTheme: vi.fn(),
  }
})

vi.mock('echarts-gl', () => ({}))

// Mock SVG and image imports
if (!('createObjectURL' in URL)) {
  // @ts-expect-error - jsdom doesn't implement createObjectURL
  URL.createObjectURL = vi.fn(() => 'mock-url')
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
