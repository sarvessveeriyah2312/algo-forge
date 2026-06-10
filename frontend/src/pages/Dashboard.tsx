import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Play, 
  ArrowUpRight, 
  TrendingUp, 
  Star, 
  Award, 
  Zap,
  Download,
  ListFilter,
  Layers,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useStrategyStore } from '../store/useStrategyStore';
import { useBacktestStore } from '../store/useBacktestStore';
import { useToastStore } from '../store/useToastStore';
import { EquityCurve } from '../components/charts/EquityCurve';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { strategies, toggleFavorite } = useStrategyStore();
  const { metrics, runBacktest } = useBacktestStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(true);

  // Simulate skeleton loaders on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const totalStrats = strategies.length;
  // Calculate average win rate
  const avgWinRate = totalStrats > 0 
    ? (strategies.reduce((acc, s) => acc + (s.winRate || 0), 0) / totalStrats).toFixed(1)
    : '0.0';

  // Find best strategy by netProfit
  const bestStrat = strategies.reduce((prev, current) => {
    return ((prev.netProfit || 0) > (current.netProfit || 0)) ? prev : current;
  }, strategies[0]);

  const handleImportEA = () => {
    addToast('Parsing MT5 expert advisor file: matching entry nodes...', 'info');
    setTimeout(() => {
      addToast('MQL5 parse unsuccessful: compiler offline. Set custom API endpoint in Settings.', 'error');
    }, 1200);
  };

  const handleExportMQL = () => {
    addToast('Connect AlgoForge backend to enable direct MQL5 source exports.', 'warning');
  };

  // Skeleton Loader elements
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111827] border border-[#1f2937] p-4 rounded-md h-24 animate-pulse flex flex-col justify-between">
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              <div className="h-6 bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* 3 Column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-md h-80 animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700/50 rounded w-full"></div>
            ))}
          </div>
          <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-md h-80 animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700/50 rounded w-full"></div>
            ))}
          </div>
          <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-md h-80 animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700/50 rounded w-full"></div>
            ))}
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-md h-80 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/6 mb-4"></div>
          <div className="h-56 bg-gray-700/30 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="terminal-card p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] mono text-gray-500 uppercase tracking-wider font-bold">TOTAL STRATEGIES</span>
            <div className="stat-value mono">{totalStrats}</div>
          </div>
          <div className="bg-[#00d4aa]/10 p-2.5 rounded border border-[#00d4aa]/20">
            <Layers className="w-5 h-5 text-[#00d4aa]" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="terminal-card p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] mono text-gray-500 uppercase tracking-wider font-bold">AVERAGE WIN RATE</span>
            <div className="stat-value mono accent-text">{avgWinRate}%</div>
          </div>
          <div className="bg-[#00d4aa]/10 p-2.5 rounded border border-[#00d4aa]/20">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="terminal-card p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] mono text-gray-500 uppercase tracking-wider font-bold">BEST STRATEGY</span>
            <div className="text-sm font-bold text-[#00d4aa] truncate max-w-[150px]">{bestStrat?.name || 'N/A'}</div>
            <div className="text-xs font-semibold text-[#00d4aa]">+{bestStrat?.netProfit || '0.0'}% Net</div>
          </div>
          <div className="bg-amber-500/10 p-2.5 rounded border border-amber-500/20">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="terminal-card p-4 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] mono text-gray-500 uppercase tracking-wider font-bold">LAST SIM BACKTEST</span>
            <div className="text-xs font-semibold text-gray-200">M15 — XAUUSD</div>
            <div className="text-[11px] font-mono font-bold text-[#00d4aa] uppercase tracking-wider bg-[#00d4aa]/10 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-[#00d4aa]/20">
              SIM SUCCESS
            </div>
          </div>
          <div className="bg-[#00d4aa]/10 p-2.5 rounded border border-[#00d4aa]/20">
            <Zap className="w-5 h-5 text-[#00d4aa]" />
          </div>
        </div>
      </section>

      {/* 2. Three-column workspace board */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Active strategies lists */}
        <div className="terminal-card flex flex-col h-96 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f2937] flex items-center justify-between bg-[#111827]">
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] inline-block animate-pulse"></span>
              <span>Active Strategies ({strategies.length})</span>
            </h3>
            <button 
              onClick={() => navigate('/builder')}
              className="text-[11px] text-[#00d4aa] hover:underline flex items-center space-x-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1f2937] px-2 py-1">
            {strategies.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-gray-500">No active trading strategies.</p>
                <button
                  onClick={() => navigate('/builder')}
                  className="mt-2.5 text-xs bg-[#00d4aa] text-black px-3 py-1 font-semibold rounded hover:bg-opacity-90 transition-all"
                >
                  Create Strategy
                </button>
              </div>
            ) : (
              strategies.map((strat) => (
                <div key={strat.id} className="p-2.5 hover:bg-[#1f2937]/70 transition-all flex items-center justify-between">
                  <div className="space-y-1 min-w-0 flex-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-xs text-gray-100 truncate">{strat.name}</span>
                      {strat.isFavorite && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />}
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#6b7280]">
                      <span className="text-gray-300 font-semibold">{strat.instrument}</span>
                      <span>•</span>
                      <span className="bg-gray-800 text-gray-400 px-1.5 py-0.2 rounded font-bold">{strat.timeframe}</span>
                      <span>•</span>
                      <span className="text-[#00d4aa] font-semibold">{strat.direction}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono font-bold bg-[#00d4aa]/10 text-[#00d4aa] px-2 py-0.5 rounded border border-[#00d4aa]/20">
                      {strat.winRate}% WR
                    </span>
                    <button
                      onClick={() => toggleFavorite(strat.id)}
                      className="p-1 hover:bg-[#1f2937] text-gray-500 hover:text-amber-500 rounded transition-all cursor-pointer"
                    >
                      <Star className={`w-3.5 h-3.5 ${strat.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-gray-500'}`} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Recent Backtest Results */}
        <div className="terminal-card flex flex-col h-96 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1f2937] flex items-center justify-between bg-[#111827]">
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest flex items-center space-x-2">
              <span>Recent Backtest Matrix</span>
            </h3>
            <span className="text-[9px] font-mono text-gray-500">Live DB</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0e17]/80 text-[10px] font-mono text-[#6b7280] border-b border-[#1f2937]">
                  <th className="py-2.5 px-3">Strategy</th>
                  <th className="py-2.5 px-3">Pair</th>
                  <th className="py-2.5 px-3 text-right">Net Profit</th>
                  <th className="py-2.5 px-3 text-right">Drawdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937] text-xs">
                {strategies.map((strat) => (
                  <tr 
                    key={strat.id} 
                    onClick={() => navigate('/results')}
                    className="hover:bg-[#1f2937]/75 transition-all cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-medium text-gray-200 truncate max-w-[110px]">
                      {strat.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400">
                      {strat.instrument}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#00d4aa] font-mono font-bold">
                      +{strat.netProfit || '0.0'}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-red-400 font-mono">
                      {strat.drawdown || '0.0'}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-[#1f2937] text-center">
            <button
              onClick={() => navigate('/results')}
              className="text-xs text-gray-400 hover:text-white flex items-center justify-center space-x-1 mx-auto"
            >
              <span>View full metrics matrix</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Column 3: Quick Action Panel */}
        <div className="terminal-card flex flex-col h-96 p-5 justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-widest mb-4">
              Bloomberg Command Box
            </h3>
            <p className="text-xs text-[#6b7280] leading-relaxed mb-6 font-mono">
              Quick launch and compilation of automated trading modules. Export rules to MT5 terminals using standard expert modules.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/builder')}
                className="w-full flex items-center justify-between p-3 rounded bg-gradient-to-r from-[#1f2937] to-[#111827] hover:to-[#1f2937] border border-[#1f2937] hover:border-[#00d4aa]/40 transition-all text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-[#00d4aa]/10 p-1 rounded text-[#00d4aa]">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-200 text-left">Compose New Strategy</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 hover:text-[#00d4aa]" />
              </button>

              <button
                onClick={() => navigate('/backtest')}
                className="w-full flex items-center justify-between p-3 rounded bg-gradient-to-r from-[#1f2937] to-[#111827] hover:to-[#1f2937] border border-[#1f2937] hover:border-[#00d4aa]/40 transition-all text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-400/10 p-1 rounded text-amber-500">
                    <Play className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-200 text-left">Trigger Backtest Engine</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 hover:text-amber-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 border-t border-[#1f2937] pt-4">
            <button
              onClick={handleImportEA}
              className="flex items-center justify-center space-x-2 btn-teal text-xs mono gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import EA</span>
            </button>
            <button
              onClick={handleExportMQL}
              className="flex items-center justify-center space-x-2 btn-outline text-xs mono gap-1 cursor-pointer"
            >
              <span>Export MQL5</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Bottom full width Equity curve chart */}
      <section className="terminal-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#00d4aa]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">
              Equity Curve Stream & Benchmark
            </h2>
          </div>
          <p className="text-[11px] text-[#6b7280] font-mono">
            Model: XAUUSD Trend Scalper — 150 Bar Continuous Feed
          </p>
        </div>
        
        <EquityCurve strategyName="XAUUSD Trend Scalper" />
      </section>
    </div>
  );
};
