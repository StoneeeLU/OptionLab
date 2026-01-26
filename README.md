# OptionLab - Options Analysis & Valuation Platform

**A comprehensive options analysis platform for identifying mispriced options through theoretical pricing, Greeks analysis, volatility modeling, and multi-leg strategy evaluation.**

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/react-19-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

---

## 🚀 Features

### Core Analysis
- **Hybrid Pricing Engine**: Black-Scholes for European options, CRR binomial tree for American options
- **Greeks Calculator**: Delta, Gamma, Theta, Vega, Rho with analytical formulas
- **Volatility Analysis**: Historical volatility, Implied volatility, IV percentile
- **Put-Call Parity**: Detect arbitrage opportunities and synthetic pricing violations

### Multi-Leg Strategies
- **Strategy Recognition**: Automatically identifies 6 common strategies (Vertical Spread, Straddle, Strangle, Iron Condor, Butterfly, Calendar Spread)
- **Combined Greeks**: Net position Greeks across all legs
- **P&L Diagrams**: Interactive profit/loss charts at expiration
- **Breakeven Analysis**: Automatic breakeven point calculation

### Visualization
- **3D Volatility Surface**: Interactive scatter plot showing IV across strikes and expirations
- **Options Chain**: Side-by-side calls/puts table with real-time filtering
- **Interactive Charts**: ECharts-powered visualizations with zoom, rotation, tooltips

### Data & Filtering
- **Options Chain Filtering**: By expiry, moneyness (ITM/ATM/OTM), volume, open interest
- **Real-time Data**: yfinance integration with 5-minute caching
- **Watchlist**: Save favorite symbols and options for quick access

### User Experience
- **Dark/Light Themes**: Professional color schemes with smooth transitions
- **Responsive Design**: Works on desktop, tablet, mobile
- **Accessibility**: ARIA labels, keyboard navigation, focus states

---

## 📦 Installation

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18 or higher
- **npm**: 9 or higher

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (using pip or poetry)
pip install -r requirements.txt

# Or with poetry
poetry install

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`  
The backend API will be available at `http://localhost:8000`  
API documentation at `http://localhost:8000/docs`

---

## 🎯 Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**: Navigate to `http://localhost:5173`

4. **Analyze Options**:
   - Enter a stock symbol (e.g., AAPL)
   - Browse the options chain
   - Select options to analyze
   - View theoretical prices, Greeks, IV analysis
   - Create multi-leg strategies and see P&L diagrams

---

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── app/
│   ├── api/           # API endpoints (health, options, analysis, watchlist)
│   ├── models/        # Pydantic data models
│   ├── services/      # Business logic
│   │   ├── providers/ # Data providers (yfinance)
│   │   ├── pricing/   # Pricing engines (Black-Scholes, Binomial)
│   │   ├── analysis/  # Analysis services (Greeks, volatility, strategies)
│   │   └── cache/     # SQLite caching layer
│   └── core/          # Configuration
└── tests/             # pytest test suite (130+ tests)
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/    # React components
│   │   ├── OptionsChainTable/
│   │   ├── OptionAnalysisCard/
│   │   ├── CombinationAnalysisPanel/
│   │   └── VolatilitySurfaceChart/
│   ├── pages/         # Page components
│   ├── services/      # API client
│   ├── contexts/      # React contexts (Theme)
│   ├── types/         # TypeScript types
│   └── styles/        # Global styles, theme CSS
└── tests/             # Vitest test suite
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest                    # Run all tests
pytest --cov=app          # With coverage
pytest -v                 # Verbose output
pytest tests/test_pricing.py  # Specific file
```

**Test Coverage**: 132/134 tests passing (98.5%)

### Frontend Tests
```bash
cd frontend
npm test                  # Run all tests
npm test -- --ui          # With UI
npm test -- --coverage    # With coverage
```

**Note**: ECharts tests may fail in jsdom environment (expected) but work perfectly in browser.

---

## 📡 API Endpoints

### Options Data
- `GET /api/options/{symbol}/chain` - Get options chain with filtering
- `GET /api/analysis/volatility-surface/{symbol}` - Get IV surface data

### Analysis
- `POST /api/analysis/single` - Analyze single option
- `POST /api/analysis/combination` - Analyze multi-leg strategy

### Watchlist
- `GET /api/watchlist` - Get all watchlist items
- `POST /api/watchlist` - Add item to watchlist
- `DELETE /api/watchlist/{id}` - Remove item

### Documentation
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in `backend/` directory:

```env
# Cache settings
CACHE_TTL_SECONDS=300

# Database
DATABASE_URL=backend/data/cache.db

# Data provider
DATA_PROVIDER=yfinance

# Logging
LOG_LEVEL=INFO

# Risk-free rate (annualized)
RISK_FREE_RATE=0.05
```

### Theme

Theme preference is stored in browser localStorage and persists across sessions.

---

## 🔬 Pricing Models

### European Options (Black-Scholes)
- Used for: Index options (SPX, VIX, etc.)
- Library: `py_vollib`
- Accuracy: Matches Hull textbook examples within 0.01%

### American Options (CRR Binomial Tree)
- Used for: Equity options (AAPL, TSLA, etc.)
- Steps: 100 (configurable)
- Early exercise: Properly handled

### Auto-routing
The platform automatically selects the appropriate pricing model based on the option's exercise style.

---

## 📊 Data Sources

### Market Data
- **Provider**: yfinance (free, delayed data)
- **Update Frequency**: 15-minute delay
- **Caching**: 5-minute TTL to reduce API calls
- **Coverage**: US equity options

### Risk-Free Rate
- Default: 5% annualized
- Configurable via environment variable
- Used for all pricing calculations

---

## 🎨 Technology Stack

### Backend
- **Framework**: FastAPI 0.100+
- **Pricing**: py_vollib (Black-Scholes), custom CRR binomial tree
- **Data**: yfinance
- **Database**: SQLite (caching, watchlist)
- **Testing**: pytest, pytest-asyncio, pytest-cov

### Frontend
- **Framework**: React 19
- **Language**: TypeScript 5.9
- **Build**: Vite
- **Charts**: ECharts 6.0 + echarts-gl (3D)
- **Styling**: CSS Custom Properties (CSS Variables)
- **Testing**: Vitest, React Testing Library

---

## 🐛 Known Limitations

1. **American Options**: py_vollib supports European only, so we use CRR binomial tree for American options
2. **yfinance**: 15-minute delayed data, occasional rate limits (mitigated by caching)
3. **Dividends**: Not yet implemented in pricing models
4. **Complex Greeks**: Only first-order Greeks (no charm, vanna, etc.)

---

## 🤝 Contributing

This is currently a personal project. Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Commit Message Convention**: Use conventional commits (feat, fix, docs, style, refactor, test, chore)

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **py_vollib**: For accurate Black-Scholes implementation
- **yfinance**: For free market data access
- **ECharts**: For powerful, beautiful visualizations
- **FastAPI**: For the excellent async web framework

---

## 📧 Contact

**Project Repository**: [https://github.com/StoneeeLU/OptionLab](https://github.com/StoneeeLU/OptionLab)

---

## 🗺️ Roadmap

### Completed ✅
- [x] Black-Scholes + CRR binomial pricing
- [x] Greeks calculation
- [x] Historical & implied volatility analysis
- [x] Put-Call Parity checker
- [x] Strategy recognition (6 strategies)
- [x] P&L diagrams
- [x] 3D volatility surface
- [x] Dark/Light themes
- [x] Options chain filtering
- [x] Watchlist persistence

### Upcoming 🚧
- [ ] Export to CSV/PDF
- [ ] Option history charts
- [ ] Error boundaries and comprehensive error handling
- [ ] Performance optimization (virtualization, code splitting)
- [ ] Docker deployment
- [ ] More strategies (ratio spreads, box spreads)
- [ ] Dividend-adjusted pricing
- [ ] Higher-order Greeks
- [ ] Multi-exchange support

---

**Happy Trading! 📈**

*Disclaimer: This tool is for educational and analysis purposes only. Not financial advice. Trade at your own risk.*
