import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Clock, 
  ShieldAlert, 
  Gauge, 
  Download,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';
import { useStrategyStore } from '../store/useStrategyStore';
import { useBacktestStore } from '../store/useBacktestStore';
import { useToastStore } from '../store/useToastStore';
import { EquityCurve } from '../components/charts/EquityCurve';
import { TradeDistribution } from '../components/charts/TradeDistribution';

export const Results: React.FC = () => {
  const { strategies } = useStrategyStore();
  const { metrics, trades, activeResultId, setActiveResultId } = useBacktestStore();
  const { addToast } = useToastStore();

  // Selected Results Strategy ID
  const activeStratId = activeResultId || 'strat-1';
  const activeStrat = strategies.find((s) => s.id === activeStratId) || strategies[0];

  // Retrieve matching metrics and trades lists
  const currentMetrics = metrics[activeStratId] || metrics['strat-1'];
  const currentTradesList = trades[activeStratId] || trades['strat-1'];

  // Sorting state for the Trade Log Table
  const [sortField, setSortField] = useState<string>('index');
  const [sortAscending, setSortAscending] = useState<boolean>(true);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAscending(!sortAscending);
    } else {
      setSortField(field);
      setSortAscending(true);
    }
  };

  // Sort trades list
  const sortedTrades = [...currentTradesList].sort((a: any, b: any) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') {
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAscending ? valA - valB : valB - valA;
  });

  const handleExportCSV = () => {
    addToast(`Compiling performance tick logs for "${activeStrat?.name}"...`, 'info');
    setTimeout(() => {
      // Simulate download
      const headers = 'Trade,Date,Pair,Direction,Entry,Exit,Pips,PnL,Balance\n';
      const rows = currentTradesList.map(t => `${t.index},"${t.date}",${t.pair},${t.direction},${t.entryPrice},${t.exitPrice},${t.pips},${t.pnl},${t.balance}`).join('\n');
      
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `AlgoForge_Report_${activeStrat?.name.replace(/\s+/g, '_')}.csv`);
      a.click();
      
      addToast(`CSV Performance Report exported successfully. Compiled ${currentTradesList.length} trades!`, 'success');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Tab select bar */}
      <section className="bg-[#111827] border border-[#1f2937] p-2 rounded-md flex flex-wrap gap-1">
        {strategies.map((strat) => {
          const isSelected = activeStratId === strat.id;
          const stratMets = metrics[strat.id];
          return (
            <button
              key={strat.id}
              onClick={() => setActiveResultId(strat.id)}
              className={`px-4 py-2.5 rounded text-xs font-mono font-bold tracking-wide transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#00d4aa] text-black shadow-lg shadow-[#00d4aa]/15'
                  : 'text-gray-400 hover:text-white hover:bg-[#1f2937]'
              }`}
            >
              {strat.name.toUpperCase()} ({strat.instrument})
              {stratMets && (
                <span className={`ml-2 text-[9px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-black/15 text-black' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  +{stratMets.netProfitPercent}%
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* Stats Board Grid (2x4) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">NET PROFIT</span>
          <div className="text-xl font-mono font-bold text-[#00d4aa] mt-1">
            +{currentMetrics?.netProfitPercent || '0.0'}%
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">
            ${currentMetrics?.netProfitValue.toLocaleString() || '0.00'} Account Value
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">TOTAL TRADES</span>
          <div className="text-xl font-mono font-bold text-gray-200 mt-1">
            {currentMetrics?.totalTrades || '0'}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Completed tick orders</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">AVG WIN RATE</span>
          <div className="text-xl font-mono font-bold text-[#00d4aa] mt-1">
            {currentMetrics?.winRate || '0.0'}%
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Weighted positive outcomes</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">PROFIT FACTOR</span>
          <div className="text-xl font-mono font-bold text-gray-200 mt-1">
            {currentMetrics?.profitFactor || '0.0'}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Gross Wins / Gross Losses</p>
        </div>

        {/* Metric 5 */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">MAX DRAWDOWN</span>
          <div className="text-xl font-mono font-bold text-red-400 mt-1">
            {currentMetrics?.maxDrawdown || '0.0'}%
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Peak-to-valley maximal drop</p>
        </div>

        {/* Metric 6 */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">AVG HOLD DURATION</span>
          <div className="text-xl font-mono font-bold text-gray-200 mt-1">
            {currentMetrics?.avgTradeDuration || '0m'}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Execution to close window</p>
        </div>

        {/* Metric 7 */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">SHARPE RATIO</span>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
            {currentMetrics?.sharpeRatio || '0.0'}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Risk-adjusted reward scale</p>
        </div>

        {/* Metric 8 */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">EXPECTANCY (PIPS)</span>
          <div className="text-xl font-mono font-bold text-[#00d4aa] mt-1">
            {currentMetrics?.expectancy || '0.0'} pips
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Expected profit per trade execution</p>
        </div>
      </section>

      {/* Charts section: Grid Equity vs Bar distribution */}
      {(() => {
        // Generate highly cohesive, dynamic equity and drawdown trajectory matching currentTradesList
        const equityData = currentTradesList.map((t, idx) => {
          // Track highest balance seen up to this trade to compute the correct running drawdown
          const antecedentBalances = currentTradesList.slice(0, idx + 1).map(x => x.balance);
          const localPeak = Math.max(10000, ...antecedentBalances);
          const drawdown = localPeak === 0 ? 0 : ((localPeak - t.balance) / localPeak) * 100;

          // SPY index benchmark trend
          const spyPctIncrease = idx * 0.45 + (Math.sin(idx / 2.0) * 1.1) - 0.2;
          const spyVal = 10000 * (1 + spyPctIncrease / 100);

          // Extract cleaner visual date
          let cleanDate = t.date;
          try {
            const parts = t.date.split(' ');
            const dateParts = parts[0].split('-');
            if (dateParts.length === 3) {
              const monthIndex = parseInt(dateParts[1], 10) - 1;
              const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex];
              const dayName = parseInt(dateParts[2], 10);
              cleanDate = `${monthName} ${dayName}`;
            }
          } catch (e) {
            // fallback
          }

          return {
            date: cleanDate,
            balance: t.balance,
            spy: parseFloat(spyVal.toFixed(2)),
            drawdown: parseFloat(Math.max(0, drawdown).toFixed(2))
          };
        });

        // Prepend starting baseline point so the curve has an origin point at $10k
        const chartData = [
          { date: 'Start', balance: 10000, spy: 10000, drawdown: 0 },
          ...equityData
        ];

        return (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider">Growth Performance Curve</span>
              <EquityCurve strategyName={activeStrat?.name} data={chartData} />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider">Wins vs Losses Distribution</span>
              <TradeDistribution />
            </div>
          </section>
        );
      })()}

      {/* Trade Log Table */}
      <section className="bg-[#111827] border border-[#1f2937] rounded-md overflow-hidden flex flex-col">
        {/* Table header menu */}
        <div className="px-4 py-3 bg-[#111827] border-b border-[#1f2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
              Simulation Trade Logs ledger
            </h3>
            <p className="text-[11px] text-gray-500 leading-tight">
              Detailed list of the last 20 trade entries executed during the backtest of {activeStrat?.name}.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 py-1.5 px-3 rounded bg-transparent border border-gray-700 hover:border-[#00d4aa] text-gray-300 hover:text-white transition-all text-xs font-mono cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="bg-[#0a0e17] text-[10px] font-mono text-[#6b7280] border-b border-[#1f2937] select-none">
                <th className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('index')}>
                  <div className="flex items-center space-x-1">
                    <span>#</span>
                    {sortField === 'index' && (sortAscending ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('date')}>
                  <div className="flex items-center space-x-1">
                    <span>Date Clock</span>
                    {sortField === 'date' && (sortAscending ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-2.5 px-2">Pair</th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('direction')}>
                  <div className="flex items-center space-x-1">
                    <span>Order</span>
                    {sortField === 'direction' && (sortAscending ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Entry</th>
                <th className="py-2.5 px-3 text-right">Exit</th>
                <th className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('pips')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Pips</span>
                    {sortField === 'pips' && (sortAscending ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('pnl')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Net P&L ($)</span>
                    {sortField === 'pnl' && (sortAscending ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('balance')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total Balance</span>
                    {sortField === 'balance' && (sortAscending ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/70 text-xs font-mono">
              {sortedTrades.map((trade) => {
                const isLoss = trade.pnl < 0;
                return (
                  <tr key={trade.id} className="hover:bg-[#1f2937]/45 transition-colors">
                    <td className="py-2 px-4 text-gray-500">
                      {trade.index}
                    </td>
                    <td className="py-2 px-3 text-gray-400">
                      {trade.date}
                    </td>
                    <td className="py-2 px-2 text-white font-bold select-all">
                      {trade.pair}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        trade.direction === 'LONG'
                          ? 'bg-[#00d4aa]/15 text-[#00d4aa]'
                          : 'bg-[#ef4444]/15 text-[#ef4444]'
                      }`}>
                        {trade.direction}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-gray-300">
                      {trade.entryPrice.toFixed(trade.pair === 'XAUUSD' ? 2 : 4)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-300">
                      {trade.exitPrice.toFixed(trade.pair === 'XAUUSD' ? 2 : 4)}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${isLoss ? 'text-red-400' : 'text-[#00d4aa]'}`}>
                      {trade.pips > 0 ? `+${trade.pips}` : trade.pips}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${isLoss ? 'text-[#ef4444]' : 'text-[#00d4aa]'}`}>
                      {isLoss ? '-' : '+'}${Math.abs(trade.pnl).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 text-right text-[#f9fafb] font-bold">
                      ${trade.balance.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
