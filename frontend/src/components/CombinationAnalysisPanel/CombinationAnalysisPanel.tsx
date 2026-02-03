import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import './CombinationAnalysisPanel.css';

interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

interface PnLPoint {
  price: number;
  pnl: number;
}

interface CombinationAnalysis {
  strategy_name: string;
  combined_greeks: Greeks;
  net_premium: number;
  pnl_data: PnLPoint[];
  max_profit: number | null;
  max_loss: number | null;
  breakevens: number[];
}

interface Props {
  analysis: CombinationAnalysis | null;
  loading?: boolean;
}

export function CombinationAnalysisPanel({ analysis, loading = false }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || !analysis) return;

    // Initialize chart if not exists
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const chart = chartInstance.current;

    // Prepare data
    const prices = analysis.pnl_data.map((p) => p.price);
    const pnls = analysis.pnl_data.map((p) => p.pnl);

    // Find zero line intersections for breakeven markers
    const breakevenMarkers = analysis.breakevens.map((price) => ({
      xAxis: price.toFixed(2),
      label: {
        formatter: `BE: ${price.toFixed(2)}`,
        position: 'insideEndTop' as const,
      }
    }));

    const option: echarts.EChartsOption = {
      title: {
        text: `${analysis.strategy_name} P&L Diagram`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const points = params as Array<{ axisValue: string; data: number }>
          const data = points[0]
          return `Price: $${data.axisValue}<br/>P&L: $${data.data.toFixed(2)}`;
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '15%'
      },
      xAxis: {
        type: 'category',
        data: prices.map((p) => p.toFixed(2)),
        name: 'Underlying Price',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          formatter: (value: string) => `$${Number(value).toFixed(0)}`
        }
      },
      yAxis: {
        type: 'value',
        name: 'Profit/Loss',
        nameLocation: 'middle',
        nameGap: 50,
        axisLabel: {
          formatter: (value: number) => `$${value.toFixed(0)}`
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'P&L',
          type: 'line',
          data: pnls,
          smooth: false,
          lineStyle: {
            width: 2,
            color: '#5470c6'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(84, 112, 198, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(84, 112, 198, 0.1)'
              }
            ])
          },
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                yAxis: 0,
                label: { show: false },
                lineStyle: {
                  color: '#999',
                  type: 'solid',
                  width: 1
                }
              },
              ...breakevenMarkers
            ] as unknown
          }
        } as unknown as echarts.SeriesOption
      ]
    };

    chart.setOption(option);

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [analysis]);

  if (loading) {
    return (
      <div className="combination-analysis-panel">
        <div className="loading">Loading analysis...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="combination-analysis-panel">
        <div className="empty-state">
          Select options to analyze combinations
        </div>
      </div>
    );
  }

  const formatGreek = (value: number, decimals: number = 4) => {
    return value.toFixed(decimals);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Unlimited';
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="combination-analysis-panel">
      <div className="strategy-info">
        <h3>{analysis.strategy_name}</h3>
        <div className="premium-info">
          <span className="label">Net Premium:</span>
          <span className={`value ${analysis.net_premium < 0 ? 'debit' : 'credit'}`}>
            {analysis.net_premium < 0 ? 'Debit' : 'Credit'}: {formatCurrency(Math.abs(analysis.net_premium))}
          </span>
        </div>
      </div>

      <div className="greeks-table">
        <h4>Combined Greeks</h4>
        <table>
          <thead>
            <tr>
              <th>Delta</th>
              <th>Gamma</th>
              <th>Theta</th>
              <th>Vega</th>
              <th>Rho</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={analysis.combined_greeks.delta > 0 ? 'positive' : 'negative'}>
                {formatGreek(analysis.combined_greeks.delta)}
              </td>
              <td className={analysis.combined_greeks.gamma > 0 ? 'positive' : 'negative'}>
                {formatGreek(analysis.combined_greeks.gamma)}
              </td>
              <td className={analysis.combined_greeks.theta > 0 ? 'positive' : 'negative'}>
                {formatGreek(analysis.combined_greeks.theta)}
              </td>
              <td className={analysis.combined_greeks.vega > 0 ? 'positive' : 'negative'}>
                {formatGreek(analysis.combined_greeks.vega)}
              </td>
              <td className={analysis.combined_greeks.rho > 0 ? 'positive' : 'negative'}>
                {formatGreek(analysis.combined_greeks.rho)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pnl-metrics">
        <div className="metric">
          <span className="label">Max Profit:</span>
          <span className="value profit">{formatCurrency(analysis.max_profit)}</span>
        </div>
        <div className="metric">
          <span className="label">Max Loss:</span>
          <span className="value loss">{formatCurrency(analysis.max_loss)}</span>
        </div>
        <div className="metric">
          <span className="label">Breakevens:</span>
          <span className="value">
            {analysis.breakevens.length > 0
              ? analysis.breakevens.map((be) => `$${be.toFixed(2)}`).join(', ')
              : 'None'}
          </span>
        </div>
      </div>

      <div className="pnl-chart" ref={chartRef} style={{ width: '100%', height: '400px' }} />
    </div>
  );
}
