import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { I18nProvider } from '../../../i18n/I18nContext'
import { GreeksSensitivityExplorer } from './GreeksSensitivityExplorer'

describe('GreeksSensitivityExplorer', () => {
  it('renders 5 sliders with correct labels', () => {
    render(
      <I18nProvider>
        <GreeksSensitivityExplorer />
      </I18nProvider>
    )

    expect(screen.getByTestId('input-spot')).toBeInTheDocument()
    expect(screen.getByTestId('input-strike')).toBeInTheDocument()
    expect(screen.getByTestId('input-rate')).toBeInTheDocument()
    expect(screen.getByTestId('input-volatility')).toBeInTheDocument()
    expect(screen.getByTestId('input-time')).toBeInTheDocument()
  })

  it('displays 5 Greek values', () => {
    render(
      <I18nProvider>
        <GreeksSensitivityExplorer />
      </I18nProvider>
    )

    expect(screen.getByTestId('greek-delta')).toBeInTheDocument()
    expect(screen.getByTestId('greek-gamma')).toBeInTheDocument()
    expect(screen.getByTestId('greek-theta')).toBeInTheDocument()
    expect(screen.getByTestId('greek-vega')).toBeInTheDocument()
    expect(screen.getByTestId('greek-rho')).toBeInTheDocument()
  })

  it('updates greek values when slider changes', async () => {
    render(
      <I18nProvider>
        <GreeksSensitivityExplorer />
      </I18nProvider>
    )

    const deltaBefore = screen.getByTestId('greek-value-delta').textContent

    
    // Change Spot Price
    fireEvent.change(screen.getByTestId('input-spot'), { target: { value: '120' } })
    
    // Wait for debounce
    await screen.findByText((content, element) => {
        return element?.getAttribute('data-testid') === 'greek-value-delta' && content !== deltaBefore
    })

  })

  it('toggles between Call and Put and updates Delta sign', () => {
    render(
      <I18nProvider>
        <GreeksSensitivityExplorer />
      </I18nProvider>
    )

    // Default is Call (Delta > 0)
    const callDelta = parseFloat(screen.getByTestId('greek-value-delta').textContent || '0')
    expect(callDelta).toBeGreaterThan(0)

    // Switch to Put
    const toggle = screen.getByTestId('toggle-type')
    fireEvent.click(toggle)

    // Put Delta should be negative
    const putDelta = parseFloat(screen.getByTestId('greek-value-delta').textContent || '0')
    expect(putDelta).toBeLessThan(0)
  })

  it('i18n labels work', () => {
     // Checking default English labels first
     render(
      <I18nProvider>
        <GreeksSensitivityExplorer />
      </I18nProvider>
    )
    expect(screen.getByText(/Spot/i)).toBeInTheDocument()
  })
})
