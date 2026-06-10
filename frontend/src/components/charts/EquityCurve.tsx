import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { generateEquitySeries } from '../../data/mockData';

interface EquityCurveProps {
  strategyName?: string;
  data?: any[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  initialBalance: number;
  initialSpy: number;
  strategyName: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  initialBalance,
  initialSpy,
  strategyName
}) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const balance = dataPoint.balance;
    const spy = dataPoint.spy;
    const drawdown = dataPoint.drawdown;

    const stratReturnPct = ((balance - initialBalance) / initialBalance) * 100;
    const spyReturnPct = ((spy - initialSpy) / initialSpy) * 100;
    const alpha = stratReturnPct - spyReturnPct;

    const isStratPositive = stratReturnPct >= 0;
    const isSpyPositive = spyReturnPct >= 0;
    const isAlphaPositive = alpha >= 0;

    return (
      <div className="bg-[#0b0f19] border border-[#1f2937]/95 rounded-md shadow-2xl p-4 font-mono text-xs w-68 space-y-3 z-50 ring-1 ring-[#00d4aa]/25 backdrop-blur-md select-none text-gray-200">
        {/* Header: Date */}
        <div className="flex items-center justify-between border-b border-[#1f2937]/80 pb-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">handshake data</span>
          <span className="text-[10px] text-[#00d4aa] font-bold">Date: {dataPoint.date}</span>
        </div>

        {/* Primary Target Metrics requested by user */}
        <div className="space-y-2 bg-[#0d1527] border border-[#1f2937] p-2.5 rounded text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Balance:</span>
            <span className="text-[#00d4aa] font-bold font-mono">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 font-medium">Drawdown:</span>
            <span className={`font-bold font-mono ${drawdown > 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {drawdown > 0 ? '-' : ''}{drawdown.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Comparison Return Metrics */}
        <div className="space-y-1.5 border-t border-[#1f2937]/50 pt-2 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 truncate max-w-[130px]">{strategyName} Return</span>
            <span className={`font-bold font-mono flex items-center ${isStratPositive ? 'text-[#00d4aa]' : 'text-red-400'}`}>
              {isStratPositive ? '▲' : '▼'}{isStratPositive ? '+' : ''}{stratReturnPct.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Benchmark SPY</span>
            <span className="text-gray-300 font-bold font-mono">${spy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Benchmark Return</span>
            <span className={`font-bold flex items-center ${isSpyPositive ? 'text-emerald-500' : 'text-red-400'}`}>
              {isSpyPositive ? '▲' : '▼'}{isSpyPositive ? '+' : ''}{spyReturnPct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Alpha Block */}
        <div className="border-t border-[#1f2937]/50 pt-2 flex items-center justify-between text-[10px]">
          <span className="text-gray-500 uppercase font-bold text-[8px] tracking-wider">alpha gain vs spy</span>
          <span className={`font-bold font-mono ${isAlphaPositive ? 'text-[#00d4aa]' : 'text-red-400'}`}>
            {isAlphaPositive ? '+' : ''}{alpha.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const EquityCurve: React.FC<EquityCurveProps> = ({ 
  strategyName = 'Active Strategy',
  data = generateEquitySeries()
}) => {
  const initialBalance = data && data.length > 0 ? data[0].balance : 10000;
  const initialSpy = data && data.length > 0 ? data[0].spy : 10000;

  return (
    <div className="w-full h-80 bg-[#111827] border border-[#1f2937] p-4 rounded-md relative font-mono">
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-xs uppercase text-[#6b7280]">Cumulative Performance</h4>
        <div className="flex items-baseline space-x-2">
          <span className="text-lg font-bold text-[#00d4aa]">+{((data[data.length - 1]?.balance - data[0]?.balance) / data[0]?.balance * 100).toFixed(2)}%</span>
          <span className="text-xs text-[#6b7280]">vs Benchmark</span>
        </div>
      </div>

      <div className="w-full h-full pt-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4aa" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSpy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              minTickGap={25}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
              content={
                <CustomTooltip 
                  initialBalance={initialBalance} 
                  initialSpy={initialSpy} 
                  strategyName={strategyName} 
                />
              } 
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', marginTop: '-30px', paddingRight: '10px' }}
              formatter={(value) => {
                return <span className="text-[#9ca3af] uppercase">{value === 'balance' ? strategyName : 'SPY Index'}</span>;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#00d4aa" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorBalance)" 
            />
            <Area 
              type="monotone" 
              dataKey="spy" 
              stroke="#ef4444" 
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={0.8} 
              fill="url(#colorSpy)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
