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
    fireEvent.change(screen.getByTestId('time-slider'), { target: { value: '0.5' } })
    const after = Number(screen.getByTestId('time-decay-price').textContent)
    expect(after).not.toBe(before)
  })

  it('ATM/ITM/OTM toggle changes strike', async () => {
    render(
      <I18nProvider>
        <TimeDecayDemo />
      </I18nProvider>,
    )

    const atmStrike = screen.getByTestId('time-decay-strike').textContent
    fireEvent.click(screen.getByTestId('moneyness-otm'))
    
    // Wait for the update if needed, but getByTestId checks immediately.
    // Use findByText to ensure we wait for re-render if it's async
    // However, if we just check for *change*, we can loop or wait.
    // But duplicate IDs are the real issue if AnimatePresence is used.
    // Let's use getAllByTestId and take the last one (usually entering)
    const strikes = await screen.findAllByTestId('time-decay-strike')
    const otmStrike = strikes[strikes.length - 1].textContent
    expect(otmStrike).not.toBe(atmStrike)
  })
})
