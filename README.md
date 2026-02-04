<div align="center">

<img src="https://img.shields.io/badge/OptionLab-Options%20Analysis-6366f1?style=for-the-badge" alt="OptionLab" />

# OptionLab

### Options Analysis & Valuation Platform

<br />

**[English](README.md)** &nbsp;|&nbsp; **[中文](README_CN.md)**

<br />

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<br />

*Identify mispriced options through theoretical pricing, Greeks analysis, volatility modeling, and multi-leg strategy evaluation.*

<br />

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📊 Pricing & Greeks

- **Hybrid Pricing Engine**  
  Black-Scholes (py_vollib) for European options  
  CRR Binomial Tree (QuantLib) for American options

- **Complete Greeks**  
  Delta, Gamma, Theta, Vega, Rho

- **Mispricing Detection**  
  Compare theoretical vs market prices

</td>
<td width="50%">

### 📈 Volatility Analysis

- **Historical Volatility**  
  Calculate from price history

- **Implied Volatility**  
  Extract from market prices

- **IV Percentile**  
  Rank current IV vs historical

- **3D Volatility Surface**  
  Interactive visualization across strikes & expirations

</td>
</tr>
<tr>
<td width="50%">

### 🎯 Multi-Leg Strategies

- **Strategy Recognition**  
  Auto-identifies: Vertical Spread, Straddle, Strangle, Iron Condor, Butterfly, Calendar Spread

- **Combined Greeks**  
  Net position Greeks across all legs

- **P&L Diagrams**  
  Interactive profit/loss at expiration

- **Breakeven Analysis**  
  Automatic calculation

</td>
<td width="50%">

### 📚 Education Center

- **Interactive Chapters**  
  Basics, Pricing, Greeks, Implied Volatility, Strategies

- **Live Simulators**  
  Option Calculator, Time Decay Demo, Greeks Sensitivity Explorer

- **Quizzes**  
  Test your knowledge after each chapter

- **Bilingual**  
  Full English & Chinese support

</td>
</tr>
<tr>
<td width="50%">

### 💾 Data & Export

- **Real-time Data**  
  yfinance integration with caching

- **Options Chain Filtering**  
  By expiry, moneyness, volume, open interest

- **CSV Export**  
  Export analysis results

- **Watchlist**  
  Save favorite symbols

</td>
<td width="50%">

### 🎨 User Experience

- **Dark/Light Themes**  
  Professional color schemes

- **Smooth Animations**  
  Framer Motion powered

- **Responsive Design**  
  Desktop, tablet, mobile

- **Accessibility**  
  ARIA labels, keyboard navigation

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

### 1. Backend

```bash
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Open Browser

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## 🐳 Docker

```bash
# Build and start
docker compose up --build

# Background mode
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |

---

## 🏗️ Architecture

```
OptionLab/
├── backend/                    # FastAPI (Python 3.11+)
│   ├── app/
│   │   ├── api/               # Routers: health, options, analysis, volatility, watchlist, export
│   │   ├── models/            # Pydantic models
│   │   ├── services/
│   │   │   ├── pricing/       # Black-Scholes, Binomial Tree
│   │   │   ├── analysis/      # Greeks, volatility, strategies, P&L
│   │   │   ├── providers/     # yfinance data provider
│   │   │   └── cache/         # SQLite caching
│   │   └── core/              # Config, error handlers, performance
│   └── tests/                 # pytest suite
│
├── frontend/                   # React 19 + TypeScript + Vite
│   └── src/
│       ├── pages/             # Home, Options, Education, Volatility, Watchlist
│       ├── components/        # OptionsChain, Analysis, Charts, Education
│       ├── services/          # API client (axios)
│       ├── contexts/          # Theme context
│       ├── i18n/              # English & Chinese translations
│       └── types/             # TypeScript interfaces
│
└── docker-compose.yml          # Container orchestration
```

---

## 📡 API Endpoints

### Options Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/options/{symbol}/chain` | Get options chain |
| `GET` | `/api/options/{symbol}/expirations` | Get available expirations |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analysis/single` | Analyze single option |
| `POST` | `/api/analysis/combination` | Analyze multi-leg strategy |
| `POST` | `/api/analysis/volatility-surface` | Get IV surface data |

### Volatility
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/volatility/{symbol}/surface` | Get volatility surface |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/export/csv/analysis` | Export analysis to CSV |
| `POST` | `/api/export/csv/strategy` | Export strategy to CSV |

### Watchlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/watchlist` | Get all items |
| `POST` | `/api/watchlist` | Add item |
| `DELETE` | `/api/watchlist/{id}` | Remove item |

---

## 🧪 Testing

### Backend
```bash
cd backend
pytest                    # Run all tests
pytest --cov=app          # With coverage
pytest -v                 # Verbose
```

### Frontend
```bash
cd frontend
npm test                  # Run all tests
npm test -- --ui          # With Vitest UI
npm test -- --coverage    # With coverage
```

---

## 🎨 Tech Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | FastAPI 0.109+ |
| Pricing | py_vollib (Black-Scholes), QuantLib (Binomial) |
| Data | yfinance |
| Database | SQLite (SQLAlchemy) |
| Validation | Pydantic v2 |
| Testing | pytest, pytest-asyncio |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build | Vite 7 |
| Routing | React Router 7 |
| State | Zustand |
| Charts | ECharts 6 + echarts-gl |
| Animation | Framer Motion |
| HTTP | Axios |
| Testing | Vitest, React Testing Library |

---

## ⚙️ Configuration

Create `.env` in `backend/`:

```env
CACHE_TTL_SECONDS=300
DATABASE_URL=backend/data/optionlab.db
DATA_PROVIDER=yfinance
LOG_LEVEL=INFO
RISK_FREE_RATE=0.05
```

---

## 🗺️ Roadmap

<table>
<tr>
<td width="50%">

### ✅ Completed

| Status | Feature |
|:------:|---------|
| ✔️ | Black-Scholes + CRR Binomial pricing |
| ✔️ | Greeks (Delta, Gamma, Theta, Vega, Rho) |
| ✔️ | Historical & Implied Volatility |
| ✔️ | IV Percentile |
| ✔️ | Put-Call Parity checker |
| ✔️ | Strategy recognition (6 strategies) |
| ✔️ | P&L diagrams + breakeven analysis |
| ✔️ | 3D Volatility Surface |
| ✔️ | CSV Export |
| ✔️ | Education Center (interactive) |
| ✔️ | Bilingual support (EN/ZH) |
| ✔️ | Dark/Light themes |
| ✔️ | Watchlist persistence |
| ✔️ | Docker deployment |

</td>
<td width="50%">

### 🚧 Planned

| Status | Feature |
|:------:|---------|
| ⏳ | PDF Export |
| ⏳ | Option price history charts |
| ⏳ | More strategies (ratio, box spreads) |
| ⏳ | Dividend-adjusted pricing |
| ⏳ | Higher-order Greeks (Charm, Vanna, Volga) |
| ⏳ | Multi-exchange support |

</td>
</tr>
</table>

---

## 🤝 Contributing

```bash
# Fork, then:
git checkout -b feature/YourFeature
git commit -m 'feat: add YourFeature'
git push origin feature/YourFeature
# Open Pull Request
```

**Commit Convention**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📝 License

MIT License - see [LICENSE](LICENSE)

---

<div align="center">

**[GitHub](https://github.com/StoneeeLU/OptionLab)**

<br />

*For educational and analysis purposes only. Not financial advice.*

</div>
