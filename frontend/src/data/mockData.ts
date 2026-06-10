import { Strategy } from '../types/strategy';
import { IndicatorMetadata, SignalPreview } from '../types/indicator';
import { BacktestTrade } from '../types/backtest';

// 1. Indicators Database Metadata
export const INDICATORS_METADATA: IndicatorMetadata[] = [
  // Trend
  {
    id: 'ema',
    name: 'Exponential Moving Average (EMA)',
    category: 'Trend',
    description: 'Calculates the exponential moving average of price over a specific window of trading periods, giving more weight to recent prices.',
    parameters: [
      { key: 'period', name: 'Period', type: 'number', default: 20 },
      { key: 'source', name: 'Source', type: 'select', default: 'close', options: ['close', 'open', 'high', 'low', 'hl2', 'hlc3', 'ohlc4'] }
    ]
  },
  {
    id: 'sma',
    name: 'Simple Moving Average (SMA)',
    category: 'Trend',
    description: 'An arithmetic moving average calculated by adding recent closing prices and then dividing by the number of time periods.',
    parameters: [
      { key: 'period', name: 'Period', type: 'number', default: 50 },
      { key: 'source', name: 'Source', type: 'select', default: 'close', options: ['close', 'open', 'high', 'low'] }
    ]
  },
  {
    id: 'vwap',
    name: 'Volume Weighted Average Price (VWAP)',
    category: 'Trend',
    description: 'Provides the average price a security has traded at throughout the day, based on both volume and price.',
    parameters: [
      { key: 'anchor', name: 'Anchor Period', type: 'select', default: 'Session', options: ['Session', 'Week', 'Month', 'Year'] }
    ]
  },
  {
    id: 'supertrend',
    name: 'Supertrend',
    category: 'Trend',
    description: 'A trend-following indicator based on Average True Range (ATR) that overlays buy and sell labels on the price action.',
    parameters: [
      { key: 'atrPeriod', name: 'ATR Period', type: 'number', default: 10 },
      { key: 'multiplier', name: 'Multiplier', type: 'number', default: 3 }
    ]
  },
  {
    id: 'ichimoku',
    name: 'Ichimoku Cloud',
    category: 'Trend',
    description: 'A comprehensive indicator that defines support/resistance, identifies trend direction, gauges momentum and provides trading signals.',
    parameters: [
      { key: 'conversionLine', name: 'Conversion Line (Tenkan)', type: 'number', default: 9 },
      { key: 'baseLine', name: 'Base Line (Kijun)', type: 'number', default: 26 },
      { key: 'leadingSpanB', name: 'Leading Span B (Senkou B)', type: 'number', default: 52 },
      { key: 'displacement', name: 'Displacement', type: 'number', default: 26 }
    ]
  },

  // Momentum
  {
    id: 'rsi',
    name: 'Relative Strength Index (RSI)',
    category: 'Momentum',
    description: 'Measures the speed and change of price movements, ranging between 0 and 100 to identify overbought (>70) and oversold (<30) zones.',
    parameters: [
      { key: 'period', name: 'Period', type: 'number', default: 14 },
      { key: 'overbought', name: 'Overbought Level', type: 'number', default: 70 },
      { key: 'oversold', name: 'Oversold Level', type: 'number', default: 30 }
    ]
  },
  {
    id: 'macd',
    name: 'MACD (Moving Average Convergence Divergence)',
    category: 'Momentum',
    description: 'A trend-following momentum indicator that shows the relationship between two moving averages of a security’s price.',
    parameters: [
      { key: 'fastLength', name: 'Fast Length', type: 'number', default: 12 },
      { key: 'slowLength', name: 'Slow Length', type: 'number', default: 26 },
      { key: 'signalLength', name: 'Signal Smoothing', type: 'number', default: 9 }
    ]
  },
  {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    category: 'Momentum',
    description: 'Compares a specific closing price of a security to a range of its prices over a certain period of time.',
    parameters: [
      { key: 'kPeriod', name: '%K Period', type: 'number', default: 14 },
      { key: 'dPeriod', name: '%D Period', type: 'number', default: 3 },
      { key: 'slowing', name: 'Slowing', type: 'number', default: 3 }
    ]
  },
  {
    id: 'cci',
    name: 'Commodity Channel Index (CCI)',
    category: 'Momentum',
    description: 'An oscillator that measures a security’s variation from its statistical average to assess trend strength and speed.',
    parameters: [
      { key: 'period', name: 'Period', type: 'number', default: 20 }
    ]
  },
  {
    id: 'williams_r',
    name: 'Williams %R',
    category: 'Momentum',
    description: 'A momentum indicator that measures overbought and oversold levels, similar to the Stochastic, moving on a scale of -100 to 0.',
    parameters: [
      { key: 'period', name: 'Period', type: 'number', default: 14 }
    ]
  },

  // Volatility
  {
    id: 'atr',
    name: 'Average True Range (ATR)',
    category: 'Volatility',
    description: 'Measures market volatility by decomposing the entire range of an asset price for that period.',
    parameters: [
      { key: 'period', name: 'Period', type: 'number', default: 14 }
    ]
  },
  {
    id: 'bollinger',
    name: 'Bollinger Bands',
    category: 'Volatility',
    description: 'An upper envelope, lower envelope, and central moving average line based on standard deviation of prices to denote expansion/squeeze.',
    parameters: [
      { key: 'period', name: 'Period', type: 'number', default: 20 },
      { key: 'stdDev', name: 'StdDev Multiplier', type: 'number', default: 2 }
    ]
  },
  {
    id: 'keltner',
    name: 'Keltner Channels',
    category: 'Volatility',
    description: 'Volatility-based envelopes that are set above and below an exponential moving average, bounded by ATR lines.',
    parameters: [
      { key: 'emaPeriod', name: 'EMA Period', type: 'number', default: 20 },
      { key: 'atrPeriod', name: 'ATR Period', type: 'number', default: 10 },
      { key: 'multiplier', name: 'Multiplier', type: 'number', default: 1.5 }
    ]
  },

  // Volume
  {
    id: 'obv',
    name: 'On-Balance Volume (OBV)',
    category: 'Volume',
    description: 'Uses volume flow to predict changes in stock price, acting as a momentum indicator that correlates volume with breakouts.',
    parameters: []
  },
  {
    id: 'cmf',
    name: 'Chaikin Money Flow (CMF)',
    category: 'Volume',
    description: 'Measures the amount of Money Flow Volume over a specific period, indicating accumulation and distribution behavior.',
    parameters: [
      { key: 'period', name: 'Period', type: 'number', default: 20 }
    ]
  },

  // ICT Concepts
  {
    id: 'fvg',
    name: 'Fair Value Gap (FVG)',
    category: 'ICT Concepts',
    description: 'Identifies 3-candle price gaps where heavy structural interest left incomplete buy or sell side deliveries.',
    parameters: [
      { key: 'minSizePips', name: 'Min Size (Pips)', type: 'number', default: 5 },
      { key: 'colorUnfilled', name: 'Highlight Gaps', type: 'boolean', default: true }
    ]
  },
  {
    id: 'orderblock',
    name: 'Order Block (OB)',
    category: 'ICT Concepts',
    description: 'Pinpoints institutional trace areas where large limit buying/selling transactions occurred, establishing key support/resistance zones.',
    parameters: [
      { key: 'lookback', name: 'Lookback Candles', type: 'number', default: 200 },
      { key: 'showMitigated', name: 'Show Mitigated OBs', type: 'boolean', default: false }
    ]
  },
  {
    id: 'liquidity',
    name: 'Liquidity Sweeps',
    category: 'ICT Concepts',
    description: 'Tracks sweeps of high/low pools where stop losses are clustered, often indicating instant sharp market reversals.',
    parameters: [
      { key: 'levelTimeframe', name: 'Swing Level', type: 'select', default: 'Daily', options: ['Hourly', 'Daily', 'Weekly'] }
    ]
  },
  {
    id: 'bos',
    name: 'Break of Structure (BOS)',
    category: 'ICT Concepts',
    description: 'Identifies price breaks that align with the ongoing major structural trend line direction.',
    parameters: [
      { key: 'bosMethod', name: 'BOS Confirmation', type: 'select', default: 'Candle Close', options: ['Candle Close', 'Wick Penetration'] }
    ]
  },
  {
    id: 'mss',
    name: 'Market Structure Shift (MSS)',
    category: 'ICT Concepts',
    description: 'Identifies the first break of structural highs or lows that hints at a fundamental trend reversal direction.',
    parameters: [
      { key: 'lookbackBars', name: 'Swing Period', type: 'number', default: 50 }
    ]
  }
];

// Helper to find pre-configured indicator rules in generic wording
export const getBlockDescription = (block: { type: string; name: string; parameters: any }) => {
  const p = block.parameters;
  switch (block.name) {
    case 'Exponential Moving Average (EMA)':
      return `${block.type === 'entry' ? 'Enter' : block.type === 'exit' ? 'Exit' : 'Filter'} when price crosses EMA (period: ${p.period || 20}, source: ${p.source || 'close'})`;
    case 'Relative Strength Index (RSI)':
      return `RSI (period: ${p.period || 14}) is below ${p.oversold || 30} for LONG, or above ${p.overbought || 70} for SHORT`;
    case 'Fair Value Gap (FVG)':
      return `Wait for active Fair Value Gap confirmation on current timeframe and a full candle transition`;
    case 'Order Block (OB)':
      return `Valid institutional Order Block created within the last ${p.lookback || 200} candles`;
    case 'Volume Weighted Average Price (VWAP)':
      return `Check if price level is relative to current day/session VWAP anchor`;
    default:
      const paramsText = Object.entries(p).map(([k, v]) => `${k}: ${v}`).join(', ');
      return `${block.name} condition evaluated (${paramsText})`;
  }
};

// 2. Sample Strategies
export const INITIAL_STRATEGIES: Strategy[] = [
  {
    id: 'strat-1',
    name: 'XAUUSD Trend Scalper',
    instrument: 'XAUUSD',
    timeframe: 'M15',
    sessions: { london: true, newYork: true, asia: false, overlap: true },
    direction: 'Both',
    riskPerTrade: 1.0,
    maxDailyDrawdown: 3.5,
    winRate: 64.2,
    netProfit: 24.8,
    drawdown: 3.1,
    isFavorite: true,
    blocks: [
      {
        id: 'block-1',
        type: 'entry',
        indicatorId: 'rsi',
        name: 'Relative Strength Index (RSI)',
        parameters: { period: 14, overbought: 70, oversold: 30 }
      },
      {
        id: 'block-2',
        type: 'filter',
        indicatorId: 'ema',
        name: 'Exponential Moving Average (EMA)',
        parameters: { period: 200, source: 'close' }
      },
      {
        id: 'block-3',
        type: 'exit',
        indicatorId: 'bollinger',
        name: 'Bollinger Bands',
        parameters: { period: 20, stdDev: 2 }
      }
    ]
  },
  {
    id: 'strat-2',
    name: 'EURUSD Session Breakout',
    instrument: 'EURUSD',
    timeframe: 'H1',
    sessions: { london: true, newYork: true, asia: false, overlap: true },
    direction: 'Both',
    riskPerTrade: 0.5,
    maxDailyDrawdown: 2.0,
    winRate: 58.5,
    netProfit: 12.4,
    drawdown: 4.2,
    isFavorite: false,
    blocks: [
      {
        id: 'block-4',
        type: 'entry',
        indicatorId: 'supertrend',
        name: 'Supertrend',
        parameters: { atrPeriod: 10, multiplier: 3 }
      },
      {
        id: 'block-5',
        type: 'filter',
        indicatorId: 'vwap',
        name: 'Volume Weighted Average Price (VWAP)',
        parameters: { anchor: 'Session' }
      }
    ]
  },
  {
    id: 'strat-3',
    name: 'GBPUSD FVG Liquidity',
    instrument: 'GBPUSD',
    timeframe: 'M5',
    sessions: { london: true, newYork: true, asia: true, overlap: true },
    direction: 'Long Only',
    riskPerTrade: 1.5,
    maxDailyDrawdown: 5.0,
    winRate: 61.1,
    netProfit: 18.2,
    drawdown: 2.8,
    isFavorite: true,
    blocks: [
      {
        id: 'block-6',
        type: 'entry',
        indicatorId: 'fvg',
        name: 'Fair Value Gap (FVG)',
        parameters: { minSizePips: 4, highlightGaps: true }
      },
      {
        id: 'block-7',
        type: 'filter',
        indicatorId: 'liquidity',
        name: 'Liquidity Sweeps',
        parameters: { levelTimeframe: 'Daily' }
      }
    ]
  },
  {
    id: 'strat-4',
    name: 'USDJPY Mean Reversion',
    instrument: 'USDJPY',
    timeframe: 'M30',
    sessions: { london: false, newYork: true, asia: true, overlap: false },
    direction: 'Both',
    riskPerTrade: 0.8,
    maxDailyDrawdown: 4.0,
    winRate: 54.0,
    netProfit: 8.9,
    drawdown: 5.5,
    isFavorite: false,
    blocks: [
      {
        id: 'block-8',
        type: 'entry',
        indicatorId: 'stochastic',
        name: 'Stochastic Oscillator',
        parameters: { kPeriod: 14, dPeriod: 3, slowing: 3 }
      },
      {
        id: 'block-9',
        type: 'filter',
        indicatorId: 'atr',
        name: 'Average True Range (ATR)',
        parameters: { period: 14 }
      }
    ]
  },
  {
    id: 'strat-5',
    name: 'AUDUSD Smart Money Flow',
    instrument: 'AUDUSD',
    timeframe: 'D1',
    sessions: { london: true, newYork: true, asia: true, overlap: true },
    direction: 'Both',
    riskPerTrade: 2.0,
    maxDailyDrawdown: 6.0,
    winRate: 52.3,
    netProfit: 14.5,
    drawdown: 6.2,
    isFavorite: false,
    blocks: [
      {
        id: 'block-10',
        type: 'entry',
        indicatorId: 'orderblock',
        name: 'Order Block (OB)',
        parameters: { lookback: 200, showMitigated: false }
      },
      {
        id: 'block-11',
        type: 'filter',
        indicatorId: 'bos',
        name: 'Break of Structure (BOS)',
        parameters: { bosMethod: 'Candle Close' }
      }
    ]
  }
];

// 3. 20 Detailed Backtest Trades (XAUUSD strategy)
export const MOCK_TRADES: BacktestTrade[] = [
  { id: 't-1', index: 1, date: '2026-05-11 14:15', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2011.50, exitPrice: 2015.80, pips: 43.0, pnl: 215.00, balance: 10215.00 },
  { id: 't-2', index: 2, date: '2026-05-12 09:30', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2014.20, exitPrice: 2016.90, pips: 27.0, pnl: 135.00, balance: 10350.00 },
  { id: 't-3', index: 3, date: '2026-05-12 16:45', pair: 'XAUUSD', direction: 'SHORT', entryPrice: 2018.10, exitPrice: 2012.30, pips: 58.0, pnl: 290.00, balance: 10640.00 },
  { id: 't-4', index: 4, date: '2026-05-14 11:00', pair: 'XAUUSD', direction: 'SHORT', entryPrice: 2010.50, exitPrice: 2013.40, pips: -29.0, pnl: -145.00, balance: 10495.00 },
  { id: 't-5', index: 5, date: '2026-05-15 15:30', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2012.00, exitPrice: 2021.50, pips: 95.0, pnl: 475.00, balance: 10970.00 },
  { id: 't-6', index: 6, date: '2026-05-18 10:15', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2024.10, exitPrice: 2020.80, pips: -33.0, pnl: -165.00, balance: 10805.00 },
  { id: 't-7', index: 7, date: '2026-05-19 13:00', pair: 'XAUUSD', direction: 'SHORT', entryPrice: 2022.00, exitPrice: 2015.50, pips: 65.0, pnl: 325.00, balance: 11130.00 },
  { id: 't-8', index: 8, date: '2026-05-20 14:30', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2016.40, exitPrice: 2019.80, pips: 34.0, pnl: 170.00, balance: 11300.00 },
  { id: 't-9', index: 9, date: '2026-05-21 16:15', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2020.20, exitPrice: 2025.10, pips: 49.0, pnl: 245.00, balance: 11545.00 },
  { id: 't-10', index: 10, date: '2026-05-22 08:30', pair: 'XAUUSD', direction: 'SHORT', entryPrice: 2028.90, exitPrice: 2031.50, pips: -26.0, pnl: -130.00, balance: 11415.00 },
  { id: 't-11', index: 11, date: '2026-05-25 10:45', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2026.00, exitPrice: 2028.90, pips: 29.0, pnl: 145.00, balance: 11560.00 },
  { id: 't-12', index: 12, date: '2026-05-26 15:00', pair: 'XAUUSD', direction: 'SHORT', entryPrice: 2033.40, exitPrice: 2024.20, pips: 92.0, pnl: 460.00, balance: 12020.00 },
  { id: 't-13', index: 13, date: '2026-05-27 12:15', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2023.10, exitPrice: 2021.50, pips: -16.0, pnl: -80.00, balance: 11940.00 },
  { id: 't-14', index: 14, date: '2026-05-27 16:30', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2022.00, exitPrice: 2024.90, pips: 29.0, pnl: 145.00, balance: 12085.00 },
  { id: 't-15', index: 15, date: '2026-05-29 09:00', pair: 'XAUUSD', direction: 'SHORT', entryPrice: 2030.50, exitPrice: 2033.80, pips: -33.0, pnl: -165.00, balance: 11920.00 },
  { id: 't-16', index: 16, date: '2026-06-01 14:00', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2029.00, exitPrice: 2035.70, pips: 67.0, pnl: 335.00, balance: 12255.00 },
  { id: 't-17', index: 17, date: '2026-06-03 11:30', pair: 'XAUUSD', direction: 'SHORT', entryPrice: 2038.50, exitPrice: 2036.00, pips: 25.0, pnl: 125.00, balance: 12380.00 },
  { id: 't-18', index: 18, date: '2026-06-04 15:45', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2034.20, exitPrice: 2031.90, pips: -23.0, pnl: -115.00, balance: 12265.00 },
  { id: 't-19', index: 19, date: '2026-06-05 13:15', pair: 'XAUUSD', direction: 'SHORT', entryPrice: 2032.50, exitPrice: 2027.00, pips: 55.0, pnl: 275.00, balance: 12540.00 },
  { id: 't-20', index: 20, date: '2026-06-08 10:00', pair: 'XAUUSD', direction: 'LONG', entryPrice: 2025.20, exitPrice: 2024.00, pips: -12.0, pnl: -60.00, balance: 12480.00 }
];

// Helper to generate a realistic 150-point series for Equity Curve Chart and distribution
// with some noise, minor drawdowns, and an upward trajectories
export const generateEquitySeries = () => {
  const data: { date: string; balance: number; spy: number; drawdown: number }[] = [];
  let currentBalance = 10000;
  let currentSpy = 10000;
  let peakBalance = 10000;
  
  const startDate = new Date(2026, 4, 10); // June 2026 target, let's start mid-May
  
  for (let i = 0; i <= 150; i++) {
    const tradeDate = new Date(startDate);
    tradeDate.setHours(tradeDate.getHours() + i * 4); // every 4 hours approx
    
    // Generate trending values
    // Win rate is ~60%, average win is higher than loss, upward trend
    let change = 0;
    const randomVal = Math.random();
    
    // Simulate periodic trades
    if (i % 3 === 0) {
      if (randomVal < 0.60) {
        // Win
        change = Math.floor(Math.random() * 150) + 50;
      } else {
        // Loss
        change = -Math.floor(Math.random() * 80) - 20;
      }
    } else {
      // Small fluctuation
      change = Math.floor(Math.random() * 20) - 8;
    }
    
    // SPY index benchmark trend
    let spyChange = Math.floor(Math.random() * 40) - 15;
    if (i > 40 && i < 80) spyChange -= 5; // mid dip
    currentSpy = Math.max(9000, currentSpy + spyChange);

    currentBalance = Math.max(8500, currentBalance + change);
    if (currentBalance > peakBalance) {
      peakBalance = currentBalance;
    }
    
    const maxDrawdown = peakBalance === 0 ? 0 : ((peakBalance - currentBalance) / peakBalance) * 100;
    
    const formattedDate = tradeDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    data.push({
      date: formattedDate,
      balance: parseFloat(currentBalance.toFixed(2)),
      spy: parseFloat(currentSpy.toFixed(2)),
      drawdown: parseFloat(maxDrawdown.toFixed(2))
    });
  }
  
  return data;
};

export const EQUITY_CURVE_DATA = generateEquitySeries();

// Monthly distribution (Wins vs Losses for the bar chart)
export const TRADE_DISTRIBUTION_DATA = [
  { month: 'Jan', wins: 14, losses: 9, winValue: 1250, lossValue: -680 },
  { month: 'Feb', wins: 18, losses: 11, winValue: 1800, lossValue: -950 },
  { month: 'Mar', wins: 22, losses: 15, winValue: 2400, lossValue: -1400 },
  { month: 'Apr', wins: 15, losses: 12, winValue: 1450, lossValue: -1100 },
  { month: 'May', wins: 28, losses: 18, winValue: 3100, lossValue: -1450 },
  { month: 'Jun', wins: 12, losses: 7, winValue: 1580, lossValue: -520 }
];

// Signals table mock (Indicator Lab right panel)
export const MOCK_SIGNAL_PREVIEWS: SignalPreview[] = [
  { id: 'sp-1', date: '10:02:15', pair: 'XAUUSD', signal: 'LONG', confidence: 84.5, price: 2024.50 },
  { id: 'sp-2', date: '09:58:30', pair: 'EURUSD', signal: 'SHORT', confidence: 71.0, price: 1.0845 },
  { id: 'sp-3', date: '09:44:12', pair: 'GBPUSD', signal: 'LONG', confidence: 91.2, price: 1.2710 },
  { id: 'sp-4', date: '09:30:00', pair: 'USDJPY', signal: 'SHORT', confidence: 64.0, price: 151.20 },
  { id: 'sp-5', date: '09:12:45', pair: 'USDCHF', signal: 'SHORT', confidence: 78.3, price: 0.8912 },
  { id: 'sp-6', date: '08:50:33', pair: 'AUDUSD', signal: 'LONG', confidence: 55.6, price: 0.6540 },
  { id: 'sp-7', date: '08:35:10', pair: 'EURUSD', signal: 'LONG', confidence: 88.0, price: 1.0838 },
  { id: 'sp-8', date: '08:14:22', pair: 'XAUUSD', signal: 'SHORT', confidence: 67.4, price: 2028.90 },
  { id: 'sp-9', date: '08:00:05', pair: 'GBPUSD', signal: 'SHORT', confidence: 73.5, price: 1.2735 },
  { id: 'sp-10', date: '07:44:18', pair: 'USDJPY', signal: 'LONG', confidence: 82.1, price: 150.95 }
];
