import React, { useState } from 'react'
import { useI18n } from '../../../i18n/I18nContext'
import './ContractDiagram.css'

interface ContractDiagramProps {
  type?: 'call' | 'put'
  underlying?: string
  strike?: string
  expiry?: string
  premium?: string
  className?: string
}

export const ContractDiagram: React.FC<ContractDiagramProps> = ({
  type = 'call',
  underlying = 'AAPL',
  strike = '$150',
  expiry = 'Mar 21, 2025',
  premium = '$5.25',
  className = ''
}) => {
  const { language } = useI18n()
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  const isZh = language === 'zh'

  const labels = {
    title: isZh ? (type === 'call' ? '看涨期权 (Call)' : '看跌期权 (Put)') : (type === 'call' ? 'Call Option' : 'Put Option'),
    underlying: {
      label: isZh ? '标的资产' : 'Underlying Asset',
      desc: isZh ? '期权合约所对应的实际资产（如股票、ETF等）。' : 'The actual asset (stock, ETF, etc.) that the option contract gives you the right to buy or sell.'
    },
    strike: {
      label: isZh ? '行权价' : 'Strike Price',
      desc: isZh ? '期权买方可以买入（看涨）或卖出（看跌）标的资产的预定价格。' : 'The pre-agreed price at which the option buyer can buy (call) or sell (put) the underlying asset.'
    },
    expiry: {
      label: isZh ? '到期日' : 'Expiration Date',
      desc: isZh ? '期权合约有效的最后日期。在此之后，合约作废。' : 'The last date on which the option contract is valid. After this, it expires worthless or is exercised.'
    },
    premium: {
      label: isZh ? '权利金' : 'Premium',
      desc: isZh ? '买方为获得期权权利而支付给卖方的价格。' : 'The price the buyer pays to the seller to acquire the option rights.'
    },
    type: {
      label: isZh ? '合约类型' : 'Contract Type',
      desc: isZh ? (type === 'call' ? '看涨期权给予买方买入的权利。' : '看跌期权给予买方卖出的权利。') : (type === 'call' ? 'A Call option gives the buyer the right to BUY.' : 'A Put option gives the buyer the right to SELL.')
    },
    placeholder: isZh ? '悬停在合约区域上以查看详情' : 'Hover over parts of the contract to learn more'
  }

  const handleMouseEnter = (section: string) => {
    setHoveredSection(section)
  }

  const handleMouseLeave = () => {
    setHoveredSection(null)
  }

  const getActiveInfo = () => {
    if (!hoveredSection) return null
    const info = labels[hoveredSection as keyof typeof labels]
    if (info && typeof info === 'object' && 'label' in info) {
      return info as { label: string, desc: string }
    }
    return null
  }

  const activeInfo = getActiveInfo()

  return (
    <div className={`contract-diagram-container ${className}`}>
      <div className="contract-ticket">
        <div 
          className={`contract-header ${type}`}
          onMouseEnter={() => handleMouseEnter('type')}
          onMouseLeave={handleMouseLeave}
          onFocus={() => handleMouseEnter('type')}
          onBlur={handleMouseLeave}
          tabIndex={0}
          role="button"
          aria-label={labels.type.label}
        >
          <span>{labels.title}</span>
          <span>{type.toUpperCase()}</span>
        </div>
        
        <div className="contract-body">
          <div 
            className={`contract-section ${hoveredSection === 'underlying' ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('underlying')}
            onMouseLeave={handleMouseLeave}
            onFocus={() => handleMouseEnter('underlying')}
            onBlur={handleMouseLeave}
            tabIndex={0}
            role="button"
            aria-label={labels.underlying.label}
          >
            <span className="section-label">{labels.underlying.label}</span>
            <span className="section-value">{underlying}</span>
          </div>

          <div 
            className={`contract-section ${hoveredSection === 'strike' ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('strike')}
            onMouseLeave={handleMouseLeave}
            onFocus={() => handleMouseEnter('strike')}
            onBlur={handleMouseLeave}
            tabIndex={0}
            role="button"
            aria-label={labels.strike.label}
          >
            <span className="section-label">{labels.strike.label}</span>
            <span className="section-value">{strike}</span>
          </div>

          <div 
            className={`contract-section ${hoveredSection === 'expiry' ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('expiry')}
            onMouseLeave={handleMouseLeave}
            onFocus={() => handleMouseEnter('expiry')}
            onBlur={handleMouseLeave}
            tabIndex={0}
            role="button"
            aria-label={labels.expiry.label}
          >
            <span className="section-label">{labels.expiry.label}</span>
            <span className="section-value">{expiry}</span>
          </div>

          <div 
            className={`contract-section ${hoveredSection === 'premium' ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter('premium')}
            onMouseLeave={handleMouseLeave}
            onFocus={() => handleMouseEnter('premium')}
            onBlur={handleMouseLeave}
            tabIndex={0}
            role="button"
            aria-label={labels.premium.label}
          >
            <span className="section-label">{labels.premium.label}</span>
            <span className="section-value">{premium}</span>
          </div>
        </div>
      </div>

      <div className="info-panel">
        {activeInfo ? (
          <>
            <div className="info-title">{activeInfo.label}</div>
            <div className="info-description">{activeInfo.desc}</div>
          </>
        ) : (
          <div className="info-placeholder">
            {labels.placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
