import '@testing-library/jest-dom'

// Mock SVG and image imports
global.URL.createObjectURL = vi.fn(() => 'mock-url')
