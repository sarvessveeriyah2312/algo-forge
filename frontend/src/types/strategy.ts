export type Instrument = 'XAUUSD' | 'EURUSD' | 'GBPUSD' | 'USDJPY' | 'USDCHF' | 'AUDUSD';
export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1';
export type TradeDirection = 'Long Only' | 'Short Only' | 'Both';

export interface StrategyBlock {
  id: string;
  type: 'entry' | 'exit' | 'filter' | 'risk';
  indicatorId: string;
  name: string;
  parameters: Record<string, number | string | boolean>;
}

export interface Strategy {
  id: string;
  name: string;
  instrument: Instrument;
  timeframe: Timeframe;
  sessions: {
    london: boolean;
    newYork: boolean;
    asia: boolean;
    overlap: boolean;
  };
  direction: TradeDirection;
  riskPerTrade: number; // percentage
  maxDailyDrawdown: number; // percentage
  blocks: StrategyBlock[];
  winRate?: number; // average win rate of strategy in backtests
  netProfit?: number; // last net profit percentage
  drawdown?: number; // drawdown percentage
  isFavorite?: boolean;
}

export interface StrategyVersion {
  id: string;
  strategyId: string;
  versionName: string;
  description: string;
  timestamp: string; // ISO String
  config: {
    name: string;
    instrument: Instrument;
    timeframe: Timeframe;
    sessions: {
      london: boolean;
      newYork: boolean;
      asia: boolean;
      overlap: boolean;
    };
    direction: TradeDirection;
    riskPerTrade: number;
    maxDailyDrawdown: number;
    blocks: StrategyBlock[];
  };
}

