# AlgoForge

> Institutional-grade algorithmic trading research platform — build strategies visually, backtest against historical data, generate MT5 Expert Advisors, and analyse results in a modern terminal-style UI.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
  - [Backend](#backend-setup)
  - [Frontend](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Backtest Engine](#backtest-engine)
- [Indicator Library](#indicator-library)
- [MQL5 EA Generator](#mql5-ea-generator)
- [MetaTrader 5 Integration](#metatrader-5-integration)
- [WebSocket](#websocket)
- [Development Notes](#development-notes)

---

## Overview

AlgoForge is a full-stack web application for quantitative trading research. It lets traders and quant developers compose rule-based strategies from a library of technical indicators, backtest them against real or simulated price data, inspect every trade and metric, and export production-ready MetaQuotes Language 5 (MQL5) Expert Advisors — all without writing a single line of trading code.

---

## Features

### Strategy Builder
- Drag-and-drop block-based strategy composer
- Entry, exit, and filter condition blocks
- Supports 20+ indicators across 5 categories
- Session filters (London, New York, Asia, Overlap)
- Long-only, short-only, or bidirectional direction
- Risk per trade and max daily drawdown controls
- Version history — save, compare, and restore snapshots

### Backtesting
- Pure Python/Pandas engine — no MT5 required at runtime
- Bar-by-bar simulation with SL/TP hit detection
- ATR-based position sizing
- Configurable spread, commission, and slippage
- Real-time log streaming via WebSocket
- Full trade log with entry/exit price, pips, P&L, running balance
- Equity curve with drawdown overlay

### Analytics & Results
- Net profit, win rate, profit factor, max drawdown, Sharpe ratio, expectancy
- Side-by-side multi-run comparison
- Monthly trade distribution charts
- Correlation matrix
- CSV export of full trade log

### MQL5 EA Export
- Generates a complete, compilable `.mq5` Expert Advisor from any strategy
- Handles RSI, MACD, EMA, SMA, Bollinger Bands, ATR, Stochastic, CCI
- Uses handle-based indicator access (MT5 best practice)
- Session filter, position management, SL/TP, and `OrderSend` with error handling

### MT5 Integration *(Windows only)*
- Connect to any MT5 terminal via Python MT5 API
- Fetch live OHLCV bars for any symbol and timeframe
- Real-time account info (balance, equity, margin)
- Symbol metadata (spread, digits, contract size)
- Graceful degradation on macOS/Linux — all other features remain fully functional

### Authentication
- JWT access + refresh tokens with automatic rotation
- Roles: `ADMIN`, `ANALYST`, `VIEWER`
- Per-device session management and logout-all
- bcrypt password hashing

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  React 19 + Vite + Zustand + Recharts + TailwindCSS v4  │
│  Port 3000                                              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP + WebSocket (proxied /api, /ws)
┌────────────────────▼────────────────────────────────────┐
│                   FastAPI Backend                       │
│  Uvicorn · SQLAlchemy 2.0 async · Alembic               │
│  Port 8000                                              │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Auth Service│  │Strategy Svc  │  │ Backtest Svc  │  │
│  └─────────────┘  └──────────────┘  └───────┬───────┘  │
│                                             │           │
│                                    ┌────────▼────────┐  │
│                                    │ Backtest Engine │  │
│                                    │ (Pandas + NumPy)│  │
│                                    └─────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐                      │
│  │  MT5 Svc    │  │MQL5 Generator│                      │
│  └─────────────┘  └──────────────┘                      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │      PostgreSQL          │
        │  strategies · indicators │
        │  backtest_runs · trades  │
        │  users · refresh_tokens  │
        └──────────────────────────┘
```

---

## Project Structure

```
AlgoForge/
├── start.sh                        # One-command dev launcher
├── README.md
│
├── algoforge-backend/
│   ├── main.py                     # FastAPI app, CORS, lifespan, WebSocket
│   ├── seed.py                     # Seed 15 indicators + 3 sample strategies
│   ├── requirements.txt
│   ├── requirements-windows.txt    # Adds MetaTrader5 for Windows
│   ├── alembic.ini
│   ├── alembic/
│   │   └── env.py                  # Async Alembic environment
│   └── app/
│       ├── api/v1/
│       │   ├── router.py
│       │   └── routes/
│       │       ├── auth.py         # /auth/* + /users/*
│       │       ├── strategies.py   # /strategies/*
│       │       ├── indicators.py   # /indicators/*
│       │       ├── backtest.py     # /backtest/*
│       │       ├── mt5.py          # /mt5/*
│       │       └── results.py      # /results/*
│       ├── core/
│       │   ├── config.py           # Pydantic settings
│       │   ├── database.py         # Async engine + session
│       │   ├── deps.py             # FastAPI dependencies
│       │   └── security.py         # JWT + bcrypt helpers
│       ├── models/                 # SQLAlchemy 2.0 models
│       ├── schemas/                # Pydantic v2 schemas
│       ├── services/
│       │   ├── auth_service.py
│       │   ├── strategy_service.py
│       │   ├── indicator_service.py
│       │   ├── backtest_service.py
│       │   ├── mt5_service.py
│       │   └── mql5_generator.py
│       └── engine/
│           ├── backtest_engine.py
│           ├── signal_generator.py
│           ├── risk_manager.py
│           └── indicators/
│               ├── trend.py        # EMA, SMA, VWAP, Supertrend
│               ├── momentum.py     # RSI, MACD, Stochastic, CCI, Williams %R
│               ├── volatility.py   # ATR, Bollinger Bands, Keltner Channel
│               ├── volume.py       # OBV, CMF
│               └── ict.py          # FVG, Order Blocks, BOS, Liquidity Sweeps
│
└── frontend/
    ├── vite.config.ts              # Dev proxy → localhost:8000
    └── src/
        ├── App.tsx                 # Routes + auth guard + bootstrap
        ├── lib/
        │   ├── api.ts              # Fetch client, JWT refresh, WS helper
        │   └── mappers.ts          # Frontend ↔ backend type converters
        ├── store/
        │   ├── useAuthStore.ts     # JWT login/register/logout/refresh
        │   ├── useStrategyStore.ts # Strategy CRUD + backend sync
        │   ├── useBacktestStore.ts # Run + WS log stream + poll
        │   └── useToastStore.ts
        ├── pages/
        │   ├── Login.tsx
        │   ├── Dashboard.tsx
        │   ├── StrategyBuilder.tsx
        │   ├── IndicatorLab.tsx
        │   ├── Backtest.tsx
        │   ├── Results.tsx
        │   └── Settings.tsx
        ├── components/
        │   ├── charts/             # EquityCurve, TradeDistribution, CorrelationMatrix
        │   └── layout/             # Sidebar, TopBar, Layout
        └── types/                  # strategy.ts, backtest.ts, indicator.ts
```

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| FastAPI | 0.111.0 | Async web framework |
| Uvicorn | 0.29.0 | ASGI server |
| SQLAlchemy | 2.0.30 | Async ORM |
| asyncpg | 0.29.0 | PostgreSQL async driver |
| Alembic | 1.13.1 | Database migrations |
| Pydantic | 2.7.1 | Data validation (v2) |
| pydantic-settings | 2.2.1 | Settings from env |
| pandas | 2.2.2 | Backtest data processing |
| numpy | 1.26.4 | Numerical operations |
| pandas-ta | 0.3.14b | Technical indicator helpers |
| python-jose | 3.3.0 | JWT signing/verification |
| passlib[bcrypt] | 1.7.4 | Password hashing |
| websockets | 12.0 | WebSocket support |
| MetaTrader5 | 5.0.4497 | MT5 API *(Windows only)* |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 19.0.1 | UI framework |
| Vite | 6.2.3 | Build tool + dev server |
| TypeScript | 5.8.2 | Static typing |
| TailwindCSS | 4.1.14 | Utility-first CSS |
| Zustand | 5.0.14 | Global state management |
| Recharts | 3.8.1 | Charts (equity curve, etc.) |
| react-router-dom | 7.17.0 | Client-side routing |
| motion | 12.23.24 | Animations |
| lucide-react | 0.546.0 | Icons |

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.11+ | 3.13 tested |
| Node.js | 18+ | 20 tested |
| PostgreSQL | 14+ | Must be running before launch |
| MetaTrader 5 terminal | Any | Windows only, optional |

---

## Quick Start

The fastest way to run both services:

```bash
git clone <repo-url>
cd AlgoForge

# 1. Start PostgreSQL (if not already running)
#    macOS with Homebrew:
brew services start postgresql@16

# 2. Create the database
createdb algoforge

# 3. Launch everything
./start.sh
```

The script will:
- Copy `.env.example` → `.env` for both backend and frontend if missing
- Create a Python virtual environment and install all dependencies
- Run Alembic migrations
- Seed 15 indicators and 3 sample strategies
- Start the backend on **http://localhost:8000**
- Start the frontend on **http://localhost:3000**
- Stream live logs from both processes

> **Ctrl+C** cleanly stops both services.

### Flags

```bash
./start.sh                # Full setup + migrations
./start.sh --no-migrate   # Skip alembic upgrade head (faster restart)
```

---

## Manual Setup

### Backend Setup

```bash
cd algoforge-backend

# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# Windows only (adds MetaTrader5):
# pip install -r requirements-windows.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY at minimum

# 4. Run migrations
alembic upgrade head

# 5. Start the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:8000

# 3. Start the dev server
npm run dev
```

---

## Environment Variables

### Backend — `algoforge-backend/.env`

| Variable | Default | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | — | ✅ | PostgreSQL connection string |
| `SECRET_KEY` | — | ✅ | JWT signing secret (min 32 chars, random) |
| `ALGORITHM` | `HS256` | | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | | Refresh token lifetime |
| `API_KEY` | `dev_key` | | Legacy header API key |
| `CORS_ORIGINS` | `http://localhost:5173` | | Comma-separated allowed origins |
| `DEBUG` | `true` | | SQLAlchemy echo + debug logging |
| `MT5_LOGIN` | `0` | | MT5 account number *(Windows)* |
| `MT5_PASSWORD` | — | | MT5 password *(Windows)* |
| `MT5_SERVER` | — | | MT5 broker server *(Windows)* |
| `MT5_PATH` | — | | Path to `terminal64.exe` *(Windows)* |

Example `.env`:
```dotenv
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/algoforge
SECRET_KEY=replace-this-with-a-random-64-char-string-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
DEBUG=true
```

> **Security:** Never commit `.env` to version control. Generate a strong `SECRET_KEY` with:
> ```bash
> python3 -c "import secrets; print(secrets.token_hex(32))"
> ```

### Frontend — `frontend/.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL |

---

## Database

### Schema

| Table | Description |
|---|---|
| `users` | Registered users with roles and hashed passwords |
| `refresh_tokens` | Stored refresh token hashes for per-device revocation |
| `strategies` | Strategy definitions with conditions stored as JSON |
| `indicators` | Indicator catalogue with parameter definitions |
| `backtest_runs` | Backtest job records with status and aggregate stats |
| `trades` | Individual trade records linked to a backtest run |

### Migrations

```bash
cd algoforge-backend

# Apply all pending migrations
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "describe your change"

# Downgrade one step
alembic downgrade -1

# View current migration state
alembic current
```

### Seed Data

On first startup, `seed.py` populates the database with:

**15 indicators** across all categories:

| Category | Indicators |
|---|---|
| Trend | EMA, SMA, VWAP, Supertrend |
| Momentum | RSI, MACD, Stochastic, CCI, Williams %R |
| Volatility | ATR, Bollinger Bands, Keltner Channel |
| Volume | OBV, CMF |
| ICT Concepts | Fair Value Gap |

**3 sample strategies:**
- `RSI Mean Reversion` — XAUUSD H1
- `EMA Crossover + ATR Filter` — EURUSD H4
- `ICT FVG Retracement` — XAUUSD M15

---

## API Reference

Interactive docs available at **http://localhost:8000/docs** (Swagger UI) and **http://localhost:8000/redoc**.

### Authentication — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create a new account |
| POST | `/login` | — | Login, returns token pair |
| POST | `/token` | — | OAuth2 form-compatible login (for Swagger UI) |
| POST | `/refresh` | — | Rotate refresh token |
| POST | `/logout` | Bearer | Revoke refresh token |
| POST | `/logout-all` | Bearer | Revoke all sessions |
| GET | `/me` | Bearer | Get current user profile |
| PUT | `/me` | Bearer | Update own profile |
| POST | `/me/change-password` | Bearer | Change password |

### User Management — `/api/v1/users` *(Admin only)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all users (paginated) |
| GET | `/{id}` | Get user by ID |
| PUT | `/{id}` | Update user (role, active status) |
| DELETE | `/{id}` | Deactivate user |

### Strategies — `/api/v1/strategies`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List strategies (paginated) |
| POST | `/` | Create strategy |
| GET | `/{id}` | Get strategy by ID |
| PUT | `/{id}` | Update strategy |
| DELETE | `/{id}` | Delete strategy |
| POST | `/{id}/duplicate` | Clone strategy |
| GET | `/{id}/export-mql5` | Export as MQL5 EA (plain text) |

### Indicators — `/api/v1/indicators`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List indicators (filterable by `category`) |
| GET | `/categories` | List categories with counts |
| GET | `/{id}` | Get indicator detail |
| POST | `/` | Create custom indicator definition |

### Backtest — `/api/v1/backtest`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/run` | Queue a backtest (returns `202 Accepted` + run ID) |
| GET | `/` | List runs (paginated, filterable by `strategy_id`) |
| GET | `/{id}` | Get run detail + aggregate stats |
| GET | `/{id}/trades` | Paginated trade log |
| GET | `/{id}/equity-curve` | Equity curve data points |
| GET | `/{id}/log` | Raw log output |
| DELETE | `/{id}` | Delete run and all its trades |
| POST | `/{id}/cancel` | Cancel a running backtest |

### MT5 — `/api/v1/mt5`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/status` | Connection status + account summary |
| POST | `/connect` | Connect to MT5 terminal |
| POST | `/disconnect` | Disconnect |
| GET | `/symbols` | List available symbols |
| GET | `/symbols/{symbol}/info` | Symbol metadata (spread, digits, etc.) |
| GET | `/symbols/{symbol}/rates` | OHLCV bars (`?timeframe=H1&from=…&to=…`) |
| GET | `/account` | Balance, equity, margin, free margin |
| GET | `/server-time` | Current MT5 server timestamp |

### Results — `/api/v1/results`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/summary` | Aggregate stats across all completed runs |
| GET | `/compare?ids[]=…` | Side-by-side multi-run comparison |
| GET | `/export/{id}` | Download trade log as CSV |

### Health

```
GET /health
→ { "status": "ok", "db": "connected", "mt5": false, "version": "0.1.0" }
```

---

## Authentication

AlgoForge uses **JWT Bearer tokens** with automatic refresh rotation.

### Flow

```
POST /auth/login
  → { access_token, refresh_token, expires_in }

All protected requests:
  Authorization: Bearer <access_token>

When access_token expires (HTTP 401):
  POST /auth/refresh  { refresh_token }
  → new { access_token, refresh_token }   ← old refresh_token is revoked

POST /auth/logout  { refresh_token }       ← revokes the token server-side
```

The frontend handles this transparently — the API client in `src/lib/api.ts` intercepts 401 responses, refreshes silently, and retries the original request.

### Roles

| Role | Permissions |
|---|---|
| `ADMIN` | Full access including user management |
| `ANALYST` | Create/edit strategies, run backtests, export MQL5 |
| `VIEWER` | Read-only access to strategies and results |

---

## Backtest Engine

The backtest engine (`app/engine/backtest_engine.py`) is a pure Python/Pandas simulation loop — it has no dependency on MT5 and runs fully offline.

### Execution flow

```
BacktestRunCreate request
  → Create backtest_run record (status: PENDING)
  → Return run ID immediately (202)
  
Background task:
  1. status → RUNNING, set started_at
  2. Fetch OHLCV from MT5 or generate synthetic bars
  3. Load strategy from DB
  4. BacktestEngine.run()
     ├─ _calculate_indicators()  ← builds RSI_14, EMA_50, etc. columns
     ├─ Bar loop (from warmup period):
     │   ├─ Check SL/TP hit on bar open
     │   ├─ Check exit conditions
     │   └─ Check entry conditions (if flat)
     ├─ _size_position()         ← ATR-based lot sizing by % risk
     └─ _calculate_stats()       ← win rate, PF, Sharpe, MDD, expectancy
  5. Persist all trades to DB
  6. Update backtest_run with stats + equity curve + log
  7. status → COMPLETED or FAILED
```

### Signal conditions

Conditions are defined as JSON blocks and parsed by `signal_generator.py`:

```json
{
  "indicator": "RSI",
  "params": { "period": 14 },
  "operator": "LESS_THAN",
  "value": 30,
  "logic": "AND"
}
```

Supported operators: `GREATER_THAN`, `LESS_THAN`, `EQUALS`, `BETWEEN`, `CROSS_ABOVE`, `CROSS_BELOW`

Conditions are combined with `AND` / `OR` logic per block.

---

## Indicator Library

All indicators are implemented in pure Pandas/NumPy and live in `app/engine/indicators/`.

### Trend (`trend.py`)
| Function | Description |
|---|---|
| `ema(series, period)` | Exponential Moving Average |
| `sma(series, period)` | Simple Moving Average |
| `vwap(df)` | Rolling daily VWAP |
| `anchored_vwap(df, anchor_index)` | VWAP from a custom anchor bar |
| `supertrend(df, period, multiplier)` | ATR-based trend with direction |

### Momentum (`momentum.py`)
| Function | Description |
|---|---|
| `rsi(series, period)` | Relative Strength Index |
| `macd(series, fast, slow, signal)` | MACD line, signal, histogram |
| `stochastic(df, k_period, d_period)` | Stochastic %K and %D |
| `cci(df, period)` | Commodity Channel Index |
| `williams_r(df, period)` | Williams %R |

### Volatility (`volatility.py`)
| Function | Description |
|---|---|
| `atr(df, period)` | Average True Range |
| `bollinger_bands(series, period, std_dev)` | Upper, middle, lower bands |
| `keltner_channel(df, period, multiplier)` | EMA-based volatility channel |

### Volume (`volume.py`)
| Function | Description |
|---|---|
| `obv(df)` | On-Balance Volume |
| `cmf(df, period)` | Chaikin Money Flow |

### ICT Concepts (`ict.py`)
| Function | Description |
|---|---|
| `detect_fvg(df, min_gap_pips)` | Fair Value Gaps (bullish + bearish) |
| `detect_order_blocks(df, lookback)` | Institutional Order Blocks |
| `detect_bos(df, lookback)` | Break of Structure |
| `detect_swing_highs_lows(df, left, right)` | Swing point detection |
| `detect_liquidity_sweeps(df, swing_df)` | Stop hunt / liquidity sweep |

---

## MQL5 EA Generator

`app/services/mql5_generator.py` converts any strategy definition into a complete, compilable MetaQuotes Language 5 Expert Advisor.

**Generated file structure:**

```mql5
#property copyright "AlgoForge"
#property version   "1.00"
#include <Trade\Trade.mqh>

// Input parameters (one per strategy setting)
input double  RiskPerTrade    = 1.0;
input int     RSI_Period      = 14;
...

// Global variables (indicator handles, CTrade object)
int    g_rsi_handle;
CTrade g_trade;

int OnInit() {
  g_rsi_handle = iRSI(_Symbol, PERIOD_H1, RSI_Period, PRICE_CLOSE);
  if (g_rsi_handle == INVALID_HANDLE) return INIT_FAILED;
  return INIT_SUCCEEDED;
}

void OnDeinit(const int reason) {
  IndicatorRelease(g_rsi_handle);
}

void OnTick() {
  if (!IsNewBar()) return;
  if (!IsInSession(SessionFilter)) return;
  // CopyBuffer, evaluate conditions, OrderSend...
}

bool IsNewBar() { ... }
bool IsInSession(string sessions) { ... }
double GetPipValue() { ... }
```

Download a generated EA from any strategy:
```
GET /api/v1/strategies/{id}/export-mql5
```

---

## MetaTrader 5 Integration

MT5 connectivity is **Windows-only** due to the official Python package restriction.

### Setup (Windows)

```bash
pip install MetaTrader5==5.0.4497
# or via the provided file:
pip install -r requirements-windows.txt
```

Configure in `.env`:
```dotenv
MT5_LOGIN=12345678
MT5_PASSWORD=your_broker_password
MT5_SERVER=YourBroker-Server
MT5_PATH=C:\Program Files\MetaTrader 5\terminal64.exe
```

### macOS / Linux

MT5 is not available. The backend degrades gracefully:
- All `/api/v1/mt5/*` endpoints return a `connected: false` status
- The backtest engine uses synthetic OHLCV data when MT5 is unavailable
- All other features (strategy builder, analytics, MQL5 export) work fully

---

## WebSocket

Real-time backtest log streaming is available over WebSocket.

**Endpoint:** `ws://localhost:8000/ws/backtest/{run_id}`

**Message types:**

```jsonc
// Log line during execution
{ "type": "log", "message": "[ENGINE] Bar 1420/2000 processed", "timestamp": "2026-06-10T10:05:58Z" }

// Final completion message
{ "type": "complete", "result": { "net_profit": 2480.0, "win_rate": 64.2, ... } }
```

The frontend (`useBacktestStore`) connects automatically when a backtest run is created and falls back to HTTP polling if the WebSocket connection fails.

---

## Development Notes

### Running without PostgreSQL

If you don't have PostgreSQL available, you can point `DATABASE_URL` at a SQLite database for local development:

```dotenv
DATABASE_URL=sqlite+aiosqlite:///./algoforge.db
```

Add `aiosqlite` to requirements:
```bash
pip install aiosqlite
```

### TypeScript type-check

```bash
cd frontend
npm run lint     # tsc --noEmit
```

### Backend tests

```bash
cd algoforge-backend
pytest           # if test suite is added
```

### Log files

When launched via `./start.sh`, logs are written to:

```
.logs/
  backend.log    # uvicorn + application logs
  frontend.log   # Vite dev server output
```

### Adding a new indicator

1. Implement the calculation function in the appropriate `app/engine/indicators/*.py` module
2. Add it to `_calculate_indicators()` in `backtest_engine.py`
3. Add an entry to `seed.py` for the indicator catalogue
4. Add the indicator to `mql5_generator.py` if it should be exportable to MT5
5. Add it to `INDICATORS_METADATA` in `frontend/src/data/mockData.ts` for the UI

### Strategy data model

Strategies store their logic as JSON arrays on the backend:

```json
{
  "entry_conditions": [
    { "indicator": "RSI", "params": { "period": 14 }, "operator": "LESS_THAN", "value": 30, "logic": "AND" }
  ],
  "exit_conditions": [
    { "indicator": "RSI", "params": { "period": 14 }, "operator": "GREATER_THAN", "value": 70, "logic": "AND" }
  ],
  "filters": {
    "ema": { "period": 200 }
  }
}
```

The frontend maps these to/from visual `StrategyBlock[]` objects via `src/lib/mappers.ts`.
