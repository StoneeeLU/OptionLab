import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import 'echarts-gl';
import './VolatilitySurfaceChart.css';

type TooltipPoint = [number, number, number]

type TooltipParams = {
  data?: TooltipPoint
  value?: TooltipPoint
}

interface SurfaceData {
  surface_data: number[][]; // [strike, days, iv]
  strikes: number[];
  expiries: string[];
  days_to_expiry: number[];
}

interface Props {
  data: SurfaceData | null;
  loading?: boolean;
}

export function VolatilitySurfaceChart({ data, loading = false }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    // Prepare grid data for 3D surface
    const gridData = data.surface_data.map((point) => [
      point[0], // strike (x)
      point[1], // days to expiry (y)
      point[2]  // IV (z)
    ]);

    const option: echarts.EChartsOption = {
      tooltip: {
        formatter: (params: unknown) => {
          const p = params as TooltipParams
          const dataPoint = (p.data ?? p.value ?? [0, 0, 0]) as TooltipPoint
          return (
            `Strike: $${dataPoint[0].toFixed(2)}<br/>` +
            `Days: ${dataPoint[1]}<br/>` +
            `IV: ${(dataPoint[2] * 100).toFixed(2)}%`
          )
        }
      },
      visualMap: {
        show: true,
        dimension: 2,
        min: Math.min(...gridData.map(d => d[2])),
        max: Math.max(...gridData.map(d => d[2])),
        inRange: {
          color: [
            '#313695', '#4575b4', '#74add1', '#abd9e9',
            '#e0f3f8', '#ffffbf', '#fee090', '#fdae61',
            '#f46d43', '#d73027', '#a50026'
          ]
        },
        text: ['High IV', 'Low IV'],
        calculable: true,
        bottom: 20,
        left: 'center',
        orient: 'horizontal'
      },
      xAxis3D: {
        name: 'Strike Price',
        type: 'value',
        nameTextStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      yAxis3D: {
        name: 'Days to Expiry',
        type: 'value',
        nameTextStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      zAxis3D: {
        name: 'Implied Volatility',
        type: 'value',
        nameTextStyle: { fontSize: 14, fontWeight: 'bold' },
        axisLabel: {
          formatter: (value: number) => `${(value * 100).toFixed(0)}%`
        }
      },
      grid3D: {
        viewControl: {
          projection: 'perspective',
          autoRotate: false,
          distance: 200,
          alpha: 30,
          beta: 40,
          rotateSensitivity: 1,
          zoomSensitivity: 1,
          panSensitivity: 1
        },
        boxWidth: 100,
        boxHeight: 50,
        boxDepth: 80,
        light: {
          main: {
            intensity: 1.2,
            shadow: true
          },
          ambient: {
            intensity: 0.3
          }
        }
      },
      series: [
        {
          type: 'scatter3D',
          data: gridData,
          symbolSize: 8,
          itemStyle: {
            opacity: 0.8
          },
          emphasis: {
            itemStyle: {
              borderWidth: 2,
              borderColor: '#000'
            }
          }
        } as unknown as echarts.SeriesOption
      ]
    };

    chart.setOption(option);

    // Handle resize
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data]);

  if (loading) {
    return (
      <div className="volatility-surface-chart">
        <div className="loading">Loading volatility surface...</div>
      </div>
    );
  }

  if (!data || data.surface_data.length === 0) {
    return (
      <div className="volatility-surface-chart">
        <div className="empty-state">
          No volatility data available
        </div>
      </div>
    );
  }

  return (
    <div className="volatility-surface-chart">
      <div className="chart-header">
        <h3>Implied Volatility Surface</h3>
        <p className="chart-subtitle">
          3D visualization of IV across strikes and expirations
        </p>
      </div>
      <div 
        ref={chartRef} 
        className="chart-container"
        style={{ width: '100%', height: '600px' }}
      />
      <div className="chart-controls">
        <p>💡 <strong>Tip:</strong> Click and drag to rotate, scroll to zoom</p>
      </div>
    </div>
  );
}
