export interface BacktestConfig {
  strategyId: string;
  instruments: string[]; // multi-select checkbox pairs
  timeframe: string;
  dateFrom: string;
  dateTo: string;
  initialCapital: number;
  spread: number;
  commission: number;
  slippage: number;
  timeStopBars: number;
}

export interface BacktestLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface BacktestTrade {
  id: string;
  index: number;
  date: string;
  closeDate?: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  pips: number;
  pnl: number;
  balance: number;
  exitReason?: 'TP' | 'SL' | 'SIGNAL' | 'EOD' | 'TIME';
  lotSize?: number;
}

export interface BacktestSummaryMetrics {
  netProfitPercent: number;
  netProfitValue: number;
  totalTrades: number;
  winRate: number; // percentage, e.g. 58.5
  profitFactor: number;
  maxDrawdown: number; // percentage, e.g. 4.2
  avgTradeDuration: string; // e.g., "4h 12m"
  sharpeRatio: number;
  expectancy: number; // in pips per trade
}
