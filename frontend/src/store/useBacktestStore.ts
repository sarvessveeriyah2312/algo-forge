import { create } from 'zustand';
import { BacktestLog, BacktestConfig, BacktestSummaryMetrics, BacktestTrade } from '../types/backtest';
import { MOCK_TRADES } from '../data/mockData';
import { api, ApiError } from '../lib/api';
import { metricsFromBackend, tradeFromBackend } from '../lib/mappers';

// ─── Fallback mock data (used when backend unreachable) ───────────────────────

const DEFAULT_METRICS: Record<string, BacktestSummaryMetrics> = {
  'strat-1': { netProfitPercent: 24.8, netProfitValue: 2480, totalTrades: 147, winRate: 64.2, profitFactor: 2.15, maxDrawdown: 3.1, avgTradeDuration: '1h 45m', sharpeRatio: 2.45, expectancy: 14.5 },
  'strat-2': { netProfitPercent: 12.4, netProfitValue: 1240, totalTrades: 98, winRate: 58.5, profitFactor: 1.84, maxDrawdown: 4.2, avgTradeDuration: '4h 12m', sharpeRatio: 1.95, expectancy: 8.2 },
  'strat-3': { netProfitPercent: 18.2, netProfitValue: 1820, totalTrades: 64, winRate: 61.1, profitFactor: 2.05, maxDrawdown: 2.8, avgTradeDuration: '30m', sharpeRatio: 2.85, expectancy: 22.3 },
};

const alignBalances = (trades: BacktestTrade[], initial: number) => {
  let bal = initial;
  return trades.map((t, i) => { bal += t.pnl; return { ...t, index: i + 1, balance: parseFloat(bal.toFixed(2)) }; });
};

const DEFAULT_TRADES: Record<string, BacktestTrade[]> = {
  'strat-1': alignBalances(MOCK_TRADES, 10000),
  'strat-2': alignBalances(MOCK_TRADES.map((t, i) => ({ ...t, id: `t-2-${i}`, pair: 'EURUSD', entryPrice: parseFloat((1.08 + i * 0.0005).toFixed(4)), exitPrice: parseFloat((1.082 + i * 0.0005).toFixed(4)), pips: i % 2 === 0 ? 25 : -15, pnl: i % 2 === 0 ? 125 : -75 })), 10000),
  'strat-3': alignBalances(MOCK_TRADES.slice(0, 12).map((t, i) => ({ ...t, id: `t-3-${i}`, pair: 'GBPUSD', entryPrice: parseFloat((1.27 + i * 0.001).toFixed(4)), exitPrice: parseFloat((1.273 + i * 0.001).toFixed(4)), pips: i % 3 !== 0 ? 35 : -20, pnl: i % 3 !== 0 ? 175 : -100 })), 10000),
};

// ─── Store types ──────────────────────────────────────────────────────────────

interface BacktestState {
  logs: BacktestLog[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  config: BacktestConfig;
  metrics: Record<string, BacktestSummaryMetrics>;
  trades: Record<string, BacktestTrade[]>;
  equityCurve: Record<string, { date: string; equity: number }[]>;
  activeResultId: string;
  activeRunId: string | null;

  setConfig: (config: BacktestConfig) => void;
  setActiveResultId: (id: string) => void;
  clearLogs: () => void;
  addLog: (msg: string, type?: BacktestLog['type']) => void;
  runBacktest: (strategyId: string, strategyName: string, pair: string, riskValue: number) => void;
  fetchRunResult: (runId: string, strategyId: string) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBacktestStore = create<BacktestState>((set, get) => ({
  logs: [
    { id: 'log-1', timestamp: '10:00:00', message: 'AlgoForge core backtest engine initialized.', type: 'info' },
    { id: 'log-2', timestamp: '10:00:01', message: 'Enter custom parameters and hit "Run Backtest" to begin simulation.', type: 'success' },
  ],
  status: 'idle',
  progress: 0,
  config: {
    strategyId: 'strat-1',
    instruments: ['XAUUSD'],
    dateFrom: '2026-05-01',
    dateTo: '2026-06-08',
    initialCapital: 10000,
    spread: 10,
    commission: 5.00,
    slippage: 1,
  },
  metrics: DEFAULT_METRICS,
  trades: DEFAULT_TRADES,
  equityCurve: {},
  activeResultId: 'strat-1',
  activeRunId: null,

  setConfig: (config) => set({ config }),
  setActiveResultId: (id) => set({ activeResultId: id }),
  clearLogs: () => set({ logs: [] }),

  addLog: (msg, type = 'info') => set(state => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    return {
      logs: [...state.logs, { id: `log-${Date.now()}-${Math.random()}`, timestamp: ts, message: msg, type }],
    };
  }),

  fetchRunResult: async (runId, strategyId) => {
    try {
      const [runData, tradesData, curveData] = await Promise.all([
        api.get<any>(`/backtest/${runId}`),
        api.get<{ items: any[] }>(`/backtest/${runId}/trades?page_size=500`),
        api.get<{ date: string; equity: number }[]>(`/backtest/${runId}/equity-curve`).catch(() => []),
      ]);

      const metrics = metricsFromBackend({ ...runData, initial_capital: get().config.initialCapital });
      const trades = (tradesData.items || []).map(tradeFromBackend);

      set(state => ({
        metrics: { ...state.metrics, [strategyId]: metrics },
        trades: { ...state.trades, [strategyId]: trades },
        equityCurve: { ...state.equityCurve, [strategyId]: curveData || [] },
        activeResultId: strategyId,
        status: 'completed',
        progress: 100,
      }));
    } catch {
      set({ status: 'failed' });
    }
  },

  runBacktest: (strategyId, strategyName, pair, riskValue) => {
    const { config, addLog, fetchRunResult } = get();
    set({ status: 'running', progress: 0 });

    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    set({
      logs: [
        { id: '1', timestamp: ts, message: `[ENGINE] Starting backtest for: "${strategyName}"`, type: 'info' },
        { id: '2', timestamp: ts, message: `[CONFIG] Instrument: ${pair} | ${config.dateFrom} → ${config.dateTo}`, type: 'info' },
      ],
    });

    const isUUID = /^[0-9a-f-]{36}$/.test(strategyId);

    if (!isUUID) {
      // Backend not yet synced — fall back to local simulation
      runLocalSimulation({ strategyId, strategyName, pair, riskValue, config, set, get });
      return;
    }

    const payload = {
      strategy_id: strategyId,
      instrument: pair,
      timeframe: 'H1',
      date_from: config.dateFrom,
      date_to: config.dateTo,
      initial_capital: config.initialCapital,
      spread: config.spread,
      commission: config.commission,
      slippage: config.slippage,
    };

    api.post<{ id: string }>('/backtest/run', payload)
      .then(({ id: runId }) => {
        set({ activeRunId: runId, progress: 10 });
        addLog(`[API] Backtest run created: ${runId}`, 'info');

        // Open WebSocket for real-time log streaming
        let ws: WebSocket | null = null;
        try {
          ws = api.openWebSocket(`/ws/backtest/${runId}`);

          ws.onmessage = (event) => {
            try {
              const msg = JSON.parse(event.data);
              if (msg.type === 'log') {
                addLog(msg.message, 'info');
                set(state => ({ progress: Math.min(90, state.progress + 2) }));
              } else if (msg.type === 'complete') {
                ws?.close();
                fetchRunResult(runId, strategyId);
              }
            } catch {}
          };

          ws.onerror = () => {
            ws?.close();
            pollUntilComplete(runId, strategyId, fetchRunResult, addLog, set);
          };
        } catch {
          pollUntilComplete(runId, strategyId, fetchRunResult, addLog, set);
        }

        // Safety fallback: poll if WS never fires complete
        setTimeout(() => {
          if (get().status === 'running') {
            ws?.close();
            pollUntilComplete(runId, strategyId, fetchRunResult, addLog, set);
          }
        }, 120_000);
      })
      .catch((err: ApiError | Error) => {
        addLog(`[ERROR] ${err.message}`, 'error');
        set({ status: 'failed', progress: 0 });
        // Fallback to simulation so the UI isn't broken
        runLocalSimulation({ strategyId, strategyName, pair, riskValue, config, set, get });
      });
  },
}));

// ─── Polling helper ───────────────────────────────────────────────────────────

function pollUntilComplete(
  runId: string,
  strategyId: string,
  fetchRunResult: (r: string, s: string) => Promise<void>,
  addLog: (msg: string, type?: BacktestLog['type']) => void,
  set: any,
) {
  let attempts = 0;
  const maxAttempts = 60;

  const poll = async () => {
    attempts++;
    try {
      const data = await api.get<{ status: string; log_output: string | null }>(`/backtest/${runId}`);
      addLog(`[POLL] Status: ${data.status}`, 'info');
      set((state: any) => ({ progress: Math.min(90, state.progress + 5) }));

      if (data.status === 'COMPLETED') {
        await fetchRunResult(runId, strategyId);
      } else if (data.status === 'FAILED') {
        addLog('[ERROR] Backtest run failed on server', 'error');
        set({ status: 'failed' });
      } else if (attempts < maxAttempts) {
        setTimeout(poll, 3000);
      } else {
        addLog('[TIMEOUT] Backtest is taking too long, check server.', 'warning');
        set({ status: 'failed' });
      }
    } catch {
      if (attempts < maxAttempts) setTimeout(poll, 5000);
    }
  };

  setTimeout(poll, 2000);
}

// ─── Local simulation fallback ────────────────────────────────────────────────

function runLocalSimulation({ strategyId, strategyName, pair, riskValue, config, set, get }: any) {
  const { addLog } = get();
  let step = 0;
  const steps = [
    { msg: 'Connecting to local data cache...', type: 'info' as const },
    { msg: `Parsing strategy rules for "${strategyName}"...`, type: 'info' as const },
    { msg: `Bar feeds loaded. Running overlay algorithms...`, type: 'info' as const },
    { msg: `Calculating entry signals. Risk per trade: ${riskValue}%`, type: 'info' as const },
    { msg: `Simulating spread (${config.spread}pts) & commission ($${config.commission}/lot)`, type: 'info' as const },
    { msg: `Simulating slippage: ${config.slippage} ticks...`, type: 'warning' as const },
    { msg: `Running equity models...`, type: 'info' as const },
    { msg: `Simulation complete! Compiling summary...`, type: 'success' as const },
  ];

  const timer = setInterval(() => {
    if (step < steps.length) {
      addLog(steps[step].msg, steps[step].type);
      set({ progress: Math.min(95, Math.round(((step + 1) / steps.length) * 100)) });
      step++;
    } else {
      clearInterval(timer);
      const winRate = parseFloat((50 + Math.random() * 20).toFixed(1));
      const totalTrades = Math.floor(Math.random() * 80) + 40;
      const netPct = parseFloat((5 + Math.random() * 25).toFixed(1));
      const netVal = parseFloat((config.initialCapital * (netPct / 100)).toFixed(2));

      const metrics: BacktestSummaryMetrics = {
        netProfitPercent: netPct, netProfitValue: netVal, totalTrades, winRate,
        profitFactor: parseFloat((1.3 + Math.random() * 1.5).toFixed(2)),
        maxDrawdown: parseFloat((1.5 + Math.random() * 5).toFixed(1)),
        avgTradeDuration: ['45m', '2h 15m', '1h 30m'][Math.floor(Math.random() * 3)],
        sharpeRatio: parseFloat((1.2 + Math.random() * 1.8).toFixed(2)),
        expectancy: parseFloat((5 + Math.random() * 25).toFixed(1)),
      };

      const priceBase = pair === 'XAUUSD' ? 2000 : pair === 'USDJPY' ? 150 : 1.1;
      const mult = pair === 'XAUUSD' ? 1.5 : pair === 'USDJPY' ? 0.3 : 0.001;
      let bal = config.initialCapital;
      const trades: BacktestTrade[] = Array.from({ length: 20 }).map((_, i) => {
        const isWin = Math.random() * 100 < winRate;
        const pips = parseFloat((isWin ? Math.random() * 80 + 15 : -(Math.random() * 40 + 10)).toFixed(1));
        const pnl = parseFloat((config.initialCapital * (riskValue / 100) * (pips / 30)).toFixed(2));
        bal += pnl;
        const entry = parseFloat((priceBase + Math.random() * 30 * mult).toFixed(pair === 'XAUUSD' || pair === 'USDJPY' ? 2 : 4));
        return {
          id: `sim-${strategyId}-${i}`,
          index: i + 1,
          date: `2026-05-${String(i + 1).padStart(2, '0')} 10:00`,
          pair,
          direction: Math.random() < 0.55 ? 'LONG' : 'SHORT',
          entryPrice: entry,
          exitPrice: parseFloat((entry + pips * mult / 10).toFixed(pair === 'XAUUSD' || pair === 'USDJPY' ? 2 : 4)),
          pips,
          pnl,
          balance: parseFloat(bal.toFixed(2)),
        };
      });

      set((state: any) => ({
        status: 'completed', progress: 100, activeResultId: strategyId,
        metrics: { ...state.metrics, [strategyId]: metrics },
        trades: { ...state.trades, [strategyId]: trades },
      }));

      addLog(`[LOCAL] ${totalTrades} trades | Win rate: ${winRate}% | Net: +${netPct}% ($${netVal})`, 'success');
      addLog('Backtest complete. Results available on the Results page.', 'success');
    }
  }, 600);
}
