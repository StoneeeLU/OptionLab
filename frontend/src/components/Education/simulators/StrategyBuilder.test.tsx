import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { calculateGreeks } from '../../../utils/blackScholes'
import { I18nProvider } from '../../../i18n/I18nContext'
import { StrategyBuilder } from './StrategyBuilder'

describe('StrategyBuilder', () => {
  it('adds and removes legs', () => {
    render(
      <I18nProvider>
        <StrategyBuilder />
      </I18nProvider>,
    )

    const before = screen.getAllByTestId('leg-row').length
    fireEvent.click(screen.getByTestId('add-leg'))
    const afterAdd = screen.getAllByTestId('leg-row').length
    expect(afterAdd).toBeGreaterThan(before)

    const removeButtons = screen.getAllByTestId('remove-leg') as HTMLElement[]
    fireEvent.click(removeButtons[removeButtons.length - 1])
    const afterRemove = screen.getAllByTestId('leg-row').length
    expect(afterRemove).toBe(afterAdd - 1)
  })

  it('computes combined greeks for two legs', () => {
    render(
      <I18nProvider>
        <StrategyBuilder />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByTestId('add-leg'))
    const legRows = screen.getAllByTestId('leg-row') as HTMLElement[]
    expect(legRows.length).toBe(2)

    const firstId = legRows[0].getAttribute('data-leg-id') as string
    const secondId = legRows[1].getAttribute('data-leg-id') as string

    fireEvent.change(screen.getByTestId(`leg-strike-${firstId}`), { target: { value: '100' } })
    fireEvent.change(screen.getByTestId(`leg-strike-${secondId}`), { target: { value: '110' } })
    fireEvent.change(screen.getByTestId(`leg-side-${secondId}`), { target: { value: 'sell' } })

    const spot = 100
    const rate = 0.05
    const volatility = 0.2
    const time = 1

    const g1 = calculateGreeks('call', spot, 100, rate, volatility, time)
    const g2 = calculateGreeks('call', spot, 110, rate, volatility, time)
    const expectedDelta = g1.delta - g2.delta

    const shown = Number(screen.getByTestId('combined-delta').textContent)
    expect(Math.abs(shown - Number(expectedDelta.toFixed(4)))).toBeLessThanOrEqual(0.001)
  })

  it('recognizes Bull Call Spread', () => {
    render(
      <I18nProvider>
        <StrategyBuilder />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByTestId('add-leg'))
    const legRows = screen.getAllByTestId('leg-row') as HTMLElement[]
    const firstId = legRows[0].getAttribute('data-leg-id') as string
    const secondId = legRows[1].getAttribute('data-leg-id') as string

    fireEvent.change(screen.getByTestId(`leg-strike-${firstId}`), { target: { value: '100' } })
    fireEvent.change(screen.getByTestId(`leg-strike-${secondId}`), { target: { value: '110' } })
    fireEvent.change(screen.getByTestId(`leg-side-${secondId}`), { target: { value: 'sell' } })
    fireEvent.change(screen.getByTestId(`leg-type-${secondId}`), { target: { value: 'call' } })

    expect(screen.getByTestId('strategy-name').textContent).toMatch(/Bull Call Spread/i)
  })
})
