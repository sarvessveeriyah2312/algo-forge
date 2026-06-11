import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, TrendingUp, Clock, ShieldAlert,
  Download, ChevronUp, ChevronDown, Loader2, AlertCircle,
} from 'lucide-react';
import { useBacktestStore } from '../store/useBacktestStore';
import { useStrategyStore } from '../store/useStrategyStore';
import { useToastStore } from '../store/useToastStore';
import { api, ApiError } from '../lib/api';
import { EquityCurve } from '../components/charts/EquityCurve';
import { TradeDistribution } from '../components/charts/TradeDistribution';

export const Results: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { strategies } = useStrategyStore();
  const { metrics, trades, fetchRunResult } = useBacktestStore();
  const { addToast } = useToastStore();

  const [isLoading, setIsLoading]   = useState(true);
  const [runInfo, setRunInfo]       = useState<any>(null);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [sortField, setSortField]   = useState<string>('index');
  const [sortAsc, setSortAsc]       = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(25);

  useEffect(() => {
    if (!runId) { navigate('/results'); return; }
    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      api.get<any>(`/backtest/${runId}`).then(d => setRunInfo(d)),
      fetchRunResult(runId, runId),
    ])
      .catch(err => setLoadError(err instanceof ApiError ? err.message : 'Failed to load run.'))
      .finally(() => setIsLoading(false));
  }, [runId]);

  const currentMetrics    = runId ? metrics[runId] : undefined;
  const currentTradesList = runId ? (trades[runId] ?? []) : [];

  const strategyName = runInfo
    ? (strategies.find(s => s.id === runInfo.strategy_id)?.name ?? (runInfo.strategy_id as string)?.slice(0, 8) + '…')
    : '—';

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
    setCurrentPage(1);
  };

  const sortedTrades = [...currentTradesList].sort((a: any, b: any) => {
    const valA = a[sortField], valB = b[sortField];
    if (typeof valA === 'string') return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    return sortAsc ? valA - valB : valB - valA;
  });

  const totalPages = Math.max(1, Math.ceil(sortedTrades.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedTrades = sortedTrades.slice(pageStart, pageStart + pageSize);

  const handleExportCSV = () => {
    addToast('Compiling trade logs…', 'info');
    setTimeout(() => {
      const headers = 'Trade,Date,Pair,Direction,Entry,Exit,Pips,PnL,Balance\n';
      const rows = currentTradesList
        .map((t: any) => `${t.index},"${t.date}",${t.pair},${t.direction},${t.entryPrice},${t.exitPrice},${t.pips},${t.pnl},${t.balance}`)
        .join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AlgoForge_Report_${runId}.csv`;
      a.click();
      addToast(`CSV exported — ${currentTradesList.length} trades.`, 'success');
    }, 500);
  };

  // ─── Loading / error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="terminal-card p-12 flex items-center justify-center gap-3">
        <Loader2 className="w-4 h-4 text-[#00d4aa] animate-spin" />
        <span className="text-xs font-mono text-[#00d4aa] tracking-widest">LOADING RUN…</span>
      </div>
    );
  }

  if (loadError || !currentMetrics) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/results')}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO RESULTS
        </button>
        <div className="terminal-card p-12 flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-xs font-mono text-red-400">{loadError ?? 'Run data unavailable.'}</p>
        </div>
      </div>
    );
  }

  // ─── Equity curve data ────────────────────────────────────────────────────

  const initialCapital = runInfo?.initial_capital ?? 10000;
  const equityPoints = currentTradesList.map((t: any, idx: number) => {
    const preceding = currentTradesList.slice(0, idx + 1).map((x: any) => x.balance);
    const peak = Math.max(initialCapital, ...preceding);
    const dd = peak === 0 ? 0 : ((peak - t.balance) / peak) * 100;
    const spyPct = idx * 0.45 + Math.sin(idx / 2.0) * 1.1 - 0.2;
    let label = t.date;
    try {
      const d = new Date(t.date);
      label = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getDate()}`;
    } catch {}
    return {
      date: label,
      balance: t.balance,
      spy: parseFloat((initialCapital * (1 + spyPct / 100)).toFixed(2)),
      drawdown: parseFloat(Math.max(0, dd).toFixed(2)),
    };
  });
  const chartData = [{ date: 'Start', balance: initialCapital, spy: initialCapital, drawdown: 0 }, ...equityPoints];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Back + run header */}
      <div>
        <button
          onClick={() => navigate('/results')}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO RESULTS
        </button>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-mono font-bold tracking-widest text-white uppercase">
              {strategyName}
            </h1>
            {runInfo && (
              <p className="text-xs font-mono text-gray-500 mt-0.5">
                {runInfo.instrument} · {runInfo.timeframe} · {runInfo.date_from} → {runInfo.date_to}
                &nbsp;·&nbsp;${(runInfo.initial_capital as number).toLocaleString()} initial capital
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Board Grid (2x4) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">NET PROFIT</span>
          <div className={`text-xl font-mono font-bold mt-1 ${currentMetrics.netProfitPercent >= 0 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
            {currentMetrics.netProfitPercent >= 0 ? '+' : ''}{currentMetrics.netProfitPercent}%
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">
            ${currentMetrics.netProfitValue.toLocaleString()} Account Value
          </p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">TOTAL TRADES</span>
          <div className="text-xl font-mono font-bold text-gray-200 mt-1">{currentMetrics.totalTrades}</div>
          <p className="text-[10px] text-gray-500 mt-0.5">Completed tick orders</p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">WIN RATE</span>
          <div className={`text-xl font-mono font-bold mt-1 ${currentMetrics.winRate >= 50 ? 'text-[#00d4aa]' : 'text-red-400'}`}>
            {currentMetrics.winRate.toFixed(1)}%
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Weighted positive outcomes</p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">PROFIT FACTOR</span>
          <div className={`text-xl font-mono font-bold mt-1 ${currentMetrics.profitFactor >= 1 ? 'text-gray-200' : 'text-red-400'}`}>
            {currentMetrics.profitFactor.toFixed(2)}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Gross Wins / Gross Losses</p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">MAX DRAWDOWN</span>
          <div className="text-xl font-mono font-bold text-red-400 mt-1">
            {runInfo?.max_drawdown_pct != null ? `${(runInfo.max_drawdown_pct as number).toFixed(2)}%` : `${currentMetrics.maxDrawdown}%`}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Peak-to-valley maximal drop</p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">AVG HOLD DURATION</span>
          <div className="text-xl font-mono font-bold text-gray-200 mt-1">
            {runInfo?.avg_trade_duration != null
              ? `${Math.floor(runInfo.avg_trade_duration)}h ${Math.round((runInfo.avg_trade_duration % 1) * 60)}m`
              : currentMetrics.avgTradeDuration}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Execution to close window</p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">SHARPE RATIO</span>
          <div className={`text-xl font-mono font-bold mt-1 ${currentMetrics.sharpeRatio >= 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
            {currentMetrics.sharpeRatio.toFixed(2)}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Risk-adjusted reward scale</p>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider block">EXPECTANCY</span>
          <div className="text-xl font-mono font-bold text-[#00d4aa] mt-1">
            {currentMetrics.expectancy.toFixed(2)}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Expected profit per trade</p>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider">Growth Performance Curve</span>
          <EquityCurve strategyName={strategyName} data={chartData} />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider">Wins vs Losses Distribution</span>
          <TradeDistribution trades={currentTradesList} />
        </div>
      </section>

      {/* Trade Log Table */}
      <section className="bg-[#111827] border border-[#1f2937] rounded-md overflow-hidden flex flex-col">
        <div className="px-4 py-3 bg-[#111827] border-b border-[#1f2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
              Simulation Trade Logs Ledger
            </h3>
            <p className="text-[11px] text-gray-500 leading-tight">
              {sortedTrades.length} trades executed — {strategyName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Rows</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-[#1f2937] border border-[#374151] rounded px-2 py-1 text-[11px] font-mono text-gray-300 focus:border-[#00d4aa] focus:outline-none cursor-pointer"
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 py-1.5 px-3 rounded bg-transparent border border-gray-700 hover:border-[#00d4aa] text-gray-300 hover:text-white transition-all text-xs font-mono cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Report</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse select-text">
            <thead>
              <tr className="bg-[#0a0e17] text-[10px] font-mono text-[#6b7280] border-b border-[#1f2937] select-none">
                {[
                  { label: '#',           field: 'index',     align: '' },
                  { label: 'Open Time',   field: 'date',      align: '' },
                  { label: 'Pair',        field: null,        align: '' },
                  { label: 'Order',       field: 'direction', align: '' },
                  { label: 'Entry Price', field: null,        align: 'text-right' },
                  { label: 'Exit Price',  field: null,        align: 'text-right' },
                  { label: 'Reason',      field: null,        align: '' },
                  { label: 'Pips',        field: 'pips',      align: 'text-right' },
                  { label: 'Net P&L ($)', field: 'pnl',       align: 'text-right' },
                  { label: 'Balance',     field: 'balance',   align: 'text-right' },
                ].map(({ label, field, align }) => (
                  <th
                    key={label}
                    className={`py-2.5 px-3 ${align} ${field ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                    onClick={field ? () => handleSort(field) : undefined}
                  >
                    <div className={`flex items-center ${align.includes('right') ? 'justify-end' : ''} space-x-1`}>
                      <span>{label}</span>
                      {field && sortField === field && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]/70 text-xs font-mono">
              {paginatedTrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-600 text-xs font-mono">
                    No trades recorded for this run.
                  </td>
                </tr>
              ) : paginatedTrades.map((trade: any) => {
                const isLoss = trade.pnl < 0;
                const decimals = ['DXY', 'USDX'].includes(trade.pair) ? 3 : ['XAUUSD', 'USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY', 'CADJPY'].includes(trade.pair) ? 2 : 5;
                const exitReasonColor: Record<string, string> = {
                  TP:     'bg-emerald-400/15 text-emerald-400',
                  SL:     'bg-red-400/15 text-red-400',
                  SIGNAL: 'bg-blue-400/15 text-blue-400',
                  EOD:    'bg-gray-500/15 text-gray-400',
                  TIME:   'bg-orange-400/15 text-orange-400',
                };
                return (
                  <tr key={trade.id} className="hover:bg-[#1f2937]/45 transition-colors">
                    <td className="py-2 px-3 text-gray-500">{trade.index}</td>
                    <td className="py-2 px-3 text-gray-400 whitespace-nowrap">{trade.date}</td>
                    <td className="py-2 px-3 text-white font-bold select-all">{trade.pair}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[9px] font-bold px-1.5 rounded ${
                        trade.direction === 'LONG' ? 'bg-[#00d4aa]/15 text-[#00d4aa]' : 'bg-[#ef4444]/15 text-[#ef4444]'
                      }`}>
                        {trade.direction}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-gray-300 tabular-nums">
                      {(trade.entryPrice as number).toFixed(decimals)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-300 tabular-nums">
                      {(trade.exitPrice as number).toFixed(decimals)}
                    </td>
                    <td className="py-2 px-3">
                      {trade.exitReason ? (
                        <span className={`text-[9px] font-bold px-1.5 rounded ${exitReasonColor[trade.exitReason] ?? 'bg-gray-500/15 text-gray-400'}`}>
                          {trade.exitReason}
                        </span>
                      ) : '—'}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold tabular-nums ${isLoss ? 'text-red-400' : 'text-[#00d4aa]'}`}>
                      {trade.pips > 0 ? `+${trade.pips}` : trade.pips}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold tabular-nums ${isLoss ? 'text-[#ef4444]' : 'text-[#00d4aa]'}`}>
                      {isLoss ? '-' : '+'}${Math.abs(trade.pnl).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-[#f9fafb] font-bold tabular-nums">
                      ${(trade.balance as number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {sortedTrades.length > 0 && (
          <div className="px-4 py-3 border-t border-[#1f2937] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-gray-500">
              Showing {pageStart + 1}–{Math.min(pageStart + pageSize, sortedTrades.length)} of {sortedTrades.length} trades
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-[11px] font-mono rounded border border-[#1f2937] text-gray-400 hover:text-white hover:border-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-[11px] font-mono rounded border border-[#1f2937] text-gray-400 hover:text-white hover:border-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1 text-[11px] font-mono text-gray-600">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                        currentPage === p
                          ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/40'
                          : 'border-[#1f2937] text-gray-400 hover:text-white hover:border-[#374151]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-[11px] font-mono rounded border border-[#1f2937] text-gray-400 hover:text-white hover:border-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-[11px] font-mono rounded border border-[#1f2937] text-gray-400 hover:text-white hover:border-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                »
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};
