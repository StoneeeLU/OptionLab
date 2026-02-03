import { Link } from 'react-router-dom'

import { useWatchlist } from '../../hooks/useWatchlist'
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
        <div className="empty">Your watchlist is empty.</div>
      ) : (
        <div className="list" role="list">
          {items.map((item) => (
            <div key={item.symbol} className="row" role="listitem">
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
                className="remove"
                onClick={() => removeFromWatchlist(item.symbol)}
                aria-label={`Remove ${item.symbol} from watchlist`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
