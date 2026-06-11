"""
Full bar-by-bar backtesting engine.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd

from app.engine.risk_manager import (
    calculate_lot_size,
    validate_drawdown,
)
from app.engine.signal_generator import _col_name, parse_conditions

logger = logging.getLogger(__name__)

# Indicator dispatch maps
_INDICATOR_MAP: dict[str, str] = {
    "RSI": "rsi",
    "MACD": "macd",
    "EMA": "ema",
    "SMA": "sma",
    "VWAP": "vwap",
    "VWAP_UPPER_TOUCH": "vwap_upper_touch",
    "VWAP_LOWER_TOUCH": "vwap_lower_touch",
    "SUPERTREND": "supertrend",
    "ATR": "atr",
    "ADX": "adx",
    "BOLLINGER": "bollinger_bands",
    "BB": "bollinger_bands",
    "KELTNER": "keltner_channel",
    "KC": "keltner_channel",
    "STOCHASTIC": "stochastic",
    "CCI": "cci",
    "WILLIAMS_R": "williams_r",
    "OBV": "obv",
    "CMF": "cmf",
    "FVG": "detect_fvg",
    "ORDER_BLOCK": "detect_order_blocks",
    "BOS": "detect_bos",
    "SWING": "detect_swing_highs_lows",
}

WARMUP_PERIOD = 200  # bars before starting evaluation


@dataclass
class BacktestConfig:
    initial_capital: float = 10000.0
    spread: float = 0.0
    commission: float = 0.0
    slippage: float = 0.0
    risk_per_trade: float = 1.0
    max_daily_drawdown: float = 5.0
    time_stop_bars: int = 0  # 0 = disabled; >0 = close after N bars if no TP/SL hit


@dataclass
class TradeResult:
    trade_number: int
    open_time: datetime
    close_time: datetime
    instrument: str
    direction: str  # LONG / SHORT
    entry_price: float
    exit_price: float
    stop_loss: Optional[float]
    take_profit: Optional[float]
    lot_size: float
    pips: float
    profit: float
    running_balance: float
    exit_reason: str  # TP / SL / SIGNAL / EOD


@dataclass
class BacktestResult:
    trades: list[TradeResult] = field(default_factory=list)
    equity_curve: list[dict] = field(default_factory=list)
    net_profit: float = 0.0
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    win_rate: float = 0.0
    profit_factor: float = 0.0
    max_drawdown: float = 0.0
    max_drawdown_pct: float = 0.0
    sharpe_ratio: float = 0.0
    expectancy: float = 0.0
    avg_trade_duration: float = 0.0
    log_lines: list[str] = field(default_factory=list)


class BacktestEngine:
    """Bar-by-bar backtest engine."""

    def __init__(
        self,
        strategy: dict,
        ohlcv: pd.DataFrame,
        config: BacktestConfig,
    ) -> None:
        self.strategy = strategy
        self.config = config
        self.instrument = strategy.get("instrument", "UNKNOWN")

        # Normalise column names to lowercase
        self.ohlcv = ohlcv.copy()
        self.ohlcv.columns = [c.lower() for c in self.ohlcv.columns]
        if "time" in self.ohlcv.columns and not isinstance(self.ohlcv.index, pd.DatetimeIndex):
            self.ohlcv.index = pd.to_datetime(self.ohlcv["time"])

        # Ensure required columns
        for col in ("open", "high", "low", "close", "volume"):
            if col not in self.ohlcv.columns:
                if col == "volume":
                    self.ohlcv["volume"] = 0.0
                else:
                    raise ValueError(f"OHLCV DataFrame missing required column: {col}")

        self._indicators_df: Optional[pd.DataFrame] = None
        self._log: list[str] = []

    # ──────────────────────────────────────────────
    # Public interface
    # ──────────────────────────────────────────────

    # ── Logging helpers ──────────────────────────────────────────────────────

    def _sep(self, char: str = "─", width: int = 60) -> None:
        self._log.append(char * width)

    def _fmt_duration(self, hours: float) -> str:
        h = int(hours)
        m = int((hours - h) * 60)
        return f"{h}h {m:02d}m" if h else f"{m}m"

    def _running_stats(self, trades: list[TradeResult]) -> str:
        if not trades:
            return "W:0 L:0 | WR: --"
        w = sum(1 for t in trades if t.profit > 0)
        l = len(trades) - w
        wr = w / len(trades) * 100
        net = sum(t.profit for t in trades)
        sign = "+" if net >= 0 else ""
        return f"W:{w} L:{l} | WR:{wr:.1f}% | Net:{sign}{net:.2f}"

    def run(self) -> BacktestResult:
        """Execute the full bar-by-bar backtest and return results."""
        cfg  = self.config
        n    = len(self.ohlcv)
        name = self.strategy.get("name", "Unknown")
        direction = self.strategy.get("direction", "BOTH")

        t_start = self.ohlcv.index[0]
        t_end   = self.ohlcv.index[-1]
        timeframe = self.strategy.get("timeframe", "?")

        # ── Header ──────────────────────────────────────────────────────────
        self._sep("━")
        self._log.append(" ALGOFORGE BACKTEST ENGINE")
        self._sep("━")
        self._log.append(f"[INIT] Strategy  : {name}")
        self._log.append(f"[INIT] Instrument: {self.instrument}  |  Timeframe: {timeframe}  |  Direction: {direction}")
        self._log.append(f"[INIT] Date range: {t_start}  →  {t_end}")
        self._log.append(f"[INIT] Bars total: {n}  |  Warmup: {WARMUP_PERIOD} bars  |  Active bars: {max(0, n - WARMUP_PERIOD)}")
        self._log.append(f"[INIT] Capital   : ${cfg.initial_capital:,.2f}  |  Risk/Trade: {cfg.risk_per_trade:.2f}%  |  Max DD: {cfg.max_daily_drawdown:.2f}%")
        self._log.append(f"[INIT] Costs     : Spread: {cfg.spread} pips  |  Commission: ${cfg.commission:.2f}  |  Slippage: {cfg.slippage:.5f}")
        self._sep()

        # ── Indicator calculation ────────────────────────────────────────────
        self._log.append("[INDICATORS] Pre-calculating indicators over full dataset...")
        self._indicators_df = self._calculate_indicators(self.ohlcv)

        conditions = (
            self.strategy.get("entry_conditions", [])
            + self.strategy.get("exit_conditions", [])
        )
        ind_labels = []
        for c in conditions:
            ind = c.get("indicator", "")
            params = c.get("params", {})
            if ind:
                period = params.get("period", "")
                ind_labels.append(f"{ind.upper()}{'(' + str(period) + ')' if period else ''}")
        unique_inds = list(dict.fromkeys(ind_labels))
        self._log.append(f"[INDICATORS] Computed: {', '.join(unique_inds) if unique_inds else '(none)'}")
        entry_count = len(self.strategy.get("entry_conditions", []))
        exit_count  = len(self.strategy.get("exit_conditions",  []))
        self._log.append(f"[INDICATORS] Entry conditions: {entry_count}  |  Exit conditions: {exit_count}")
        self._sep()

        entry_fn = parse_conditions(self.strategy.get("entry_conditions", []))
        exit_fn  = parse_conditions(self.strategy.get("exit_conditions",  []))

        balance      = cfg.initial_capital
        peak_balance = balance
        max_drawdown = 0.0
        trades: list[TradeResult] = []
        equity_curve: list[dict]  = []
        trade_counter = 0
        position: Optional[dict]  = None

        # Instrument-aware pip sizing
        instr_upper = self.instrument.upper()
        if instr_upper in ("XAUUSD", "GOLD"):
            pip_size  = 0.01    # gold: 1 pip = $0.01
            pip_value = 1.0     # $1 per pip per lot for gold
        elif instr_upper in ("USDJPY", "EURJPY", "GBPJPY", "AUDJPY", "CADJPY", "CHFJPY", "NZDJPY"):
            pip_size  = 0.01    # JPY pairs: 1 pip = 0.01
            pip_value = 1.0
        elif instr_upper in ("DXY", "USDX", "US_DI"):
            pip_size  = 0.001   # US Dollar Index: quoted to 3 decimal places
            pip_value = 1.0
        else:
            pip_size  = 0.0001  # standard forex: 1 pip = 0.0001
            pip_value = 10.0

        start_idx = min(WARMUP_PERIOD, n - 1)

        # Progress checkpoint every 10 %
        progress_step    = max(1, (n - start_idx) // 10)
        next_progress_at = start_idx + progress_step
        dd_warned_50     = False   # warned at 50 % of DD limit
        dd_warned_80     = False   # warned at 80 % of DD limit

        self._log.append(f"[ENGINE] Starting bar-by-bar loop from bar #{start_idx} ...")
        self._sep()

        for idx in range(start_idx, n):
            bar      = self.ohlcv.iloc[idx]
            bar_time = self.ohlcv.index[idx]

            # ── Progress report ──────────────────────────────────────────
            if idx >= next_progress_at:
                pct  = int((idx - start_idx) / max(1, n - start_idx) * 100)
                sign = "+" if balance >= cfg.initial_capital else ""
                self._log.append(
                    f"[PROGRESS] {pct:3d}% | Bar {idx}/{n} | {bar_time} | "
                    f"Trades: {trade_counter} | Balance: ${balance:,.2f} ({sign}{balance - cfg.initial_capital:+.2f})"
                )
                next_progress_at += progress_step

            # ── Check SL/TP on open of this bar ─────────────────────────
            if position is not None:
                exit_triggered, exit_reason, exit_price = self._check_sl_tp(position, bar)

                if exit_triggered:
                    trade = self._close_position(
                        position, exit_price, bar_time, exit_reason, balance, pip_size, trade_counter
                    )
                    balance = trade.running_balance
                    trades.append(trade)
                    trade_counter += 1
                    duration_h = (trade.close_time - trade.open_time).total_seconds() / 3600
                    pnl_sign   = "+" if trade.profit >= 0 else ""
                    sl_dist    = abs(trade.entry_price - (position.get("stop_loss") or trade.entry_price))
                    tp_dist    = abs(trade.entry_price - (position.get("take_profit") or trade.entry_price))
                    rr         = (tp_dist / sl_dist) if sl_dist > 0 else 0.0
                    self._log.append(
                        f"[CLOSE #{trade_counter:>3}] {trade.direction:<5} {trade.exit_reason:<6} | "
                        f"Entry: {trade.entry_price:.5f} → Exit: {trade.exit_price:.5f} | "
                        f"Pips: {pnl_sign}{trade.pips:.1f} | P&L: {pnl_sign}${trade.profit:.2f} | "
                        f"Duration: {self._fmt_duration(duration_h)} | R:R achieved: 1:{rr:.2f} | "
                        f"Balance: ${balance:,.2f}"
                    )
                    self._log.append(
                        f"         Running  → {self._running_stats(trades)}"
                    )
                    position = None
                else:
                    # Signal-based exit
                    should_exit, _ = self._check_exit(position, idx, self._indicators_df)
                    if should_exit:
                        exit_pr = float(bar["close"])
                        trade   = self._close_position(
                            position, exit_pr, bar_time, "SIGNAL", balance, pip_size, trade_counter
                        )
                        balance = trade.running_balance
                        trades.append(trade)
                        trade_counter += 1
                        duration_h = (trade.close_time - trade.open_time).total_seconds() / 3600
                        pnl_sign   = "+" if trade.profit >= 0 else ""
                        self._log.append(
                            f"[CLOSE #{trade_counter:>3}] {trade.direction:<5} SIGNAL | "
                            f"Entry: {trade.entry_price:.5f} → Exit: {trade.exit_price:.5f} | "
                            f"Pips: {pnl_sign}{trade.pips:.1f} | P&L: {pnl_sign}${trade.profit:.2f} | "
                            f"Duration: {self._fmt_duration(duration_h)} | Balance: ${balance:,.2f}"
                        )
                        self._log.append(
                            f"         Running  → {self._running_stats(trades)}"
                        )
                        position = None

            # ── Drawdown check ────────────────────────────────────────────
            current_dd_pct = ((peak_balance - balance) / peak_balance * 100) if peak_balance > 0 else 0.0
            dd_limit       = cfg.max_daily_drawdown

            if current_dd_pct >= dd_limit * 0.5 and not dd_warned_50:
                self._log.append(
                    f"[RISK ] DD WARNING  50% of limit | Current: {current_dd_pct:.2f}% | Limit: {dd_limit:.2f}% | {bar_time}"
                )
                dd_warned_50 = True
            if current_dd_pct >= dd_limit * 0.8 and not dd_warned_80:
                self._log.append(
                    f"[RISK ] DD WARNING  80% of limit | Current: {current_dd_pct:.2f}% | Limit: {dd_limit:.2f}% | {bar_time}"
                )
                dd_warned_80 = True

            if not validate_drawdown(current_dd_pct, dd_limit):
                self._log.append(
                    f"[RISK ] DD LIMIT HIT {current_dd_pct:.2f}% ≥ {dd_limit:.2f}% | "
                    f"Bar: {bar_time} | No new entries until reset."
                )
                equity_curve.append({"time": str(bar_time), "balance": balance})
                if balance > peak_balance:
                    peak_balance  = balance
                    dd_warned_50  = False
                    dd_warned_80  = False
                drawdown = peak_balance - balance
                if drawdown > max_drawdown:
                    max_drawdown = drawdown
                continue

            # Reset DD warnings when balance recovers above peak
            if balance >= peak_balance:
                dd_warned_50 = False
                dd_warned_80 = False

            # ── Time stop ─────────────────────────────────────────────────
            if position is not None and cfg.time_stop_bars > 0:
                bars_held = idx - position["open_idx"]
                if bars_held >= cfg.time_stop_bars:
                    exit_pr = float(bar["close"])
                    trade = self._close_position(position, exit_pr, bar_time, "TIME", balance, pip_size, trade_counter)
                    balance = trade.running_balance
                    trades.append(trade)
                    trade_counter += 1
                    duration_h = (trade.close_time - trade.open_time).total_seconds() / 3600
                    pnl_sign = "+" if trade.profit >= 0 else ""
                    self._log.append(
                        f"[CLOSE #{trade_counter:>3}] {trade.direction:<5} TIME   | "
                        f"Entry: {trade.entry_price:.5f} → Exit: {trade.exit_price:.5f} | "
                        f"Pips: {pnl_sign}{trade.pips:.1f} | P&L: {pnl_sign}${trade.profit:.2f} | "
                        f"Duration: {self._fmt_duration(duration_h)} ({bars_held} bars) | Balance: ${balance:,.2f}"
                    )
                    self._log.append(f"         Running  → {self._running_stats(trades)}")
                    position = None

            # ── Entry logic ───────────────────────────────────────────────
            if position is None:
                if self._evaluate_filters(idx, self._indicators_df):
                    entry_dir, entry_price = self._check_entry(idx, self._indicators_df, direction, entry_fn, pip_size)
                else:
                    entry_dir, entry_price = "NONE", 0.0

                if entry_dir != "NONE":
                    sl_price, tp_price = self._calculate_sl_tp(entry_dir, idx, entry_price, pip_size)
                    lot = self._size_position(balance, cfg.risk_per_trade, entry_price, sl_price, pip_value)
                    risk_amt = balance * cfg.risk_per_trade / 100
                    sl_pips  = abs(entry_price - sl_price) / pip_size
                    tp_pips  = abs(entry_price - tp_price) / pip_size
                    rr_ratio = tp_pips / sl_pips if sl_pips > 0 else 0.0

                    position = {
                        "direction":   entry_dir,
                        "entry_price": entry_price,
                        "stop_loss":   sl_price,
                        "take_profit": tp_price,
                        "lot_size":    lot,
                        "pip_value":   pip_value,
                        "open_time":   bar_time,
                        "open_idx":    idx,
                    }
                    self._log.append(
                        f"[OPEN  #{trade_counter + 1:>3}] {entry_dir:<5} @ {entry_price:.5f} | "
                        f"SL: {sl_price:.5f} ({sl_pips:.1f} pips) | "
                        f"TP: {tp_price:.5f} ({tp_pips:.1f} pips) | "
                        f"R:R: 1:{rr_ratio:.2f} | Lots: {lot:.2f} | Risk: ${risk_amt:.2f}"
                    )
                    self._log.append(
                        f"         Bar      : {bar_time} | "
                        f"O:{float(bar['open']):.5f} H:{float(bar['high']):.5f} "
                        f"L:{float(bar['low']):.5f} C:{float(bar['close']):.5f} | "
                        f"Balance: ${balance:,.2f}"
                    )

            # ── Equity curve ──────────────────────────────────────────────
            unrealized = 0.0
            if position is not None:
                _pv = position.get("pip_value", pip_value)
                if position["direction"] == "LONG":
                    unrealized = (float(bar["close"]) - position["entry_price"]) / pip_size * _pv * position["lot_size"]
                else:
                    unrealized = (position["entry_price"] - float(bar["close"])) / pip_size * _pv * position["lot_size"]

            equity_curve.append({"time": str(bar_time), "balance": balance + unrealized})

            if balance > peak_balance:
                peak_balance = balance
            drawdown = peak_balance - balance
            if drawdown > max_drawdown:
                max_drawdown = drawdown

        # ── Close any remaining open position at last bar ─────────────────
        if position is not None:
            last_bar  = self.ohlcv.iloc[-1]
            last_time = self.ohlcv.index[-1]
            exit_pr   = float(last_bar["close"])
            trade     = self._close_position(position, exit_pr, last_time, "EOD", balance, pip_size, trade_counter)
            balance   = trade.running_balance
            trades.append(trade)
            trade_counter += 1
            duration_h = (trade.close_time - trade.open_time).total_seconds() / 3600
            pnl_sign   = "+" if trade.profit >= 0 else ""
            self._log.append(
                f"[CLOSE #{trade_counter:>3}] {trade.direction:<5} EOD    | "
                f"Entry: {trade.entry_price:.5f} → Exit: {trade.exit_price:.5f} | "
                f"Pips: {pnl_sign}{trade.pips:.1f} | P&L: {pnl_sign}${trade.profit:.2f} | "
                f"Duration: {self._fmt_duration(duration_h)} | Balance: ${balance:,.2f}"
            )

        stats = self._calculate_stats(trades, equity_curve, cfg.initial_capital)

        result = BacktestResult(
            trades=trades,
            equity_curve=equity_curve,
            net_profit=stats["net_profit"],
            total_trades=stats["total_trades"],
            winning_trades=stats["winning_trades"],
            losing_trades=stats["losing_trades"],
            win_rate=stats["win_rate"],
            profit_factor=stats["profit_factor"],
            max_drawdown=stats["max_drawdown"],
            max_drawdown_pct=stats["max_drawdown_pct"],
            sharpe_ratio=stats["sharpe_ratio"],
            expectancy=stats["expectancy"],
            avg_trade_duration=stats["avg_trade_duration"],
            log_lines=self._log,
        )

        # ── Final summary ────────────────────────────────────────────────
        self._sep()
        self._sep("━")
        self._log.append(" BACKTEST COMPLETE")
        self._sep("━")
        net_pct  = (result.net_profit / cfg.initial_capital * 100) if cfg.initial_capital > 0 else 0.0
        net_sign = "+" if result.net_profit >= 0 else ""
        self._log.append(f"[RESULT] Strategy        : {name}")
        self._log.append(f"[RESULT] Period          : {t_start}  →  {t_end}")
        self._sep()
        self._log.append(f"[RESULT] Total Trades    : {result.total_trades}")
        self._log.append(f"[RESULT] Win / Loss      : {result.winning_trades}W / {result.losing_trades}L  (Win Rate: {result.win_rate:.1f}%)")
        self._sep()
        self._log.append(f"[RESULT] Net P&L         : {net_sign}${result.net_profit:,.2f}  ({net_sign}{net_pct:.2f}%)")
        if trades:
            gross_profit = sum(t.profit for t in trades if t.profit > 0)
            gross_loss   = abs(sum(t.profit for t in trades if t.profit < 0))
            best_trade   = max(trades, key=lambda t: t.profit)
            worst_trade  = min(trades, key=lambda t: t.profit)
            self._log.append(f"[RESULT] Gross Profit    : +${gross_profit:,.2f}")
            self._log.append(f"[RESULT] Gross Loss      : -${gross_loss:,.2f}")
            self._log.append(f"[RESULT] Profit Factor   : {result.profit_factor:.2f}")
            self._sep()
            self._log.append(f"[RESULT] Max Drawdown    : ${result.max_drawdown:,.2f}  ({result.max_drawdown_pct:.2f}%)")
            self._log.append(f"[RESULT] Sharpe Ratio    : {result.sharpe_ratio:.2f}")
            self._log.append(f"[RESULT] Expectancy      : {net_sign}${result.expectancy:.2f} / trade")
            self._log.append(f"[RESULT] Avg Duration    : {self._fmt_duration(result.avg_trade_duration)}")
            self._sep()
            self._log.append(f"[RESULT] Best Trade      : +${best_trade.profit:.2f}  (Trade #{best_trade.trade_number}  {best_trade.open_time})")
            self._log.append(f"[RESULT] Worst Trade     : -${abs(worst_trade.profit):.2f}  (Trade #{worst_trade.trade_number}  {worst_trade.open_time})")

            # Consecutive wins / losses
            max_consec_w = max_consec_l = cur_w = cur_l = 0
            for t in trades:
                if t.profit > 0:
                    cur_w += 1; cur_l = 0
                else:
                    cur_l += 1; cur_w = 0
                max_consec_w = max(max_consec_w, cur_w)
                max_consec_l = max(max_consec_l, cur_l)
            self._log.append(f"[RESULT] Max Consec Wins : {max_consec_w}")
            self._log.append(f"[RESULT] Max Consec Loss : {max_consec_l}")

        self._sep("━")
        return result

    # ──────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────

    def _calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Compute all indicators referenced in strategy conditions.
        Columns are named like RSI_14, EMA_50, EMA_200, etc.
        """
        from app.engine.indicators.trend import ema, sma, vwap, supertrend, vwap_bands
        from app.engine.indicators.momentum import rsi, macd, stochastic, cci, williams_r, adx
        from app.engine.indicators.volatility import atr, bollinger_bands, keltner_channel
        from app.engine.indicators.volume import obv, cmf
        from app.engine.indicators.ict import detect_fvg, detect_order_blocks, detect_bos, detect_swing_highs_lows

        ind_df = df[["open", "high", "low", "close", "volume"]].copy()

        # Include filter indicator references so their columns are pre-computed
        filter_conds = [
            {"indicator": k.upper(), "params": {pk: pv for pk, pv in v.items() if pk != "threshold"}}
            for k, v in self.strategy.get("filters", {}).items()
        ]

        conditions = (
            self.strategy.get("entry_conditions", [])
            + self.strategy.get("exit_conditions", [])
            + filter_conds
        )

        seen: set[str] = set()

        for cond in conditions:
            for ind_key in ("indicator", "target"):
                ind_name = cond.get(ind_key, "")
                if not ind_name:
                    continue
                params = cond.get("params", {}) if ind_key == "indicator" else cond.get("target_params", {})
                col = _col_name(ind_name, params)
                if col in seen:
                    continue
                seen.add(col)

                ind_upper = ind_name.upper()

                try:
                    if ind_upper == "RSI":
                        period = int(params.get("period", 14))
                        ind_df[col] = rsi(df["close"], period)

                    elif ind_upper == "EMA":
                        period = int(params.get("period", 20))
                        ind_df[col] = ema(df["close"], period)

                    elif ind_upper == "SMA":
                        period = int(params.get("period", 50))
                        ind_df[col] = sma(df["close"], period)

                    elif ind_upper == "MACD":
                        fast = int(params.get("fast", 12))
                        slow = int(params.get("slow", 26))
                        sig = int(params.get("signal", 9))
                        macd_df = macd(df["close"], fast, slow, sig)
                        ind_df[f"{col}_macd"] = macd_df["macd"]
                        ind_df[f"{col}_signal"] = macd_df["signal"]
                        ind_df[f"{col}_histogram"] = macd_df["histogram"]
                        # Also store under plain col for cross-checks
                        ind_df[col] = macd_df["macd"]

                    elif ind_upper == "ATR":
                        period = int(params.get("period", 14))
                        ind_df[col] = atr(df, period)

                    elif ind_upper in ("BOLLINGER", "BB"):
                        period = int(params.get("period", 20))
                        std = float(params.get("std_dev", params.get("stdDev", 2.0)))
                        bb_df = bollinger_bands(df["close"], period, std)
                        ind_df[f"{col}_upper"] = bb_df["upper"]
                        ind_df[f"{col}_middle"] = bb_df["middle"]
                        ind_df[f"{col}_lower"] = bb_df["lower"]
                        ind_df[col] = bb_df["middle"]

                    elif ind_upper in ("KELTNER", "KC"):
                        period = int(params.get("period", 20))
                        mult = float(params.get("multiplier", 2.0))
                        kc_df = keltner_channel(df, period, mult)
                        ind_df[f"{col}_upper"] = kc_df["upper"]
                        ind_df[f"{col}_middle"] = kc_df["middle"]
                        ind_df[f"{col}_lower"] = kc_df["lower"]
                        ind_df[col] = kc_df["middle"]

                    elif ind_upper == "STOCHASTIC":
                        k_p = int(params.get("k_period", 14))
                        d_p = int(params.get("d_period", 3))
                        stoch_df = stochastic(df, k_p, d_p)
                        ind_df[f"{col}_k"] = stoch_df["k"]
                        ind_df[f"{col}_d"] = stoch_df["d"]
                        ind_df[col] = stoch_df["k"]

                    elif ind_upper == "CCI":
                        period = int(params.get("period", 20))
                        ind_df[col] = cci(df, period)

                    elif ind_upper == "WILLIAMS_R":
                        period = int(params.get("period", 14))
                        ind_df[col] = williams_r(df, period)

                    elif ind_upper == "VWAP":
                        try:
                            ind_df[col] = vwap(df)
                        except Exception as e:
                            logger.warning("VWAP calculation failed: %s", e)
                            ind_df[col] = df["close"].rolling(20).mean()

                    elif ind_upper == "SUPERTREND":
                        period = int(params.get("period", 10))
                        mult = float(params.get("multiplier", 3.0))
                        st_df = supertrend(df, period, mult)
                        ind_df[f"{col}_st"] = st_df["supertrend"]
                        ind_df[f"{col}_dir"] = st_df["direction"]
                        ind_df[col] = st_df["direction"]

                    elif ind_upper == "OBV":
                        ind_df[col] = obv(df)

                    elif ind_upper == "CMF":
                        period = int(params.get("period", 20))
                        ind_df[col] = cmf(df, period)

                    elif ind_upper == "ADX":
                        period = int(params.get("period", 14))
                        ind_df[col] = adx(df, period)

                    elif ind_upper == "VWAP_UPPER_TOUCH":
                        # Returns 1.0 when close is above the upper VWAP band (SHORT mean-reversion signal)
                        mult = float(params.get("multiplier", 1.5))
                        try:
                            bands = vwap_bands(df, mult)
                            ind_df[col] = (df["close"] > bands["upper"]).astype(float)
                        except Exception as e:
                            logger.warning("VWAP_UPPER_TOUCH failed: %s", e)
                            ind_df[col] = 0.0

                    elif ind_upper == "VWAP_LOWER_TOUCH":
                        # Returns 1.0 when close is below the lower VWAP band (LONG mean-reversion signal)
                        mult = float(params.get("multiplier", 1.5))
                        try:
                            bands = vwap_bands(df, mult)
                            ind_df[col] = (df["close"] < bands["lower"]).astype(float)
                        except Exception as e:
                            logger.warning("VWAP_LOWER_TOUCH failed: %s", e)
                            ind_df[col] = 0.0

                    elif ind_upper == "FVG":
                        min_gap = float(params.get("min_gap_pips", 1.0))
                        fvg_df = detect_fvg(df, min_gap)
                        ind_df[f"{col}_bull"] = fvg_df["fvg_bull"].astype(float)
                        ind_df[f"{col}_bear"] = fvg_df["fvg_bear"].astype(float)
                        ind_df[col] = fvg_df["fvg_bull"].astype(float)

                    elif ind_upper == "ORDER_BLOCK":
                        lb = int(params.get("lookback", 10))
                        ob_df = detect_order_blocks(df, lb)
                        ind_df[f"{col}_bull"] = ob_df["ob_bull"].astype(float)
                        ind_df[f"{col}_bear"] = ob_df["ob_bear"].astype(float)
                        ind_df[col] = ob_df["ob_bull"].astype(float)

                    elif ind_upper == "BOS":
                        lb = int(params.get("lookback", 10))
                        bos_df = detect_bos(df, lb)
                        ind_df[f"{col}_bull"] = bos_df["bos_bull"].astype(float)
                        ind_df[f"{col}_bear"] = bos_df["bos_bear"].astype(float)
                        ind_df[col] = bos_df["bos_bull"].astype(float)

                    elif ind_upper == "SWING":
                        lb = int(params.get("left_bars", 5))
                        rb = int(params.get("right_bars", 5))
                        sw_df = detect_swing_highs_lows(df, lb, rb)
                        ind_df[f"{col}_high"] = sw_df["swing_high"].astype(float)
                        ind_df[f"{col}_low"] = sw_df["swing_low"].astype(float)
                        ind_df[col] = sw_df["swing_high"].astype(float)

                    else:
                        logger.warning("Unknown indicator in strategy: %s", ind_name)

                except Exception as exc:
                    logger.error("Failed to calculate indicator %s: %s", col, exc, exc_info=True)
                    self._log.append(f"[INDICATORS] ERROR calculating {col}: {exc}")

        return ind_df

    def _evaluate_filters(self, idx: int, indicators_df: pd.DataFrame) -> bool:
        """
        Evaluate filter blocks. Returns False if any filter blocks entry.
        Currently supported filters:
          - adx: blocks entry when ADX >= threshold (trending market filter for mean reversion)
        """
        filters = self.strategy.get("filters", {})
        if not filters:
            return True

        for indicator_id, params in filters.items():
            ind_upper = indicator_id.upper()

            if ind_upper == "ADX":
                period = int(params.get("period", 14))
                threshold = float(params.get("threshold", 25.0))
                col = _col_name("ADX", {"period": period})
                if col in indicators_df.columns:
                    adx_val = indicators_df[col].iloc[idx]
                    if not pd.isna(adx_val) and float(adx_val) >= threshold:
                        return False  # Trending — block mean-reversion entry

        return True

    def _check_entry(
        self,
        idx: int,
        indicators_df: pd.DataFrame,
        direction: str,
        entry_fn,
        pip_size: float = 0.0001,
    ) -> tuple[str, float]:
        """
        Returns (direction_str, entry_price).
        direction_str is 'LONG', 'SHORT', or 'NONE'.
        """
        signal = entry_fn(idx, indicators_df)
        if not signal:
            return ("NONE", 0.0)

        bar = self.ohlcv.iloc[idx]
        # slippage is in pips/ticks — convert to price distance before adding
        entry_price = float(bar["close"]) + self.config.slippage * pip_size

        if direction == "LONG":
            return ("LONG", entry_price)
        elif direction == "SHORT":
            return ("SHORT", entry_price)
        else:
            # BOTH — use simple momentum heuristic: if close > open → LONG else SHORT
            if bar["close"] >= bar["open"]:
                return ("LONG", entry_price)
            else:
                return ("SHORT", entry_price)

    def _check_exit(
        self,
        position: dict,
        idx: int,
        indicators_df: pd.DataFrame,
    ) -> tuple[bool, str]:
        """Check signal-based exit conditions."""
        exit_conditions = self.strategy.get("exit_conditions", [])
        if not exit_conditions:
            return (False, "")

        exit_fn = parse_conditions(exit_conditions)
        should_exit = exit_fn(idx, indicators_df)
        return (should_exit, "SIGNAL")

    def _check_sl_tp(
        self,
        position: dict,
        bar: pd.Series,
    ) -> tuple[bool, str, float]:
        """
        Check if SL or TP is hit on the current bar.
        Uses bar high/low to detect touches.

        Returns (triggered, reason, exit_price).
        """
        sl = position.get("stop_loss")
        tp = position.get("take_profit")
        direction = position["direction"]
        bar_high = float(bar["high"])
        bar_low = float(bar["low"])
        bar_open = float(bar["open"])

        if direction == "LONG":
            if sl is not None and bar_low <= sl:
                return (True, "SL", sl)
            if tp is not None and bar_high >= tp:
                return (True, "TP", tp)
        else:  # SHORT
            if sl is not None and bar_high >= sl:
                return (True, "SL", sl)
            if tp is not None and bar_low <= tp:
                return (True, "TP", tp)

        return (False, "", 0.0)

    def _calculate_sl_tp(
        self,
        direction: str,
        idx: int,
        entry_price: float,
        pip_size: float,
    ) -> tuple[float, float]:
        """
        Calculate SL and TP prices using ATR-based logic.
        Fallback to fixed 20-pip SL / 40-pip TP.
        """
        try:
            from app.engine.indicators.volatility import atr as calc_atr
            atr_val = float(calc_atr(self.ohlcv.iloc[: idx + 1], 14).iloc[-1])
            sl_distance = atr_val * 1.5
            tp_distance = atr_val * 3.0
        except Exception:
            sl_distance = 20 * pip_size
            tp_distance = 40 * pip_size

        if direction == "LONG":
            sl = entry_price - sl_distance
            tp = entry_price + tp_distance
        else:
            sl = entry_price + sl_distance
            tp = entry_price - tp_distance

        return (sl, tp)

    def _size_position(
        self,
        balance: float,
        risk_pct: float,
        entry: float,
        sl: float,
        pip_value: float,
    ) -> float:
        return calculate_lot_size(balance, risk_pct, entry, sl, pip_value)

    def _close_position(
        self,
        position: dict,
        exit_price: float,
        close_time: datetime,
        exit_reason: str,
        balance: float,
        pip_size: float,
        trade_counter: int,
    ) -> TradeResult:
        """Calculate P&L and return a TradeResult."""
        direction = position["direction"]
        entry_price = position["entry_price"]
        lot_size = position["lot_size"]
        pip_value = position.get("pip_value", 10.0)

        if direction == "LONG":
            pips = (exit_price - entry_price) / pip_size
        else:
            pips = (entry_price - exit_price) / pip_size

        profit = pips * pip_value * lot_size
        # Deduct commission and spread costs
        spread_cost = self.config.spread * pip_value * lot_size
        commission_cost = self.config.commission * lot_size * 2  # per side
        profit = profit - spread_cost - commission_cost
        running_balance = balance + profit

        return TradeResult(
            trade_number=trade_counter + 1,
            open_time=position["open_time"],
            close_time=close_time,
            instrument=self.instrument,
            direction=direction,
            entry_price=entry_price,
            exit_price=exit_price,
            stop_loss=position.get("stop_loss"),
            take_profit=position.get("take_profit"),
            lot_size=lot_size,
            pips=round(pips, 1),
            profit=round(profit, 2),
            running_balance=round(running_balance, 2),
            exit_reason=exit_reason,
        )

    def _calculate_stats(
        self,
        trades: list[TradeResult],
        equity_curve: list[dict],
        initial_capital: float,
    ) -> dict:
        """Compute aggregate statistics from trade list and equity curve."""
        if not trades:
            return {
                "net_profit": 0.0,
                "total_trades": 0,
                "winning_trades": 0,
                "losing_trades": 0,
                "win_rate": 0.0,
                "profit_factor": 0.0,
                "max_drawdown": 0.0,
                "max_drawdown_pct": 0.0,
                "sharpe_ratio": 0.0,
                "expectancy": 0.0,
                "avg_trade_duration": 0.0,
            }

        profits = [t.profit for t in trades]
        gross_profit = sum(p for p in profits if p > 0)
        gross_loss = abs(sum(p for p in profits if p < 0))
        winning = [t for t in trades if t.profit > 0]
        losing = [t for t in trades if t.profit <= 0]

        net_profit = sum(profits)
        total = len(trades)
        win_rate = len(winning) / total * 100 if total > 0 else 0.0
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else (gross_profit if gross_profit > 0 else 0.0)
        expectancy = net_profit / total if total > 0 else 0.0

        # Max drawdown from equity curve
        balances = [initial_capital] + [ec["balance"] for ec in equity_curve]
        eq_series = pd.Series(balances)
        rolling_max = eq_series.cummax()
        drawdowns = rolling_max - eq_series
        max_drawdown = float(drawdowns.max())
        max_drawdown_pct = (max_drawdown / rolling_max[drawdowns.idxmax()] * 100) if max_drawdown > 0 else 0.0

        # Sharpe ratio (annualised, using daily returns approximation)
        if len(profits) > 1:
            profit_arr = np.array(profits)
            mean_p = np.mean(profit_arr)
            std_p = np.std(profit_arr, ddof=1)
            sharpe = (mean_p / std_p * np.sqrt(252)) if std_p > 0 else 0.0
        else:
            sharpe = 0.0

        # Average trade duration in hours
        durations = []
        for t in trades:
            td = (t.close_time - t.open_time).total_seconds() / 3600.0
            durations.append(td)
        avg_duration = float(np.mean(durations)) if durations else 0.0

        return {
            "net_profit": round(net_profit, 2),
            "total_trades": total,
            "winning_trades": len(winning),
            "losing_trades": len(losing),
            "win_rate": round(win_rate, 2),
            "profit_factor": round(profit_factor, 2),
            "max_drawdown": round(max_drawdown, 2),
            "max_drawdown_pct": round(max_drawdown_pct, 2),
            "sharpe_ratio": round(sharpe, 2),
            "expectancy": round(expectancy, 2),
            "avg_trade_duration": round(avg_duration, 2),
        }
