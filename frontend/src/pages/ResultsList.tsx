import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Trash2, ExternalLink, RefreshCw, TrendingUp,
  TrendingDown, Clock, AlertCircle, CheckCircle2, Loader2, Circle,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useStrategyStore } from '../store/useStrategyStore';
import { useToastStore } from '../store/useToastStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BacktestRun {
  id: string;
  strategy_id: string;
  instrument: string;
  timeframe: string;
  date_from: string;
  date_to: string;
  initial_capital: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  net_profit: number | null;
  total_trades: number | null;
  winning_trades: number | null;
  losing_trades: number | null;
  win_rate: number | null;
  profit_factor: number | null;
  max_drawdown: number | null;
  max_drawdown_pct: number | null;
  sharpe_ratio: number | null;
  expectancy: number | null;
  avg_trade_duration: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: BacktestRun['status'] }> = ({ status }) => {
  const map = {
    PENDING:   { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',   icon: <Circle    className="w-2.5 h-2.5" />, label: 'PENDING'   },
    RUNNING:   { color: 'text-blue-400  bg-blue-400/10  border-blue-400/20',    icon: <Loader2   className="w-2.5 h-2.5 animate-spin" />, label: 'RUNNING'   },
    COMPLETED: { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle2 className="w-2.5 h-2.5" />, label: 'COMPLETED' },
    FAILED:    { color: 'text-red-400   bg-red-400/10   border-red-400/20',     icon: <AlertCircle className="w-2.5 h-2.5" />, label: 'FAILED'    },
  };
  const { color, icon, label } = map[status] ?? map.FAILED;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${color}`}>
      {icon}{label}
    </span>
  );
};

// ─── Stat cell ────────────────────────────────────────────────────────────────

const Stat: React.FC<{ label: string; value: string | null; color?: string }> = ({ label, value, color }) => (
  <div className="text-center min-w-[60px]">
    <div className="text-[9px] font-mono text-gray-600 tracking-widest">{label}</div>
    <div className={`text-xs font-mono font-bold mt-0.5 ${color ?? 'text-gray-300'}`}>
      {value ?? '—'}
    </div>
  </div>
);

// ─── Row ──────────────────────────────────────────────────────────────────────

interface RowProps {
  run: BacktestRun;
  strategyName: string;
  onDelete: () => void;
  onDetails: () => void;
  isDeleting: boolean;
}

const RunRow: React.FC<RowProps> = ({ run, strategyName, onDelete, onDetails, isDeleting }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const netProfitPct = run.net_profit != null && run.initial_capital > 0
    ? ((run.net_profit / run.initial_capital) * 100).toFixed(2)
    : null;
  const profitColor = netProfitPct == null ? 'text-gray-500'
    : parseFloat(netProfitPct) >= 0 ? 'text-emerald-400' : 'text-red-400';

  const dur = run.avg_trade_duration != null
    ? `${Math.floor(run.avg_trade_duration)}h ${Math.round((run.avg_trade_duration % 1) * 60)}m`
    : null;

  return (
    <div className="terminal-card p-4 hover:border-[#2d3748] transition-colors">
      <div className="flex items-center gap-4">
        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono font-bold text-white truncate">{strategyName}</span>
            <StatusBadge status={run.status} />
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-[10px] font-mono text-[#00d4aa]">{run.instrument}</span>
            <span className="text-[10px] font-mono text-gray-500">{run.timeframe}</span>
            <span className="text-[10px] font-mono text-gray-600">
              {run.date_from} → {run.date_to}
            </span>
            <span className="text-[10px] font-mono text-gray-600">
              ${run.initial_capital.toLocaleString()}
            </span>
          </div>
          {run.status === 'FAILED' && run.error_message && (
            <p className="text-[10px] font-mono text-red-400 mt-1 truncate">{run.error_message}</p>
          )}
        </div>

        {/* Stats — only show when completed */}
        {run.status === 'COMPLETED' && (
          <div className="hidden md:flex items-center gap-4">
            <Stat
              label="NET P&L"
              value={netProfitPct != null ? `${parseFloat(netProfitPct) >= 0 ? '+' : ''}${netProfitPct}%` : null}
              color={profitColor}
            />
            <Stat
              label="TRADES"
              value={run.total_trades != null ? `${run.total_trades}` : null}
            />
            <Stat
              label="WIN RATE"
              value={run.win_rate != null ? `${run.win_rate.toFixed(1)}%` : null}
              color={run.win_rate != null && run.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400'}
            />
            <Stat
              label="P.FACTOR"
              value={run.profit_factor != null ? run.profit_factor.toFixed(2) : null}
              color={run.profit_factor != null && run.profit_factor >= 1 ? 'text-emerald-400' : 'text-red-400'}
            />
            <Stat
              label="MAX DD"
              value={run.max_drawdown_pct != null ? `${run.max_drawdown_pct.toFixed(2)}%` : null}
              color="text-orange-400"
            />
            <Stat
              label="SHARPE"
              value={run.sharpe_ratio != null ? run.sharpe_ratio.toFixed(2) : null}
              color={run.sharpe_ratio != null && run.sharpe_ratio >= 1 ? 'text-emerald-400' : 'text-gray-400'}
            />
            <Stat label="AVG DUR" value={dur} />
          </div>
        )}

        {/* Timestamp */}
        <div className="hidden xl:block text-right shrink-0">
          <div className="text-[9px] font-mono text-gray-700 tracking-widest">CREATED</div>
          <div className="text-[10px] font-mono text-gray-500">
            {new Date(run.created_at).toLocaleDateString()}
          </div>
          {run.completed_at && (
            <>
              <div className="text-[9px] font-mono text-gray-700 tracking-widest mt-1">COMPLETED</div>
              <div className="text-[10px] font-mono text-gray-500">
                {new Date(run.completed_at).toLocaleDateString()}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {run.status === 'COMPLETED' && (
            <button
              onClick={onDetails}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold text-black bg-[#00d4aa] hover:bg-[#00bfa0] rounded transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              DETAILS
            </button>
          )}
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-red-900/20 border border-red-900/40 rounded px-2 py-1">
              <span className="text-[10px] font-mono text-red-400">Delete?</span>
              <button
                onClick={() => { onDelete(); setConfirmDelete(false); }}
                disabled={isDeleting}
                className="text-[10px] font-mono text-red-400 hover:text-red-300 px-1 cursor-pointer"
              >YES</button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] font-mono text-gray-500 hover:text-gray-300 px-1 cursor-pointer"
              >NO</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={isDeleting}
              title="Delete run"
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-[#1f2937] rounded transition-all disabled:opacity-40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const ResultsList: React.FC = () => {
  const navigate = useNavigate();
  const { strategies } = useStrategyStore();
  const { addToast } = useToastStore();

  const [runs, setRuns]           = useState<BacktestRun[]>([]);
  const [total, setTotal]         = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const strategyName = (id: string) =>
    strategies.find(s => s.id === id)?.name ?? id.slice(0, 8) + '…';

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<{ items: BacktestRun[]; total: number }>(
        '/backtest/?page_size=100'
      );
      setRuns(data.items);
      setTotal(data.total);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to load runs.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.del(`/backtest/${id}`);
      setRuns(prev => prev.filter(r => r.id !== id));
      setTotal(prev => prev - 1);
      addToast('Backtest run deleted.', 'info');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Delete failed.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = statusFilter === 'All'
    ? runs
    : runs.filter(r => r.status === statusFilter);

  const completedRuns = runs.filter(r => r.status === 'COMPLETED');
  const avgWinRate = completedRuns.length
    ? (completedRuns.reduce((s, r) => s + (r.win_rate ?? 0), 0) / completedRuns.length).toFixed(1)
    : '—';
  const totalTrades = completedRuns.reduce((s, r) => s + (r.total_trades ?? 0), 0);

  const STATUS_OPTIONS = ['All', 'COMPLETED', 'RUNNING', 'PENDING', 'FAILED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold tracking-widest text-white uppercase">
            Backtest Results
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">
            {filtered.length} of {total} runs
          </p>
        </div>
        <button
          onClick={load}
          className="btn-outline flex items-center gap-2 text-xs px-4 py-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          REFRESH
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL RUNS',    value: total,                      color: '#00d4aa', Icon: BarChart3   },
          { label: 'COMPLETED',     value: completedRuns.length,       color: '#34d399', Icon: CheckCircle2 },
          { label: 'AVG WIN RATE',  value: avgWinRate === '—' ? '—' : `${avgWinRate}%`, color: '#60a5fa', Icon: TrendingUp  },
          { label: 'TOTAL TRADES',  value: totalTrades,                color: '#f59e0b', Icon: Clock       },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="terminal-card p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-gray-500 tracking-widest">{label}</span>
              <div className="stat-value mt-0.5">{value}</div>
            </div>
            <div className="p-2.5 rounded border" style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="terminal-card p-3 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-mono text-gray-500 tracking-widest mr-1">STATUS</span>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-[10px] font-mono px-3 py-1.5 rounded border transition-all cursor-pointer ${
              statusFilter === s
                ? 'bg-[#00d4aa] text-black border-[#00d4aa] font-bold'
                : 'text-gray-400 border-[#1f2937] hover:text-white hover:border-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="terminal-card p-12 flex items-center justify-center">
          <div className="text-xs font-mono text-[#00d4aa] animate-pulse tracking-widest">
            LOADING RUNS...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="terminal-card p-12 flex flex-col items-center justify-center gap-3">
          <BarChart3 className="w-8 h-8 text-gray-700" />
          <p className="text-xs font-mono text-gray-500 tracking-widest">NO BACKTEST RUNS FOUND</p>
          <button
            onClick={() => navigate('/backtest')}
            className="btn-teal text-xs px-4 py-2 flex items-center gap-2 mt-2 cursor-pointer"
          >
            RUN YOUR FIRST BACKTEST
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(run => (
            <RunRow
              key={run.id}
              run={run}
              strategyName={strategyName(run.strategy_id)}
              isDeleting={deletingId === run.id}
              onDelete={() => handleDelete(run.id)}
              onDetails={() => navigate(`/results/${run.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
