import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Terminal, 
  Settings2, 
  Trash2, 
  Compass, 
  TrendingUp, 
  Calendar,
  AlertOctagon,
  Cpu,
  BarChart3,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { useStrategyStore } from '../store/useStrategyStore';
import { useBacktestStore } from '../store/useBacktestStore';
import { useToastStore } from '../store/useToastStore';
import { BacktestConfig } from '../types/backtest';

export const Backtest: React.FC = () => {
  const navigate = useNavigate();
  const { strategies } = useStrategyStore();
  const { 
    logs, 
    status, 
    progress, 
    config, 
    setConfig, 
    runBacktest, 
    clearLogs 
  } = useBacktestStore();
  const { addToast } = useToastStore();

  const [selectedStratId, setSelectedStratId] = useState<string>(strategies[0]?.id || 'strat-1');
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['XAUUSD']);

  // Handle pair checkbox toggling
  const handlePairToggle = (pair: string) => {
    if (selectedPairs.includes(pair)) {
      if (selectedPairs.length === 1) {
        addToast('Backtest must contain at least 1 instrument.', 'warning');
        return;
      }
      setSelectedPairs(selectedPairs.filter((p) => p !== pair));
    } else {
      setSelectedPairs([...selectedPairs, pair]);
    }
  };

  const handleRunSimulation = () => {
    const activeStrat = strategies.find((s) => s.id === selectedStratId);
    if (!activeStrat) {
      addToast('Please select a valid strategy structure.', 'error');
      return;
    }

    // Capture the current input configs
    setConfig({
      ...config,
      strategyId: selectedStratId,
      instruments: selectedPairs,
    });

    // Start simulation steps inside state store
    runBacktest(
      activeStrat.id,
      activeStrat.name,
      selectedPairs.join(' & '),
      activeStrat.riskPerTrade || 1.0
    );
  };

  const activeStrat = strategies.find((s) => s.id === selectedStratId) || strategies[0];

  return (
    <div className="space-y-6">
      
      {/* Overview row */}
      <section className="bg-[#111827] border border-[#1f2937] p-4 rounded-md">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#00d4aa]">
          Simulation Backtest Station
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Evaluate visual strategies against deep historical market books. We match and execute orders on a bar-by-bar sequence.
        </p>
      </section>

      {/* Two Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Backtest Configuration inputs (Columns: 5) */}
        <div className="lg:col-span-5 bg-[#111827] border border-[#1f2937] p-5 rounded-md flex flex-col justify-between">
          <div className="space-y-4">
            
            <div className="border-b border-[#1f2937] pb-3 mb-1 flex items-center space-x-2">
              <Settings2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                Simulation Setup Check
              </h3>
            </div>

            {/* Select strategy dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Target Strategy Model</label>
              <select
                value={selectedStratId}
                onChange={(e) => setSelectedStratId(e.target.value)}
                disabled={status === 'running'}
                className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs text-gray-100 font-mono focus:border-[#00d4aa] focus:outline-none disabled:opacity-50"
              >
                {strategies.map((strat) => (
                  <option key={strat.id} value={strat.id}>
                    {strat.name} ({strat.timeframe})
                  </option>
                ))}
              </select>
            </div>

            {/* Multiselect checkboxes for instruments */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide block">Instruments (Multi-Select Confluences)</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD'].map((pair) => (
                  <button
                    key={pair}
                    type="button"
                    disabled={status === 'running'}
                    onClick={() => handlePairToggle(pair)}
                    className={`p-2 rounded text-center border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      selectedPairs.includes(pair)
                        ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/40'
                        : 'bg-[#1f2937]/30 text-gray-400 border-[#1f2937] hover:border-[#374151]'
                    }`}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range calendar picks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Historical Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="date"
                    disabled={status === 'running'}
                    value={config.dateFrom}
                    onChange={(e) => setConfig({ ...config, dateFrom: e.target.value })}
                    className="w-full bg-[#1f2937] border border-[#374151] rounded pl-9 pr-3 py-2 text-xs text-gray-100 font-mono focus:border-[#00d4aa] focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Historical End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="date"
                    disabled={status === 'running'}
                    value={config.dateTo}
                    onChange={(e) => setConfig({ ...config, dateTo: e.target.value })}
                    className="w-full bg-[#1f2937] border border-[#374151] rounded pl-9 pr-3 py-2 text-xs text-gray-100 font-mono focus:border-[#00d4aa] focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Capital Size */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Simulation Starting Balance</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-gray-500 font-mono">$</span>
                <input
                  type="number"
                  disabled={status === 'running'}
                  value={config.initialCapital}
                  onChange={(e) => setConfig({ ...config, initialCapital: parseInt(e.target.value) || 10000 })}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded pl-7 pr-3 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none disabled:opacity-50"
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Tick feeds and charges */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Spread (pts)</label>
                <input
                  type="number"
                  disabled={status === 'running'}
                  value={config.spread}
                  onChange={(e) => setConfig({ ...config, spread: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-2.5 py-1.5 text-xs font-mono text-gray-100 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Commish ($)</label>
                <input
                  type="number"
                  disabled={status === 'running'}
                  value={config.commission}
                  onChange={(e) => setConfig({ ...config, commission: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-2.5 py-1.5 text-xs font-mono text-gray-100 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Slippage (tk)</label>
                <input
                  type="number"
                  disabled={status === 'running'}
                  value={config.slippage}
                  onChange={(e) => setConfig({ ...config, slippage: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-2.5 py-1.5 text-xs font-mono text-gray-100 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-[#1f2937] mt-6">
            <button
              onClick={handleRunSimulation}
              disabled={status === 'running'}
              className="w-full py-3 bg-[#00d4aa] disabled:bg-gray-700 text-black hover:bg-opacity-95 rounded text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {status === 'running' ? (
                <>
                  <span className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin"></span>
                  <span>Compiling Ticks {progress}%</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Execute Backtest Engine</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Log terminal output (Columns: 7) */}
        <div className="lg:col-span-7 bg-[#111827] border border-[#1f2937] rounded-md flex flex-col overflow-hidden h-[480px]">
          {/* Header */}
          <div className="bg-[#0a0e17] px-4 py-3 border-b border-[#1f2937] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#00d4aa]" />
              <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest">
                Tick Engine Log Stream
              </span>
            </div>
            
            {status === 'running' && (
              <span className="flex items-center space-x-1.5 text-[10px] font-mono text-[#00d4aa]">
                <span className="w-1.5 h-1.5 bg-[#00d4aa] rounded-full animate-ping"></span>
                <span>CALCULATING</span>
              </span>
            )}
          </div>

          {/* Terminal Console Output area */}
          <div className="flex-1 bg-[#05080f] p-5 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-2 select-all relative scrollbar-none">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className={`${
                  log.type === 'success' ? 'text-[#00d4aa]' :
                  log.type === 'error' ? 'text-red-400 font-bold' :
                  log.type === 'warning' ? 'text-amber-500' :
                  'text-gray-400'
                }`}
              >
                <span className="text-gray-600">[{log.timestamp}]</span>{' '}
                <span>{log.message}</span>
              </div>
            ))}
            
            {/* Real-time simulation bar */}
            {status === 'running' && (
              <div className="pt-2">
                <div className="text-emerald-400">
                  Processing:
                </div>
                <div className="w-full bg-gray-900 h-2 mt-1 rounded overflow-hidden">
                  <div 
                    className="bg-[#00d4aa] h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Blinking Prompt Cursor */}
            <div className="pt-2 flex items-center space-x-1">
              <span className="text-gray-600">AF_BACKTEST_RUNNER_SH:~$</span>
              <span className="w-1.5 h-3 bg-[#00d4aa] animate-pulse"></span>
            </div>
          </div>

          {/* Complete Status Prompt */}
          {status === 'completed' && (
            <div className="bg-[#1f2937]/50 border-t border-[#1f2937] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shrink-0">
              <div className="flex items-center space-x-3.5">
                <CheckCircle2 className="w-5 h-5 text-[#00d4aa]" />
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Simulation Executed Perfectly!</h4>
                  <p className="text-[10px] text-gray-400">Quantitative charts loaded for {activeStrat?.name}.</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/results')}
                className="bg-[#00d4aa] text-black px-4 py-2 rounded text-xs font-bold font-mono uppercase tracking-wider hover:bg-opacity-95 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span className="font-bold">Inspect Performance Report</span>
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
