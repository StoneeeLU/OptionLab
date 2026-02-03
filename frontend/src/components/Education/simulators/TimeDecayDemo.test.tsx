import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { I18nProvider } from '../../../i18n/I18nContext'
import { TimeDecayDemo } from './TimeDecayDemo'

describe('TimeDecayDemo', () => {
  it('time slider changes price display', () => {
    render(
      <I18nProvider>
        <TimeDecayDemo />
      </I18nProvider>,
    )

    const before = Number(screen.getByTestId('time-decay-price').textContent)
    fireEvent.change(screen.getByTestId('time-slider'), { target: { value: '0.1' } })
    const after = Number(screen.getByTestId('time-decay-price').textContent)
    expect(after).toBeLessThan(before)
  })

  it('ATM/ITM/OTM toggle changes strike', () => {
    render(
      <I18nProvider>
        <TimeDecayDemo />
      </I18nProvider>,
    )

    const atmStrike = screen.getByTestId('time-decay-strike').textContent
    fireEvent.click(screen.getByTestId('moneyness-otm'))
    const otmStrike = screen.getByTestId('time-decay-strike').textContent
    expect(otmStrike).not.toBe(atmStrike)
  })
})
