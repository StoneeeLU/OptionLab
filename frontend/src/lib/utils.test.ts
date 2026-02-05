import { describe, expect, test } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  test('merges and dedupes tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('px-2 py-2', 'p-4')).toBe('p-4')
  })

  test('handles conditional class values', () => {
    const enabled = false
    expect(cn('a', enabled && 'b', 'c')).toBe('a c')
  })
})
