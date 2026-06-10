import { Strategy, StrategyBlock } from '../types/strategy';
import { BacktestSummaryMetrics, BacktestTrade } from '../types/backtest';

// ─── Direction ────────────────────────────────────────────────────────────────

export const directionToBackend = (dir: string): string => {
  if (dir === 'Long Only') return 'LONG';
  if (dir === 'Short Only') return 'SHORT';
  return 'BOTH';
};

export const directionFromBackend = (dir: string): Strategy['direction'] => {
  if (dir === 'LONG') return 'Long Only';
  if (dir === 'SHORT') return 'Short Only';
  return 'Both';
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const sessionsToBackend = (sessions: Strategy['sessions']): string[] => {
  const result: string[] = [];
  if (sessions.london) result.push('london');
  if (sessions.newYork) result.push('newYork');
  if (sessions.asia) result.push('asia');
  if (sessions.overlap) result.push('overlap');
  return result;
};

export const sessionsFromBackend = (sessionFilter: string[]): Strategy['sessions'] => ({
  london: sessionFilter.includes('london'),
  newYork: sessionFilter.includes('newYork'),
  asia: sessionFilter.includes('asia'),
  overlap: sessionFilter.includes('overlap'),
});

// ─── Blocks ↔ Conditions ──────────────────────────────────────────────────────

const INDICATOR_NAME_MAP: Record<string, string> = {
  ema: 'Exponential Moving Average (EMA)',
  sma: 'Simple Moving Average (SMA)',
  rsi: 'Relative Strength Index (RSI)',
  macd: 'MACD (Moving Average Convergence Divergence)',
  bollinger: 'Bollinger Bands',
  atr: 'Average True Range (ATR)',
  stochastic: 'Stochastic Oscillator',
  cci: 'Commodity Channel Index (CCI)',
  vwap: 'Volume Weighted Average Price (VWAP)',
  supertrend: 'Supertrend',
  fvg: 'Fair Value Gap (FVG)',
  orderblock: 'Order Block (OB)',
  liquidity: 'Liquidity Sweeps',
  bos: 'Break of Structure (BOS)',
  obv: 'On-Balance Volume (OBV)',
  cmf: 'Chaikin Money Flow (CMF)',
  williams_r: "Williams %R",
  keltner: 'Keltner Channels',
};

const friendlyName = (id: string) =>
  INDICATOR_NAME_MAP[id.toLowerCase()] || id.toUpperCase();

export const blocksToBackend = (blocks: StrategyBlock[]) => {
  const entryConditions = blocks
    .filter(b => b.type === 'entry')
    .map(b => ({
      indicator: b.indicatorId.toUpperCase(),
      params: b.parameters,
      operator: 'GREATER_THAN',
      value: 0,
      logic: 'AND',
    }));

  const exitConditions = blocks
    .filter(b => b.type === 'exit')
    .map(b => ({
      indicator: b.indicatorId.toUpperCase(),
      params: b.parameters,
      operator: 'GREATER_THAN',
      value: 0,
      logic: 'AND',
    }));

  const filters = Object.fromEntries(
    blocks.filter(b => b.type === 'filter').map(b => [b.indicatorId, b.parameters])
  );

  return { entry_conditions: entryConditions, exit_conditions: exitConditions, filters };
};

export const blocksFromBackend = (data: {
  entry_conditions: any[];
  exit_conditions: any[];
  filters: Record<string, any>;
}): StrategyBlock[] => {
  const blocks: StrategyBlock[] = [];

  (data.entry_conditions || []).forEach((cond: any, i: number) => {
    const id = (cond.indicator || '').toLowerCase();
    blocks.push({ id: `be-${i}`, type: 'entry', indicatorId: id, name: friendlyName(id), parameters: cond.params || {} });
  });

  (data.exit_conditions || []).forEach((cond: any, i: number) => {
    const id = (cond.indicator || '').toLowerCase();
    blocks.push({ id: `bx-${i}`, type: 'exit', indicatorId: id, name: friendlyName(id), parameters: cond.params || {} });
  });

  Object.entries(data.filters || {}).forEach(([indicatorId, params], i) => {
    blocks.push({ id: `bf-${i}`, type: 'filter', indicatorId: indicatorId.toLowerCase(), name: friendlyName(indicatorId), parameters: params as Record<string, any> });
  });

  return blocks;
};

// ─── Strategy ─────────────────────────────────────────────────────────────────

export const strategyFromBackend = (data: any): Strategy => ({
  id: data.id,
  name: data.name,
  instrument: data.instrument,
  timeframe: data.timeframe,
  sessions: sessionsFromBackend(data.session_filter || []),
  direction: directionFromBackend(data.direction),
  riskPerTrade: data.risk_per_trade,
  maxDailyDrawdown: data.max_daily_drawdown,
  blocks: blocksFromBackend({
    entry_conditions: data.entry_conditions || [],
    exit_conditions: data.exit_conditions || [],
    filters: data.filters || {},
  }),
  isFavorite: false,
});

export const strategyToBackend = (s: Strategy) => ({
  name: s.name,
  description: null,
  instrument: s.instrument,
  timeframe: s.timeframe,
  direction: directionToBackend(s.direction),
  session_filter: sessionsToBackend(s.sessions),
  risk_per_trade: s.riskPerTrade,
  max_daily_drawdown: s.maxDailyDrawdown,
  ...blocksToBackend(s.blocks),
  is_active: true,
});

// ─── Backtest metrics ─────────────────────────────────────────────────────────

export const metricsFromBackend = (data: any): BacktestSummaryMetrics => {
  const initialCapital = data.initial_capital || 10000;
  const netProfit = data.net_profit || 0;
  return {
    netProfitPercent: initialCapital > 0 ? parseFloat(((netProfit / initialCapital) * 100).toFixed(2)) : 0,
    netProfitValue: netProfit,
    totalTrades: data.total_trades || 0,
    winRate: data.win_rate || 0,
    profitFactor: data.profit_factor || 0,
    maxDrawdown: data.max_drawdown || 0,
    avgTradeDuration: '—',
    sharpeRatio: data.sharpe_ratio || 0,
    expectancy: data.expectancy || 0,
  };
};

// ─── Trade ────────────────────────────────────────────────────────────────────

export const tradeFromBackend = (t: any): BacktestTrade => ({
  id: t.id,
  index: t.trade_number,
  date: t.open_time ? new Date(t.open_time).toLocaleString() : '',
  pair: t.instrument,
  direction: t.direction as 'LONG' | 'SHORT',
  entryPrice: t.entry_price,
  exitPrice: t.exit_price,
  pips: t.pips,
  pnl: t.profit,
  balance: t.running_balance,
});
