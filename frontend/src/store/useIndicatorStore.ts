import { create } from 'zustand';
import { IndicatorMetadata } from '../types/indicator';
import { api } from '../lib/api';

// Static fallback — used immediately and replaced by API data on first fetch
const STATIC_INDICATORS: IndicatorMetadata[] = [
  // Trend
  { id: 'ema', name: 'Exponential Moving Average (EMA)', category: 'Trend', description: 'Calculates the exponential moving average of price over a specific window of trading periods, giving more weight to recent prices.', parameters: [{ key: 'period', name: 'Period', type: 'number', default: 20 }, { key: 'source', name: 'Source', type: 'select', default: 'close', options: ['close', 'open', 'high', 'low', 'hl2', 'hlc3', 'ohlc4'] }] },
  { id: 'sma', name: 'Simple Moving Average (SMA)', category: 'Trend', description: 'An arithmetic moving average calculated by adding recent closing prices and then dividing by the number of time periods.', parameters: [{ key: 'period', name: 'Period', type: 'number', default: 50 }, { key: 'source', name: 'Source', type: 'select', default: 'close', options: ['close', 'open', 'high', 'low'] }] },
  { id: 'vwap', name: 'Volume Weighted Average Price (VWAP)', category: 'Trend', description: 'Provides the average price a security has traded at throughout the day, based on both volume and price.', parameters: [{ key: 'anchor', name: 'Anchor Period', type: 'select', default: 'Session', options: ['Session', 'Week', 'Month', 'Year'] }] },
  { id: 'supertrend', name: 'Supertrend', category: 'Trend', description: 'A trend-following indicator based on Average True Range (ATR) that overlays buy and sell labels on the price action.', parameters: [{ key: 'atrPeriod', name: 'ATR Period', type: 'number', default: 10 }, { key: 'multiplier', name: 'Multiplier', type: 'number', default: 3 }] },
  { id: 'vwap_upper_touch', name: 'VWAP Upper Band Touch', category: 'Trend', description: 'Returns a signal (1.0) when the close price exceeds the upper VWAP standard deviation band, indicating a potential mean-reversion SHORT opportunity.', parameters: [{ key: 'multiplier', name: 'Band Multiplier', type: 'number', default: 1.5 }] },
  { id: 'vwap_lower_touch', name: 'VWAP Lower Band Touch', category: 'Trend', description: 'Returns a signal (1.0) when the close price falls below the lower VWAP standard deviation band, indicating a potential mean-reversion LONG opportunity.', parameters: [{ key: 'multiplier', name: 'Band Multiplier', type: 'number', default: 1.5 }] },
  { id: 'ichimoku', name: 'Ichimoku Cloud', category: 'Trend', description: 'A comprehensive indicator that defines support/resistance, identifies trend direction, gauges momentum and provides trading signals.', parameters: [{ key: 'conversionLine', name: 'Conversion Line (Tenkan)', type: 'number', default: 9 }, { key: 'baseLine', name: 'Base Line (Kijun)', type: 'number', default: 26 }, { key: 'leadingSpanB', name: 'Leading Span B (Senkou B)', type: 'number', default: 52 }, { key: 'displacement', name: 'Displacement', type: 'number', default: 26 }] },
  // Momentum
  { id: 'rsi', name: 'Relative Strength Index (RSI)', category: 'Momentum', description: 'Measures the speed and change of price movements, ranging between 0 and 100 to identify overbought (>70) and oversold (<30) zones.', parameters: [{ key: 'period', name: 'Period', type: 'number', default: 14 }, { key: 'overbought', name: 'Overbought Level', type: 'number', default: 70 }, { key: 'oversold', name: 'Oversold Level', type: 'number', default: 30 }] },
  { id: 'macd', name: 'MACD (Moving Average Convergence Divergence)', category: 'Momentum', description: "A trend-following momentum indicator that shows the relationship between two moving averages of a security's price.", parameters: [{ key: 'fastLength', name: 'Fast Length', type: 'number', default: 12 }, { key: 'slowLength', name: 'Slow Length', type: 'number', default: 26 }, { key: 'signalLength', name: 'Signal Smoothing', type: 'number', default: 9 }] },
  { id: 'stochastic', name: 'Stochastic Oscillator', category: 'Momentum', description: 'Compares a specific closing price of a security to a range of its prices over a certain period of time.', parameters: [{ key: 'kPeriod', name: '%K Period', type: 'number', default: 14 }, { key: 'dPeriod', name: '%D Period', type: 'number', default: 3 }, { key: 'slowing', name: 'Slowing', type: 'number', default: 3 }] },
  { id: 'cci', name: 'Commodity Channel Index (CCI)', category: 'Momentum', description: "An oscillator that measures a security's variation from its statistical average to assess trend strength and speed.", parameters: [{ key: 'period', name: 'Period', type: 'number', default: 20 }] },
  { id: 'williams_r', name: 'Williams %R', category: 'Momentum', description: 'A momentum indicator that measures overbought and oversold levels, similar to the Stochastic, moving on a scale of -100 to 0.', parameters: [{ key: 'period', name: 'Period', type: 'number', default: 14 }] },
  { id: 'adx', name: 'Average Directional Index (ADX)', category: 'Momentum', description: 'Measures trend strength on a 0–100 scale. Values below 25 indicate a ranging/sideways market; values above 25 indicate a trending market.', parameters: [{ key: 'period', name: 'Period', type: 'number', default: 14 }, { key: 'threshold', name: 'Trend Threshold', type: 'number', default: 25 }] },
  // Volatility
  { id: 'atr', name: 'Average True Range (ATR)', category: 'Volatility', description: 'Measures market volatility by decomposing the entire range of an asset price for that period.', parameters: [{ key: 'period', name: 'Period', type: 'number', default: 14 }] },
  { id: 'bollinger', name: 'Bollinger Bands', category: 'Volatility', description: 'An upper envelope, lower envelope, and central moving average line based on standard deviation of prices to denote expansion/squeeze.', parameters: [{ key: 'period', name: 'Period', type: 'number', default: 20 }, { key: 'stdDev', name: 'StdDev Multiplier', type: 'number', default: 2 }] },
  { id: 'keltner', name: 'Keltner Channels', category: 'Volatility', description: 'Volatility-based envelopes that are set above and below an exponential moving average, bounded by ATR lines.', parameters: [{ key: 'emaPeriod', name: 'EMA Period', type: 'number', default: 20 }, { key: 'atrPeriod', name: 'ATR Period', type: 'number', default: 10 }, { key: 'multiplier', name: 'Multiplier', type: 'number', default: 1.5 }] },
  // Volume
  { id: 'obv', name: 'On-Balance Volume (OBV)', category: 'Volume', description: 'Uses volume flow to predict changes in stock price, acting as a momentum indicator that correlates volume with breakouts.', parameters: [] },
  { id: 'cmf', name: 'Chaikin Money Flow (CMF)', category: 'Volume', description: 'Measures the amount of Money Flow Volume over a specific period, indicating accumulation and distribution behavior.', parameters: [{ key: 'period', name: 'Period', type: 'number', default: 20 }] },
  // ICT Concepts
  { id: 'fvg', name: 'Fair Value Gap (FVG)', category: 'ICT Concepts', description: 'Identifies 3-candle price gaps where heavy structural interest left incomplete buy or sell side deliveries.', parameters: [{ key: 'minSizePips', name: 'Min Size (Pips)', type: 'number', default: 5 }, { key: 'colorUnfilled', name: 'Highlight Gaps', type: 'boolean', default: true }] },
  { id: 'orderblock', name: 'Order Block (OB)', category: 'ICT Concepts', description: 'Pinpoints institutional trace areas where large limit buying/selling transactions occurred, establishing key support/resistance zones.', parameters: [{ key: 'lookback', name: 'Lookback Candles', type: 'number', default: 200 }, { key: 'showMitigated', name: 'Show Mitigated OBs', type: 'boolean', default: false }] },
  { id: 'liquidity', name: 'Liquidity Sweeps', category: 'ICT Concepts', description: 'Tracks sweeps of high/low pools where stop losses are clustered, often indicating instant sharp market reversals.', parameters: [{ key: 'levelTimeframe', name: 'Swing Level', type: 'select', default: 'Daily', options: ['Hourly', 'Daily', 'Weekly'] }] },
  { id: 'bos', name: 'Break of Structure (BOS)', category: 'ICT Concepts', description: 'Identifies price breaks that align with the ongoing major structural trend line direction.', parameters: [{ key: 'bosMethod', name: 'BOS Confirmation', type: 'select', default: 'Candle Close', options: ['Candle Close', 'Wick Penetration'] }] },
  { id: 'mss', name: 'Market Structure Shift (MSS)', category: 'ICT Concepts', description: 'Identifies the first break of structural highs or lows that hints at a fundamental trend reversal direction.', parameters: [{ key: 'lookbackBars', name: 'Swing Period', type: 'number', default: 50 }] },
];

interface IndicatorState {
  indicators: IndicatorMetadata[];
  isFetched: boolean;
  fetchIndicators: () => Promise<void>;
}

export const useIndicatorStore = create<IndicatorState>((set, get) => ({
  indicators: STATIC_INDICATORS,
  isFetched: false,

  fetchIndicators: async () => {
    if (get().isFetched) return;
    try {
      const data = await api.get<IndicatorMetadata[]>('/indicators/all');
      if (Array.isArray(data) && data.length > 0) {
        set({ indicators: data, isFetched: true });
      } else {
        set({ isFetched: true });
      }
    } catch {
      set({ isFetched: true }); // keep static fallback
    }
  },
}));
