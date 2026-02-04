import { useEffect, useMemo, useRef, useState, Suspense, lazy } from 'react'
import * as echarts from 'echarts'
import type { TooltipComponentFormatterCallbackParams } from 'echarts'
import { registerOptionLabEChartsThemes } from '../../../lib/echarts-theme'
import { GlassPanel } from '../../common/GlassPanel'
import { useI18n } from '../../../i18n/I18nContext'
import './IVSmileChart.css'

// Lazy load VolatilitySurfaceChart to avoid heavy 3D bundle if not used
// Note: In a real app we might put this in a separate chunk
// We import directly for now as per requirements to "lazy-load" but given it's in the same project structure
// we can use dynamic import.
// However, for TS types we might need to import the type or define it.
// To satisfy the requirement "lazy-load", we'll use React.lazy.
const VolatilitySurfaceChart = lazy(() => 
  import('../../VolatilitySurfaceChart/VolatilitySurfaceChart').then(module => ({ default: module.VolatilitySurfaceChart }))
)

const sampleIVSmile = [
  { strike: 80, iv: 0.35 },
  { strike: 85, iv: 0.31 },
  { strike: 90, iv: 0.28 },
  { strike: 95, iv: 0.24 },
  { strike: 100, iv: 0.22 }, // ATM
  { strike: 105, iv: 0.23 },
  { strike: 110, iv: 0.26 },
  { strike: 115, iv: 0.29 },
  { strike: 120, iv: 0.32 },
  { strike: 125, iv: 0.36 },
]

const mockSurfaceData = {
  surface_data: [
    // [strike, days, iv] - Simplified mock data
    [80, 30, 0.35], [90, 30, 0.28], [100, 30, 0.22], [110, 30, 0.26], [120, 30, 0.32],
    [80, 60, 0.36], [90, 60, 0.29], [100, 60, 0.23], [110, 60, 0.27], [120, 60, 0.33],
    [80, 90, 0.37], [90, 90, 0.30], [100, 90, 0.24], [110, 90, 0.28], [120, 90, 0.34],
  ],
  strikes: [80, 90, 100, 110, 120],
  expiries: ['2023-06-01', '2023-07-01', '2023-08-01'],
  days_to_expiry: [30, 60, 90]
}

export function IVSmileChart() {
  const { language } = useI18n()
  const [is3D, setIs3D] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  // Register themes once
  useEffect(() => {
    registerOptionLabEChartsThemes()
  }, [])

  const labels = useMemo(() => ({
    title: language === 'zh' ? '波动率微笑' : 'IV Smile',
    subtitle: language === 'zh' ? '隐含波动率 vs 行权价' : 'Implied Volatility vs Strike Price',
    toggle2D: language === 'zh' ? '切换到 2D 微笑' : 'Switch to 2D Smile',
    toggle3D: language === 'zh' ? '切换到 3D 曲面' : 'Switch to 3D Surface',
    btn2D: language === 'zh' ? '2D 微笑' : '2D Smile',
    btn3D: language === 'zh' ? '3D 曲面' : '3D Surface',
    xAxis: language === 'zh' ? '行权价' : 'Strike Price',
    yAxis: language === 'zh' ? '隐含波动率' : 'Implied Volatility',
    seriesName: language === 'zh' ? 'IV 微笑' : 'IV Smile',
    loading3D: language === 'zh' ? '加载 3D 视图...' : 'Loading 3D View...',
  }), [language])

  // Setup 2D Chart
  useEffect(() => {
    if (is3D || !chartRef.current) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'optionlab-light')
    }

    const chart = chartInstance.current

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: TooltipComponentFormatterCallbackParams) => {
          const p = Array.isArray(params) ? params[0] : params
          const value = Array.isArray(p.value) ? p.value : []
          return `${p.marker} ${labels.xAxis}: $${value[0]}<br/>${labels.yAxis}: ${(Number(value[1]) * 100).toFixed(1)}%`
        }
      },
      grid: {
        left: 50,
        right: 30,
        top: 30,
        bottom: 50,
      },
      xAxis: {
        type: 'value',
        name: labels.xAxis,
        nameLocation: 'middle',
        nameGap: 30,
        min: 'dataMin',
        max: 'dataMax',
      },
      yAxis: {
        type: 'value',
        name: labels.yAxis,
        nameLocation: 'middle',
        nameGap: 40,
        axisLabel: {
          formatter: (value: number) => `${(value * 100).toFixed(0)}%`
        }
      },
      series: [
        {
          name: labels.seriesName,
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          data: sampleIVSmile.map(d => [d.strike, d.iv]),
          lineStyle: {
            width: 3,
            color: '#2563eb'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(37, 99, 235, 0.2)' },
              { offset: 1, color: 'rgba(37, 99, 235, 0.0)' }
            ])
          }
        }
      ]
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [is3D, labels])

  return (
    <GlassPanel variant="subtle" className={`iv-smile-chart ${is3D ? 'view-3d' : ''}`}>
      <div className="iv-smile-chart-header">
        <div>
          <h3>{labels.title}</h3>
          <p className="subtitle">{labels.subtitle}</p>
        </div>
        <div className="iv-smile-chart-controls">
          <button 
            className="iv-smile-toggle-btn"
            onClick={() => setIs3D(!is3D)}
            aria-label={is3D ? labels.toggle2D : labels.toggle3D}
          >
            {is3D ? labels.btn2D : labels.btn3D}
          </button>
        </div>
      </div>
      
      {is3D ? (
        <Suspense fallback={<div className="loading">{labels.loading3D}</div>}>
          <VolatilitySurfaceChart data={mockSurfaceData} />
        </Suspense>
      ) : (
        <div 
          className="iv-smile-chart-canvas" 
          ref={chartRef} 
          data-testid="iv-smile-chart-2d"
          role="img" 
          aria-label={labels.title}
        />
      )}
    </GlassPanel>
  )
}
