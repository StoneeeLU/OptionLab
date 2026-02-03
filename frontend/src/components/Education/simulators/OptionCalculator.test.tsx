import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { I18nProvider } from '../../../i18n/I18nContext'
import { OptionCalculator } from './OptionCalculator'

describe('OptionCalculator', () => {
  it('updates call price when spot changes', () => {
    render(
      <I18nProvider>
        <OptionCalculator />
      </I18nProvider>,
    )

    const before = Number(screen.getByTestId('call-price').textContent)
    fireEvent.change(screen.getByTestId('input-spot'), { target: { value: '120' } })
    const after = Number(screen.getByTestId('call-price').textContent)
    expect(after).toBeGreaterThan(before)
  })

  it('renders greeks and they are finite', () => {
    render(
      <I18nProvider>
        <OptionCalculator />
      </I18nProvider>,
    )

    const delta = screen.getByTestId('call-greek-delta')
    expect(delta).toBeInTheDocument()
    ;['delta', 'gamma', 'theta', 'vega', 'rho'].forEach((id) => {
      const value = screen.getByTestId(`call-greek-${id}`).textContent ?? ''
      expect(value.includes('NaN')).toBe(false)
      expect(value.includes('Infinity')).toBe(false)
    })
  })

  it('handles edge case time = 0 without NaN', () => {
    render(
      <I18nProvider>
        <OptionCalculator />
      </I18nProvider>,
    )

    fireEvent.change(screen.getByTestId('input-time'), { target: { value: '0' } })
    expect(screen.getByTestId('call-price').textContent).not.toContain('NaN')
    expect(screen.getByTestId('put-price').textContent).not.toContain('NaN')
  })
})
