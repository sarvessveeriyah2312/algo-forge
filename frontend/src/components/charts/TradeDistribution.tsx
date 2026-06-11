import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface TradeDistributionProps {
  trades?: any[];
}

// Parse a date string that may be ISO or en-US locale format ("6/11/2026, 10:00:00 AM")
const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  // Try MM/DD/YYYY … format
  const m = dateStr.match(/^(\d+)\/(\d+)\/(\d{4})/);
  if (m) {
    d = new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]));
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const buildDistribution = (trades: any[]) => {
  // Ordered map: month-label → bucket
  const map = new Map<string, { month: string; wins: number; losses: number; winValue: number; lossValue: number }>();

  for (const t of trades) {
    const d = parseDate(t.date);
    const label = d
      ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      : 'Unknown';

    if (!map.has(label)) {
      map.set(label, { month: label, wins: 0, losses: 0, winValue: 0, lossValue: 0 });
    }

    const bucket = map.get(label)!;
    const pnl: number = t.pnl ?? 0;
    if (pnl > 0) {
      bucket.wins++;
      bucket.winValue = parseFloat((bucket.winValue + pnl).toFixed(2));
    } else {
      bucket.losses++;
      bucket.lossValue = parseFloat((bucket.lossValue + pnl).toFixed(2));
    }
  }

  return Array.from(map.values());
};

const CustomTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const total = d.wins + d.losses;
  const wr = total > 0 ? ((d.wins / total) * 100).toFixed(1) : '0.0';
  const netPnL = d.winValue + d.lossValue;
  const pf = d.lossValue !== 0 ? Math.abs(d.winValue / d.lossValue) : d.winValue;

  return (
    <div className="bg-[#0b0f19] border border-[#1f2937]/90 rounded-md shadow-2xl p-4 font-mono text-xs w-64 space-y-3 z-50 ring-1 ring-[#00d4aa]/20 backdrop-blur-md select-none text-gray-200">
      <div className="flex items-center justify-between border-b border-[#1f2937]/80 pb-2">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">monthly cohort</span>
        <span className="text-[10px] text-[#00d4aa] font-bold">{d.month} Performance</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Month Trades</span>
          <span className="text-white font-bold">{total}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-500">Monthly Win Rate</span>
          <span className="text-[#00d4aa] font-bold">{wr}%</span>
        </div>
      </div>
      <div className="space-y-1 border-t border-[#1f2937]/50 pt-2 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Gross Wins</span>
          <span className="text-[#00d4aa] font-bold">+${d.winValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Gross Losses</span>
          <span className="text-red-400 font-bold">-${Math.abs(d.lossValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1f2937]/50 text-[10px]">
        <div className="bg-[#111827] border border-[#1f2937]/80 rounded p-1.5 space-y-0.5">
          <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider">net p&l</span>
          <span className={`font-bold block font-mono ${netPnL >= 0 ? 'text-[#00d4aa]' : 'text-[#ef4444]'}`}>
            {netPnL >= 0 ? '+' : ''}${netPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-[#111827] border border-[#1f2937]/80 rounded p-1.5 space-y-0.5">
          <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider">profit factor</span>
          <span className="font-bold block font-mono text-emerald-500">{pf.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};

export const TradeDistribution: React.FC<TradeDistributionProps> = ({ trades = [] }) => {
  const data = buildDistribution(trades);

  return (
    <div className="w-full h-80 bg-[#111827] border border-[#1f2937] p-4 rounded-md relative font-mono">
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-xs uppercase text-[#6b7280]">Historical Trade Distribution</h4>
        <span className="text-sm text-gray-400">Wins vs Losses by Month</span>
      </div>

      {data.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 pt-8">
          <BarChart3 className="w-8 h-8 text-gray-700" />
          <p className="text-[11px] font-mono text-gray-600 tracking-widest">NO TRADE DATA</p>
        </div>
      ) : (
        <div className="w-full h-full pt-12">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', marginTop: '-30px', paddingRight: '10px' }}
                formatter={value => (
                  <span className="text-[#9ca3af] uppercase">{value === 'wins' ? 'Wins' : 'Losses'}</span>
                )}
              />
              <Bar dataKey="wins"   fill="#00d4aa" radius={[2, 2, 0, 0]} maxBarSize={30} />
              <Bar dataKey="losses" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
