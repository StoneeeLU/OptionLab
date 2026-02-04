import { describe, expect, it, vi, type Mock, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as echarts from 'echarts'
import { I18nProvider } from '../../../i18n/I18nContext'

// We will mock the VolatilitySurfaceChart to avoid complex 3D rendering tests here
// and just verify the toggle logic switches components
vi.mock('../../VolatilitySurfaceChart/VolatilitySurfaceChart', () => ({
  VolatilitySurfaceChart: () => <div data-testid="volatility-surface-mock">3D Surface</div>
}))

import { IVSmileChart } from './IVSmileChart'

describe('IVSmileChart', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders 2D chart by default and initializes echarts', () => {
    const initSpy = vi.spyOn(echarts, 'init')
    
    render(
      <I18nProvider>
        <IVSmileChart />
      </I18nProvider>
    )
    
    // Check for 2D chart container
    const chart2D = screen.getByTestId('iv-smile-chart-2d')
    expect(chart2D).toBeInTheDocument()
    
    // Verify echarts init called for 2D chart
    expect(initSpy).toHaveBeenCalled()
    const instance = initSpy.mock.results[0].value as unknown as { setOption: Mock }
    expect(instance.setOption).toHaveBeenCalled()
    
    // Check if toggle button exists
    expect(screen.getByRole('button', { name: /Switch to 3D Surface/i })).toBeInTheDocument()
  })

  it('toggles to 3D surface view when button is clicked', async () => {
    render(
      <I18nProvider>
        <IVSmileChart />
      </I18nProvider>
    )
    
    const toggleBtn = screen.getByRole('button', { name: /Switch to 3D Surface/i })
    fireEvent.click(toggleBtn)
    
    // 2D chart should disappear (or at least 3D should appear)
    expect(await screen.findByTestId('volatility-surface-mock')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Switch to 2D Smile/i })).toBeInTheDocument()
    
    // Toggle back
    fireEvent.click(screen.getByRole('button', { name: /Switch to 2D Smile/i }))
    expect(screen.getByTestId('iv-smile-chart-2d')).toBeInTheDocument()
  })
})
