import { describe, expect, it, vi, type Mock } from 'vitest'
import { render } from '@testing-library/react'
import * as echarts from 'echarts'

import { PayoffChart, type PayoffLeg } from './PayoffChart'

describe('PayoffChart', () => {
  it('renders chart and marks breakeven for a single call', () => {
    const initSpy = vi.spyOn(echarts, 'init')
    const legs: PayoffLeg[] = [{ type: 'call', side: 'buy', quantity: 1, strike: 100 }]

    render(<PayoffChart legs={legs} spotHint={100} />)

    expect(initSpy).toHaveBeenCalled()
    const instance = initSpy.mock.results[0].value as unknown as { setOption: Mock }
    expect(instance.setOption).toHaveBeenCalled()

    const optionArg = instance.setOption.mock.calls[0][0] as unknown as {
      xAxis?: { name?: string }
      series?: Array<{ markLine?: { data?: Array<{ xAxis?: number }> } }>
    }

    expect(optionArg.xAxis?.name).toBe('Stock Price')
    const markData = optionArg.series?.[0]?.markLine?.data ?? []
    const beValues = markData.map((d) => d.xAxis)
    expect(beValues).toContain(100)
  })

  it('disposes chart on unmount', () => {
    const initSpy = vi.spyOn(echarts, 'init')
    const legs: PayoffLeg[] = [{ type: 'put', side: 'buy', quantity: 1, strike: 100 }]

    const { unmount } = render(<PayoffChart legs={legs} spotHint={100} />)
    const instance = initSpy.mock.results[0].value as unknown as { dispose: Mock }

    unmount()
    expect(instance.dispose).toHaveBeenCalled()
  })
})
