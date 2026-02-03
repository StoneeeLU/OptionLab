import { Link } from 'react-router-dom'
import { GlassPanel } from '../../components/common/GlassPanel'
import { AnimatedContainer } from '../../components/common/AnimatedContainer'
import './HomePage.css'

const POPULAR_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'SPY', 'QQQ', 'AMZN', 'GOOGL', 'MSFT']

export function HomePage() {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-title">
          <h1>OptionLab</h1>
          <p className="subtitle">Pick a symbol to jump into the options chain.</p>
        </div>
      </header>

      <section className="popular-section" aria-label="Popular symbols">
        <div className="grid">
          {POPULAR_SYMBOLS.map((symbol, index) => (
            <AnimatedContainer
              key={symbol}
              animation="slideUp"
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                className="symbol-card-link"
                to={`/options?symbol=${encodeURIComponent(symbol)}`}
                aria-label={`Open options chain for ${symbol}`}
              >
                <GlassPanel variant="subtle" className="symbol-card">
                  <div className="card-top">
                    <div className="symbol">{symbol}</div>
                    <div className="pill">Options</div>
                  </div>
                  <div className="card-bottom">
                    <div className="hint">View chain • Run analysis</div>
                  </div>
                </GlassPanel>
              </Link>
            </AnimatedContainer>
          ))}
        </div>
      </section>
    </div>
  )
}

