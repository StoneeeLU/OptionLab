import { describe, expect, test } from 'vitest'

import { fadeIn, pageSlide, slideUp, stagger } from './animations'

describe('animations', () => {
  test('exports expected variants', () => {
    expect(fadeIn.hidden).toBeDefined()
    expect(slideUp.show).toBeDefined()
    expect(pageSlide.exit).toBeDefined()
    expect(stagger.show).toBeDefined()
  })
})
