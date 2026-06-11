import React, { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Star, Trash2, Copy, Code2,
  Edit3, TrendingUp, TrendingDown, Minus, Activity,
  BookOpen, Zap, Upload, Download, FileJson, X, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useStrategyStore } from '../store/useStrategyStore';
import { useToastStore } from '../store/useToastStore';
import { api, ApiError } from '../lib/api';
import { strategyToBackend } from '../lib/mappers';
import { Strategy } from '../types/strategy';

const INSTRUMENTS = ['All', 'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD'];
const TIMEFRAMES  = ['All', 'M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
const DIRECTIONS  = ['All', 'Long Only', 'Short Only', 'Both'];

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
const API_KEY  = (import.meta.env.VITE_API_KEY  as string) || '';

const isUUID = (id: string) => /^[0-9a-f-]{36}$/.test(id);

// ─── Import normalizer ────────────────────────────────────────────────────────
// Accepts either the flat backend format OR the nested strategy-spec format
// produced by strategy definition files (strategy.instrument, kill_zones, etc.)

const parseFloat1 = (val: any, fallback: number) => {
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? fallback : n;
};

// Convert a decimal fraction to a percentage if the author used 0.01 instead of 1.0
const pctVal = (val: any, fallback: number) => {
  const n = parseFloat1(val, fallback);
  return n > 0 && n < 1 ? parseFloat((n * 100).toFixed(2)) : n;
};

// Maps indicator type strings and key names found in strategy-spec JSONs to
// the indicator IDs recognised by INDICATORS_METADATA / blocksFromBackend.
const INDICATOR_TYPE_MAP: Record<string, string> = {
  anchored_vwap:      'vwap',
  vwap:               'vwap',
  standard_deviation: 'bollinger', // VWAP std-dev bands → closest visual match
  vwap_bands:         'bollinger',
  tick_delta:         'obv',       // Volume delta → closest volume indicator
  volume_delta:       'obv',
  rsi:                'rsi',
  ema:                'ema',
  sma:                'sma',
  macd:               'macd',
  atr:                'atr',
  bollinger:          'bollinger',
  supertrend:         'supertrend',
  stochastic:         'stochastic',
  cci:                'cci',
  obv:                'obv',
  cmf:                'cmf',
  ichimoku:           'ichimoku',
};

// Build backend-format params for a known indicator from the raw indicator spec.
const buildParams = (indicatorId: string, indData: any): Record<string, any> => {
  switch (indicatorId) {
    case 'vwap':
      return { anchor: 'Session' };
    case 'bollinger': {
      const mult = indData.bands?.entry_upper?.multiplier
        ?? indData.bands?.entry_lower?.multiplier
        ?? indData.multiplier
        ?? 2;
      return { period: 20, std_dev: mult };
    }
    case 'obv':
    case 'cmf':
      return indData.lookback_bars ? { period: indData.lookback_bars } : {};
    case 'rsi':
      return { period: indData.period ?? 14, overbought: 70, oversold: 30 };
    case 'ema':
    case 'sma':
      return { period: indData.period ?? 20, source: 'close' };
    case 'macd':
      return { fastLength: 12, slowLength: 26, signalLength: 9 };
    case 'atr':
      return { period: indData.period ?? 14 };
    default:
      return indData.period ? { period: indData.period } : {};
  }
};

const normalizeImportPayload = (raw: any): any | any[] => {
  // Already in flat backend format
  if (raw.name && raw.instrument && raw.timeframe) return raw;

  const s    = raw.strategy        || {};
  const risk = raw.risk_management || {};

  // ── v2.1 multi-instrument format ───────────────────────────────────────────
  // Detected by: has timeframe_config + instruments[] array
  if (raw.timeframe_config && Array.isArray(raw.instruments)) {
    const timeframe = raw.timeframe_config.execution || 'M5';
    const baseName  = s.name || raw.name || 'Imported Strategy';
    const enabled   = (raw.instruments as any[]).filter(i => i.enabled !== false);
    if (enabled.length > 0) {
      return enabled.map((inst: any) => {
        const kz = inst.kill_zones || {};
        const session_filter: string[] = [];
        if (kz.london_open?.active)              session_filter.push('london');
        if (kz.new_york_open?.active)            session_filter.push('newYork');
        if (kz.tokyo_open?.active || kz.asia?.active) session_filter.push('asia');

        const filters: Record<string, any> = {};
        if (inst.adx_threshold) {
          filters['adx'] = { period: 14, threshold: inst.adx_threshold };
        }

        const normalMult = inst.vwap_bands?.normal?.entry_mult ?? 1.5;
        const entry_conditions = [
          { indicator: 'VWAP_LOWER_TOUCH', params: { multiplier: normalMult }, operator: 'GREATER_THAN', value: 0, logic: 'AND' },
          { indicator: 'VWAP_UPPER_TOUCH', params: { multiplier: normalMult }, operator: 'GREATER_THAN', value: 0, logic: 'AND' },
          { indicator: 'RSI',              params: { period: 14, overbought: 70, oversold: 30 }, operator: 'GREATER_THAN', value: 0, logic: 'AND' },
        ];

        return {
          name:               enabled.length > 1 ? `${baseName} - ${inst.symbol}` : baseName,
          instrument:         inst.symbol,
          timeframe,
          description:        s.description || null,
          direction:          'BOTH',
          risk_per_trade:     pctVal(risk.risk_per_trade_pct ?? risk.risk_per_trade ?? 1.0, 1.0),
          max_daily_drawdown: pctVal(risk.max_daily_loss_pct ?? risk.max_daily_loss ?? 3.0, 3.0),
          session_filter,
          entry_conditions,
          exit_conditions:    [],
          filters,
          is_active:          true,
        };
      });
    }
  }

  // ── Original nested strategy-spec format ───────────────────────────────────
  const kz = raw.kill_zones || {};

  const name       = s.name       || raw.name;
  const instrument = s.instrument || raw.instrument;
  const timeframe  = s.timeframe  || raw.timeframe;
  if (!name || !instrument || !timeframe) return raw; // let validator reject it

  // Sessions from kill_zones
  const session_filter: string[] = [];
  if (kz.london_open?.active)   session_filter.push('london');
  if (kz.new_york_open?.active) session_filter.push('newYork');
  if (kz.asia?.active)          session_filter.push('asia');

  // Direction from entry_conditions keys
  const hasLong  = !!raw.entry_conditions?.long;
  const hasShort = !!raw.entry_conditions?.short;
  const direction =
    hasLong && hasShort ? 'BOTH' :
    hasLong             ? 'LONG' :
    hasShort            ? 'SHORT' : 'BOTH';

  // Build entry_conditions blocks from the indicators section.
  const entry_conditions: any[] = [];
  const seen = new Set<string>();

  // Indicators whose values oscillate around zero are skipped (would always fail > 0)
  const SKIP_ENTRY_CONDITION = new Set(['obv', 'cmf']);

  for (const [key, indData] of Object.entries(raw.indicators ?? {}) as [string, any][]) {
    const indicatorId =
      INDICATOR_TYPE_MAP[indData?.type ?? ''] ??
      INDICATOR_TYPE_MAP[key] ??
      null;
    if (!indicatorId || seen.has(indicatorId)) continue;
    seen.add(indicatorId);
    if (SKIP_ENTRY_CONDITION.has(indicatorId)) continue;
    entry_conditions.push({
      indicator: indicatorId.toUpperCase(),
      params:    buildParams(indicatorId, indData),
      operator:  'GREATER_THAN',
      value:     0,
      logic:     'AND',
    });
  }

  if (entry_conditions.length === 0) {
    entry_conditions.push({
      indicator: 'VWAP',
      params:    { anchor: 'Session' },
      operator:  'GREATER_THAN',
      value:     0,
      logic:     'AND',
    });
  }

  return {
    name,
    instrument,
    timeframe,
    description:        s.description || null,
    direction,
    risk_per_trade:     pctVal(risk.risk_per_trade ?? risk.risk_per_trade_pct, 1.0),
    max_daily_drawdown: pctVal(risk.max_daily_loss ?? risk.max_daily_drawdown ?? risk.max_daily_loss_pct, 5.0),
    session_filter,
    entry_conditions,
    exit_conditions: [],
    filters:         {},
    is_active: true,
  };
};

// ─── Direction helpers ────────────────────────────────────────────────────────

const directionMeta = (d: string) => {
  if (d === 'Long Only')  return { color: 'text-emerald-400', icon: <TrendingUp  className="w-3 h-3" /> };
  if (d === 'Short Only') return { color: 'text-red-400',     icon: <TrendingDown className="w-3 h-3" /> };
  return                         { color: 'text-blue-400',    icon: <Minus        className="w-3 h-3" /> };
};

// ─── Import modal ─────────────────────────────────────────────────────────────

interface ImportResult { name: string; ok: boolean; error?: string }

interface ImportModalProps {
  results: ImportResult[];
  isImporting: boolean;
  onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ results, isImporting, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg w-full max-w-md shadow-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2937]">
        <h2 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
          Import Results
        </h2>
        {!isImporting && (
          <button onClick={onClose} className="text-gray-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-5 space-y-2 max-h-72 overflow-y-auto">
        {isImporting ? (
          <div className="flex items-center gap-2 text-[#00d4aa] text-xs font-mono animate-pulse">
            IMPORTING...
          </div>
        ) : results.map((r, i) => (
          <div key={i} className="flex items-center gap-3">
            {r.ok
              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              : <AlertCircle  className="w-3.5 h-3.5 text-red-400 shrink-0" />}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono text-gray-200 truncate block">{r.name}</span>
              {r.error && <span className="text-[10px] font-mono text-red-400">{r.error}</span>}
            </div>
          </div>
        ))}
      </div>
      {!isImporting && (
        <div className="px-5 pb-4 flex justify-end">
          <button onClick={onClose} className="btn-teal text-xs px-4 py-2 cursor-pointer">
            DONE
          </button>
        </div>
      )}
    </div>
  </div>
);

// ─── Strategy row ─────────────────────────────────────────────────────────────

interface RowProps {
  strategy: Strategy;
  isDeleting: boolean;
  isDuplicating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExportMql5: () => void;
  onExportJson: () => void;
  onToggleFavorite: () => void;
}

const StrategyRow: React.FC<RowProps> = ({
  strategy, isDeleting, isDuplicating,
  onEdit, onDelete, onDuplicate, onExportMql5, onExportJson, onToggleFavorite,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { color, icon } = directionMeta(strategy.direction);
  const uuid = isUUID(strategy.id);

  return (
    <div className="terminal-card p-4 hover:border-[#2d3748] transition-colors">
      <div className="flex items-center gap-4">
        {/* Favourite */}
        <button onClick={onToggleFavorite} className="shrink-0 cursor-pointer">
          <Star className={`w-4 h-4 transition-colors ${
            strategy.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-700 hover:text-amber-400'
          }`} />
        </button>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold text-white truncate">{strategy.name}</span>
            <span className="text-[10px] font-mono text-gray-600 bg-[#1f2937] px-1.5 py-0.5 rounded shrink-0">
              {strategy.blocks.length} BLOCKS
            </span>
            {!uuid && (
              <span className="text-[10px] font-mono text-amber-500/70 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                LOCAL
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-mono text-[#00d4aa]">{strategy.instrument}</span>
            <span className="text-[10px] font-mono text-gray-500">{strategy.timeframe}</span>
            <span className={`text-[10px] font-mono flex items-center gap-1 ${color}`}>
              {icon}{strategy.direction}
            </span>
          </div>
        </div>

        {/* Performance */}
        <div className="hidden lg:flex items-center gap-6">
          {strategy.winRate !== undefined ? (
            <>
              <div className="text-center">
                <div className="text-[10px] font-mono text-gray-600 tracking-widest">WIN RATE</div>
                <div className={`text-sm font-mono font-bold ${strategy.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {strategy.winRate.toFixed(1)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-mono text-gray-600 tracking-widest">NET PROFIT</div>
                <div className={`text-sm font-mono font-bold ${(strategy.netProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(strategy.netProfit ?? 0) >= 0 ? '+' : ''}{(strategy.netProfit ?? 0).toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-mono text-gray-600 tracking-widest">DRAWDOWN</div>
                <div className="text-sm font-mono font-bold text-orange-400">
                  -{(strategy.drawdown ?? 0).toFixed(2)}%
                </div>
              </div>
            </>
          ) : (
            <span className="text-[10px] font-mono text-gray-700 italic">No backtest data</span>
          )}
        </div>

        {/* Risk */}
        <div className="hidden xl:flex items-center gap-4">
          <div className="text-center">
            <div className="text-[10px] font-mono text-gray-600 tracking-widest">RISK/TRADE</div>
            <div className="text-xs font-mono text-gray-300">{strategy.riskPerTrade}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono text-gray-600 tracking-widest">MAX DD</div>
            <div className="text-xs font-mono text-gray-300">{strategy.maxDailyDrawdown}%</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEdit} title="Edit in builder"
            className="p-2 text-gray-500 hover:text-[#00d4aa] hover:bg-[#1f2937] rounded transition-all cursor-pointer">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDuplicate} disabled={isDuplicating} title={uuid ? 'Duplicate' : 'Save to backend first'}
            className="p-2 text-gray-500 hover:text-blue-400 hover:bg-[#1f2937] rounded transition-all disabled:opacity-40 cursor-pointer">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={onExportJson} title="Export as JSON"
            className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-[#1f2937] rounded transition-all cursor-pointer">
            <FileJson className="w-3.5 h-3.5" />
          </button>
          <button onClick={onExportMql5} title={uuid ? 'Export MQL5' : 'Save to backend first'}
            className="p-2 text-gray-500 hover:text-purple-400 hover:bg-[#1f2937] rounded transition-all cursor-pointer">
            <Code2 className="w-3.5 h-3.5" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-red-900/20 border border-red-900/40 rounded px-2 py-1">
              <span className="text-[10px] font-mono text-red-400">Confirm?</span>
              <button onClick={() => { onDelete(); setConfirmDelete(false); }} disabled={isDeleting}
                className="text-[10px] font-mono text-red-400 hover:text-red-300 px-1 cursor-pointer">YES</button>
              <button onClick={() => setConfirmDelete(false)}
                className="text-[10px] font-mono text-gray-500 hover:text-gray-300 px-1 cursor-pointer">NO</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} disabled={isDeleting} title="Delete"
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-[#1f2937] rounded transition-all disabled:opacity-40 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const Strategies: React.FC = () => {
  const navigate = useNavigate();
  const {
    strategies, isLoading,
    deleteStrategy, toggleFavorite, fetchStrategies,
  } = useStrategyStore();
  const [isCreating, setIsCreating] = useState(false);
  const { addToast } = useToastStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search,     setSearch]     = useState('');
  const [instrument, setInstrument] = useState('All');
  const [timeframe,  setTimeframe]  = useState('All');
  const [direction,  setDirection]  = useState('All');
  const [deletingId,    setDeletingId]    = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isImporting,   setIsImporting]   = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const filtered = useMemo(() => strategies.filter(s => {
    if (search      && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (instrument !== 'All' && s.instrument !== instrument) return false;
    if (timeframe  !== 'All' && s.timeframe  !== timeframe)  return false;
    if (direction  !== 'All' && s.direction  !== direction)  return false;
    return true;
  }), [strategies, search, instrument, timeframe, direction]);

  const stats = useMemo(() => ({
    total:     strategies.length,
    active:    strategies.length,
    favorites: strategies.filter(s => s.isFavorite).length,
  }), [strategies]);

  // ── Create new ─────────────────────────────────────────────────────────────

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const created = await api.post<any>('/strategies', {
        name:               `New Strategy ${strategies.length + 1}`,
        instrument:         'XAUUSD',
        timeframe:          'H1',
        direction:          'BOTH',
        session_filter:     ['london', 'newYork'],
        risk_per_trade:     1.0,
        max_daily_drawdown: 5.0,
        entry_conditions:   [],
        exit_conditions:    [],
        filters:            {},
        is_active:          true,
      });
      await fetchStrategies();
      navigate(`/strategies/${created.id}`);
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Failed to create strategy.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // ── Import ──────────────────────────────────────────────────────────────────

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    let parsed: any;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      addToast('Invalid JSON file.', 'error');
      return;
    }

    const raw: any[] = Array.isArray(parsed) ? parsed : [parsed];
    if (raw.length === 0) { addToast('No strategies found in file.', 'warning'); return; }
    const items = raw.flatMap(normalizeImportPayload);

    setIsImporting(true);
    setImportResults([]);
    setShowImportModal(true);

    const results: ImportResult[] = [];
    for (const item of items) {
      const name = item.name || 'Unnamed';
      if (!item.instrument || !item.timeframe) {
        results.push({ name, ok: false, error: 'Missing required fields: instrument, timeframe' });
        continue;
      }
      try {
        await api.post('/strategies', item);
        results.push({ name, ok: true });
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Import failed';
        results.push({ name, ok: false, error: msg });
      }
    }

    setImportResults(results);
    setIsImporting(false);

    const ok = results.filter(r => r.ok).length;
    if (ok > 0) {
      await fetchStrategies();
      addToast(`Imported ${ok} of ${items.length} strategies.`, ok === items.length ? 'success' : 'warning');
    }
  };

  // ── Export JSON ─────────────────────────────────────────────────────────────

  const handleExportJson = (strategy: Strategy) => {
    const payload = strategyToBackend(strategy);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${strategy.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('JSON file downloaded.', 'success');
  };

  // ── Export MQL5 ─────────────────────────────────────────────────────────────

  const handleExportMql5 = async (id: string, name: string) => {
    if (!isUUID(id)) { addToast('Save the strategy to backend before exporting.', 'warning'); return; }
    try {
      const res = await fetch(`${API_BASE}/api/v1/strategies/${id}/export-mql5`, {
        headers: {
          'X-API-Key':     API_KEY,
          'Authorization': `Bearer ${localStorage.getItem('af_access_token') || ''}`,
        },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${name.replace(/\s+/g, '_')}.mq5`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('MQL5 file downloaded.', 'success');
    } catch {
      addToast('MQL5 export failed.', 'error');
    }
  };

  // ── Delete / duplicate ──────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteStrategy(id);
    addToast('Strategy deleted.', 'info');
    setDeletingId(null);
  };

  const handleDuplicate = async (id: string) => {
    if (!isUUID(id)) { addToast('Save the strategy to backend before duplicating.', 'warning'); return; }
    setDuplicatingId(id);
    try {
      await api.post<any>(`/strategies/${id}/duplicate`);
      await fetchStrategies();
      addToast('Strategy duplicated.', 'success');
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Duplicate failed.', 'error');
    } finally {
      setDuplicatingId(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const STAT_CARDS = [
    { label: 'TOTAL',     value: stats.total,     color: '#00d4aa', Icon: BookOpen },
    { label: 'ACTIVE',    value: stats.active,    color: '#60a5fa', Icon: Activity },
    { label: 'FAVORITES', value: stats.favorites, color: '#f59e0b', Icon: Star },
  ];

  const FILTER_SELECTS = [
    { label: 'Instrument', value: instrument, setter: setInstrument, options: INSTRUMENTS },
    { label: 'Timeframe',  value: timeframe,  setter: setTimeframe,  options: TIMEFRAMES  },
    { label: 'Direction',  value: direction,  setter: setDirection,  options: DIRECTIONS  },
  ];

  return (
    <div className="space-y-6">
      {showImportModal && (
        <ImportModal
          results={importResults}
          isImporting={isImporting}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold tracking-widest text-white uppercase">
            Strategy Library
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">
            {filtered.length} of {strategies.length} strategies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-outline flex items-center gap-2 text-xs px-4 py-2 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            IMPORT JSON
          </button>
          <button
            onClick={handleCreateNew}
            disabled={isCreating}
            className="btn-teal flex items-center gap-2 text-xs px-4 py-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            {isCreating ? 'CREATING...' : 'NEW STRATEGY'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {STAT_CARDS.map(({ label, value, color, Icon }) => (
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

      {/* Filters */}
      <div className="terminal-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search strategies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0a0e17] border border-[#1f2937] rounded pl-9 pr-3 py-2 text-xs font-mono text-gray-200 placeholder-gray-600 focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]/30"
          />
        </div>
        {FILTER_SELECTS.map(({ label, value, setter, options }) => (
          <select key={label} value={value} onChange={e => setter(e.target.value)}
            className="bg-[#0a0e17] border border-[#1f2937] rounded px-3 py-2 text-xs font-mono text-gray-300 focus:border-[#00d4aa] focus:outline-none cursor-pointer">
            {options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${label}s` : o}</option>)}
          </select>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="terminal-card p-12 flex items-center justify-center">
          <div className="text-xs font-mono text-[#00d4aa] animate-pulse tracking-widest">LOADING STRATEGIES...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="terminal-card p-12 flex flex-col items-center justify-center gap-3">
          <Zap className="w-8 h-8 text-gray-700" />
          <p className="text-xs font-mono text-gray-500 tracking-widest">NO STRATEGIES FOUND</p>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={() => fileInputRef.current?.click()}
              className="btn-outline text-xs px-4 py-2 flex items-center gap-2 cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> IMPORT JSON
            </button>
            <button onClick={handleCreateNew} disabled={isCreating}
              className="btn-teal text-xs px-4 py-2 flex items-center gap-2 cursor-pointer disabled:opacity-50">
              <Plus className="w-3.5 h-3.5" /> BUILD STRATEGY
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(strategy => (
            <StrategyRow
              key={strategy.id}
              strategy={strategy}
              isDeleting={deletingId === strategy.id}
              isDuplicating={duplicatingId === strategy.id}
              onEdit={() => navigate(`/strategies/${strategy.id}`)}
              onDelete={() => handleDelete(strategy.id)}
              onDuplicate={() => handleDuplicate(strategy.id)}
              onExportMql5={() => handleExportMql5(strategy.id, strategy.name)}
              onExportJson={() => handleExportJson(strategy)}
              onToggleFavorite={() => toggleFavorite(strategy.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
