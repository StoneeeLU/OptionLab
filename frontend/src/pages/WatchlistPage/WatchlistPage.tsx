import { Link } from 'react-router-dom'
import { Trash2, Inbox } from 'lucide-react'

import { useWatchlist } from '../../hooks/useWatchlist'
import { GlassPanel } from '../../components/common/GlassPanel'
import { AnimatedContainer } from '../../components/common/AnimatedContainer'
import './WatchlistPage.css'

export function WatchlistPage() {
  const { getWatchlist, removeFromWatchlist } = useWatchlist()
  const items = getWatchlist()

  return (
    <div className="watchlist-page">
      <header className="watchlist-header">
        <div>
          <h1>Watchlist</h1>
          <p className="subtitle">Symbols saved locally in your browser.</p>
        </div>
      </header>

      {items.length === 0 ? (
        <AnimatedContainer animation="fadeIn">
          <GlassPanel variant="subtle" className="empty">
            <Inbox className="empty-icon" size={48} strokeWidth={1.5} />
            <p className="empty-text">Your watchlist is empty.</p>
            <p className="empty-sub">Start adding symbols to track them here.</p>
          </GlassPanel>
        </AnimatedContainer>
      ) : (
        <div className="list" role="list">
          {items.map((item, index) => (
            <AnimatedContainer
              key={item.symbol}
              animation="slideUp"
              transition={{ delay: index * 0.05 }}
              className="watchlist-item-container"
            >
              <GlassPanel className="row" role="listitem" variant="medium">
                <div className="row-main">
                  <Link
                    className="symbol"
                    to={`/options?symbol=${encodeURIComponent(item.symbol)}`}
                    aria-label={`Open options chain for ${item.symbol}`}
                  >
                    {item.symbol}
                  </Link>
                  <div className="meta">Added {item.addedAt.toLocaleDateString()}</div>
                </div>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeFromWatchlist(item.symbol)}
                  aria-label={`Remove ${item.symbol} from watchlist`}
                >
                  <Trash2 size={18} />
                </button>
              </GlassPanel>
            </AnimatedContainer>
          ))}
        </div>
      )}
    </div>
  )
}
