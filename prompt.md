Build a Python FastAPI backend for "AlgoForge" — a web-based algorithmic trading research platform.
This backend connects to MetaTrader 5, runs backtests, manages strategies, and serves data to a React frontend.

## Tech Stack
- Python 3.11+
- FastAPI + Uvicorn
- PostgreSQL (via SQLAlchemy 2.0 async + asyncpg)
- Alembic for migrations
- MetaTrader5 Python package (mt5)
- Pandas + NumPy for data processing
- Pydantic v2 for schemas
- python-dotenv for config
- CORS enabled for http://localhost:5173

---

## Project Structure

algoforge-backend/
  app/
    api/
      v1/
        routes/
          strategies.py
          indicators.py
          backtest.py
          mt5.py
          results.py
        __init__.py
        router.py
    core/
      config.py
      database.py
      deps.py
    models/
      strategy.py
      indicator.py
      backtest.py
      trade.py
    schemas/
      strategy.py
      indicator.py
      backtest.py
      trade.py
      mt5.py
    services/
      strategy_service.py
      indicator_service.py
      backtest_service.py
      mt5_service.py
      mql5_generator.py
    engine/
      backtest_engine.py
      signal_generator.py
      risk_manager.py
      indicators/
        trend.py
        momentum.py
        volatility.py
        volume.py
        ict.py
  alembic/
  migrations/
  .env.example
  main.py
  requirements.txt

---

## Environment Config (.env.example)

DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/algoforge
MT5_LOGIN=12345678
MT5_PASSWORD=your_password
MT5_SERVER=YourBroker-Server
MT5_PATH=C:/Program Files/MetaTrader 5/terminal64.exe
API_KEY=your_secret_api_key
CORS_ORIGINS=http://localhost:5173
DEBUG=true

---

## Database Models (SQLAlchemy 2.0)

### strategies table
- id: UUID primary key
- name: str (unique)
- description: str nullable
- instrument: str (XAUUSD, EURUSD, etc.)
- timeframe: str (M1, M5, M15, M30, H1, H4, D1)
- direction: enum (LONG, SHORT, BOTH)
- session_filter: JSON (list of sessions)
- risk_per_trade: float
- max_daily_drawdown: float
- entry_conditions: JSON (list of condition blocks)
- exit_conditions: JSON (list of condition blocks)
- filters: JSON
- is_active: bool default True
- created_at: datetime
- updated_at: datetime

### indicators table
- id: UUID primary key
- name: str
- category: enum (TREND, MOMENTUM, VOLATILITY, VOLUME, ICT)
- parameters: JSON (default parameter definitions)
- description: str
- created_at: datetime

### backtest_runs table
- id: UUID primary key
- strategy_id: UUID FK → strategies
- instrument: str
- timeframe: str
- date_from: date
- date_to: date
- initial_capital: float
- spread: float
- commission: float
- slippage: float
- status: enum (PENDING, RUNNING, COMPLETED, FAILED)
- net_profit: float nullable
- total_trades: int nullable
- win_rate: float nullable
- profit_factor: float nullable
- max_drawdown: float nullable
- sharpe_ratio: float nullable
- expectancy: float nullable
- equity_curve: JSON nullable (list of {date, equity} points)
- log_output: text nullable
- error_message: str nullable
- started_at: datetime nullable
- completed_at: datetime nullable
- created_at: datetime

### trades table
- id: UUID primary key
- backtest_run_id: UUID FK → backtest_runs
- trade_number: int
- open_time: datetime
- close_time: datetime
- instrument: str
- direction: enum (LONG, SHORT)
- entry_price: float
- exit_price: float
- stop_loss: float nullable
- take_profit: float nullable
- lot_size: float
- pips: float
- profit: float
- running_balance: float
- exit_reason: enum (TP, SL, SIGNAL, EOD)

---

## API Routes

### /api/v1/strategies
GET    /              → list all strategies (paginated)
POST   /              → create strategy
GET    /{id}          → get strategy by id
PUT    /{id}          → update strategy
DELETE /{id}          → delete strategy
POST   /{id}/duplicate → duplicate strategy
GET    /{id}/export-mql5 → generate and return MQL5 EA code as text

### /api/v1/indicators
GET    /              → list all indicators (filterable by category)
GET    /{id}          → get indicator detail
POST   /              → create custom indicator definition
GET    /categories    → list all categories with counts

### /api/v1/backtest
POST   /run           → create and queue a backtest run
GET    /              → list all backtest runs (paginated, filterable by strategy)
GET    /{id}          → get backtest run detail + stats
GET    /{id}/trades   → get paginated trade log for a run
GET    /{id}/equity-curve → get equity curve data points
GET    /{id}/log      → get raw log output
DELETE /{id}          → delete a backtest run and its trades
POST   /{id}/cancel   → cancel a running backtest

### /api/v1/mt5
GET    /status        → check MT5 connection status
POST   /connect       → connect to MT5 terminal
POST   /disconnect    → disconnect from MT5
GET    /symbols       → list available symbols from MT5
GET    /symbols/{symbol}/info → get symbol info (spread, digits, etc.)
GET    /symbols/{symbol}/rates → fetch OHLCV bars (params: timeframe, from, to, count)
GET    /account       → get account info (balance, equity, margin)
GET    /server-time   → get current MT5 server time

### /api/v1/results
GET    /summary       → aggregate stats across all completed backtests
GET    /compare       → compare multiple backtest runs side by side (query: ids[])
GET    /export/{id}   → export trades as CSV

---

## Services

### mt5_service.py
- initialize(login, password, server, path) → connect and return account info
- shutdown() → disconnect
- get_rates(symbol, timeframe, date_from, date_to) → return DataFrame with OHLCV
- get_symbol_info(symbol) → spread, digits, contract size, etc.
- get_account_info() → balance, equity, margin, free_margin
- timeframe_map: dict mapping string TF ("H1") to mt5.TIMEFRAME_H1 constants
- Handle all MT5 errors gracefully, raise HTTPException with detail message

### backtest_engine.py
Core backtesting loop — pure Python/Pandas, NO MT5 dependency at runtime:

class BacktestEngine:
  def __init__(self, strategy: dict, ohlcv: DataFrame, config: BacktestConfig)
  
  def run() → BacktestResult
    - Loop through bars
    - Apply indicator calculations on rolling window
    - Check entry conditions on each bar
    - Manage open positions (SL/TP hit check, exit signal check)
    - Apply risk management (position sizing by % risk)
    - Log every trade open/close
    - Build equity curve
    - Return BacktestResult with all stats + trades list

  def _calculate_indicators(df) → df with indicator columns
  def _check_entry(bar, indicators) → (signal: LONG/SHORT/NONE, confidence: float)
  def _check_exit(position, bar, indicators) → (exit: bool, reason: str)
  def _size_position(balance, risk_pct, entry, sl, pip_value) → lot_size
  def _calculate_stats(trades, equity_curve, initial_capital) → StatsDict

BacktestResult dataclass:
  trades: list[TradeResult]
  equity_curve: list[dict]
  net_profit: float
  total_trades: int
  winning_trades: int
  losing_trades: int
  win_rate: float
  profit_factor: float
  max_drawdown: float
  max_drawdown_pct: float
  sharpe_ratio: float
  expectancy: float
  avg_trade_duration: float
  log_lines: list[str]

### signal_generator.py
- parse_conditions(conditions: list[dict]) → callable that takes (bar, indicators_df) → bool
- Support condition operators: CROSS_ABOVE, CROSS_BELOW, GREATER_THAN, LESS_THAN, BETWEEN, EQUALS
- Support combining conditions with AND / OR logic
- Example condition block:
  {
    "indicator": "RSI",
    "params": {"period": 14},
    "operator": "LESS_THAN",
    "value": 30,
    "logic": "AND"
  }

### indicators/ (calculation functions)

trend.py:
- ema(series, period) → Series
- sma(series, period) → Series
- vwap(df) → Series  (rolling daily VWAP)
- anchored_vwap(df, anchor_index) → Series
- supertrend(df, period, multiplier) → DataFrame (supertrend, direction)

momentum.py:
- rsi(series, period) → Series
- macd(series, fast, slow, signal) → DataFrame (macd, signal, histogram)
- stochastic(df, k_period, d_period) → DataFrame (%K, %D)
- cci(df, period) → Series
- williams_r(df, period) → Series

volatility.py:
- atr(df, period) → Series
- bollinger_bands(series, period, std_dev) → DataFrame (upper, middle, lower)
- keltner_channel(df, period, multiplier) → DataFrame (upper, middle, lower)

volume.py:
- obv(df) → Series
- cmf(df, period) → Series

ict.py:
- detect_fvg(df, min_gap_pips) → DataFrame (fvg_bull, fvg_bear, fvg_top, fvg_bottom)
- detect_order_blocks(df, lookback) → DataFrame (ob_bull, ob_bear, ob_high, ob_low)
- detect_bos(df, lookback) → Series (bos_bull, bos_bear)
- detect_swing_highs_lows(df, left_bars, right_bars) → DataFrame
- detect_liquidity_sweeps(df, swing_df) → DataFrame

### risk_manager.py
- calculate_lot_size(balance, risk_pct, entry, sl, pip_value, contract_size) → float
- calculate_rr_ratio(entry, sl, tp) → float
- validate_drawdown(current_drawdown, max_allowed) → bool
- calculate_daily_pnl(trades_today) → float

### mql5_generator.py
generate_ea(strategy: dict) → str
- Takes a strategy JSON object
- Returns a complete, compilable MQL5 Expert Advisor .mq5 file as string
- Generated EA structure:
  - #property comments (name, version, strategy description)
  - Input parameters (all strategy params as extern inputs)
  - Global variables
  - OnInit() — indicator handle initialization
  - OnDeinit()
  - OnTick() — main logic:
    - New bar detection
    - Session filter check
    - Indicator value retrieval
    - Entry condition evaluation
    - Position management (SL/TP modification)
    - Exit condition evaluation
    - OrderSend() calls with error handling
  - Helper functions: IsNewBar(), IsInSession(), GetPipValue()
- Support these indicators in code generation:
  RSI, MACD, EMA, SMA, Bollinger Bands, ATR, Stochastic, CCI
- Use iRSI(), iMACD(), iMA(), iBands(), iATR(), iStochastic(), iCCI() MT5 built-ins
- Generated code must follow MQL5 best practices (handle-based indicator access)

---

## Backtest Execution Flow (backtest_service.py)

1. Receive BacktestRunCreate request
2. Create backtest_run record in DB with status=PENDING
3. Return run ID immediately (async background task)
4. Background task:
   a. Update status → RUNNING, set started_at
   b. Fetch OHLCV data from MT5 (or DB cache)
   c. Load strategy from DB
   d. Initialize BacktestEngine
   e. engine.run() → BacktestResult
   f. Persist all trades to DB
   g. Update backtest_run with stats + equity_curve + log
   h. Update status → COMPLETED or FAILED
5. Frontend polls GET /backtest/{id} for status updates

---

## WebSocket (optional but include the scaffold)

/ws/backtest/{run_id}
- Broadcast log lines in real-time as backtest runs
- Send JSON: { "type": "log", "message": "...", "timestamp": "..." }
- Send final: { "type": "complete", "result": {...} }

---

## Seed Data (seed.py)

On startup if DB is empty, seed:
- 15 indicators with full metadata (all indicators listed above)
- 3 sample strategies:
  1. "RSI Mean Reversion" — XAUUSD H1, RSI<30 entry, RSI>70 exit
  2. "EMA Crossover + ATR Filter" — EURUSD H4, 50/200 EMA cross, ATR filter
  3. "ICT FVG Retracement" — XAUUSD M15, FVG detection, OB confluence

---

## Error Handling
- All routes wrapped with try/except
- Custom exception classes: MT5ConnectionError, BacktestError, StrategyValidationError
- Global exception handler returning { "error": "...", "detail": "..." }
- All DB operations use async context managers
- Log all errors with Python logging (structured JSON format)

---

## Requirements.txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
sqlalchemy[asyncio]==2.0.30
asyncpg==0.29.0
alembic==1.13.1
pydantic==2.7.1
pydantic-settings==2.2.1
python-dotenv==1.0.1
MetaTrader5==5.0.4497
pandas==2.2.2
numpy==1.26.4
pandas-ta==0.3.14b
httpx==0.27.0
python-multipart==0.0.9
websockets==12.0

---

## main.py
- FastAPI app setup
- Include all routers under /api/v1
- CORS middleware
- Startup event: init DB + run seed + attempt MT5 connection
- Shutdown event: MT5 disconnect + DB close
- Health check: GET /health → { status, db, mt5, version }

---

## Notes
- All async/await throughout — no sync DB calls
- UUID primary keys everywhere
- Timestamps in UTC
- MT5 operations wrapped in a singleton connection manager
- Backtest engine must work even if MT5 is not connected (use cached/imported data)
- Keep MQL5 generator in its own module — it will grow large
- Do not implement authentication — API key check as a simple header middleware is enough