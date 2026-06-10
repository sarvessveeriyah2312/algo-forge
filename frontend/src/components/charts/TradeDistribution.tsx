import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TRADE_DISTRIBUTION_DATA } from '../../data/mockData';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const wins = dataPoint.wins;
    const losses = dataPoint.losses;
    const winValue = dataPoint.winValue;
    const lossValue = dataPoint.lossValue;

    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const netPnL = winValue + lossValue;
    const profitFactor = lossValue !== 0 ? Math.abs(winValue / lossValue) : winValue;

    const isPnLPositive = netPnL >= 0;

    return (
      <div className="bg-[#0b0f19] border border-[#1f2937]/90 rounded-md shadow-2xl p-4 font-mono text-xs w-64 space-y-3 z-50 ring-1 ring-[#00d4aa]/20 backdrop-blur-md select-none text-gray-200">
        {/* Header: Month Indicator */}
        <div className="flex items-center justify-between border-b border-[#1f2937]/80 pb-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">monthly cohort</span>
          <span className="text-[10px] text-[#00d4aa] font-bold">{dataPoint.month} Performance</span>
        </div>

        {/* Quant Stats */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Month Trades</span>
            <span className="text-white font-bold font-mono">{totalTrades}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">Monthly Win Rate</span>
            <span className="text-[#00d4aa] font-bold">
              {winRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Value Metrics */}
        <div className="space-y-1 border-t border-[#1f2937]/50 pt-2 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Gross Wins</span>
            <span className="text-[#00d4aa] font-mono font-bold">+${winValue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Gross Losses</span>
            <span className="text-red-400 font-mono font-bold">-${Math.abs(lossValue).toLocaleString()}</span>
          </div>
        </div>

        {/* Summary Block */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1f2937]/50 text-[10px]">
          <div className="bg-[#111827] border border-[#1f2937]/80 rounded p-1.5 space-y-0.5">
            <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider">net p&l</span>
            <span className={`font-bold block font-mono ${isPnLPositive ? 'text-[#00d4aa]' : 'text-[#ef4444]'}`}>
              {isPnLPositive ? '+' : ''}${netPnL.toLocaleString()}
            </span>
          </div>
          <div className="bg-[#111827] border border-[#1f2937]/80 rounded p-1.5 space-y-0.5">
            <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider">profit factor</span>
            <span className="font-bold block font-mono text-emerald-500">
              {profitFactor.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const TradeDistribution: React.FC = () => {
  return (
    <div className="w-full h-80 bg-[#111827] border border-[#1f2937] p-4 rounded-md relative font-mono">
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-xs uppercase text-[#6b7280]">Historical Trade Distribution</h4>
        <span className="text-sm text-gray-400">Wins vs Losses by Month</span>
      </div>

      <div className="w-full h-full pt-12">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={TRADE_DISTRIBUTION_DATA}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', marginTop: '-30px', paddingRight: '10px' }}
              formatter={(value) => {
                return <span className="text-[#9ca3af] uppercase">{value === 'wins' ? 'Wins' : 'Losses'}</span>;
              }}
            />
            <Bar dataKey="wins" fill="#00d4aa" radius={[2, 2, 0, 0]} maxBarSize={30} />
            <Bar dataKey="losses" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
