export type IndicatorCategory = 'Trend' | 'Momentum' | 'Volatility' | 'Volume' | 'ICT Concepts';

export interface ParameterDef {
  key: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  default: number | string | boolean;
  options?: string[];
}

export interface IndicatorMetadata {
  id: string;
  name: string;
  category: IndicatorCategory;
  description: string;
  parameters: ParameterDef[];
}

export interface SignalPreview {
  id: string;
  date: string;
  pair: string;
  signal: 'LONG' | 'SHORT';
  confidence: number; // 0-100%
  price: number;
}
