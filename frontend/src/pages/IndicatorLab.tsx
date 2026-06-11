import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Layers, 
  TrendingUp, 
  Trash2, 
  Activity, 
  Grid, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Plus,
  Compass,
  ArrowRight
} from 'lucide-react';
import { MOCK_SIGNAL_PREVIEWS } from '../data/mockData';
import { IndicatorMetadata, SignalPreview } from '../types/indicator';
import { CorrelationMatrix } from '../components/charts/CorrelationMatrix';
import { useToastStore } from '../store/useToastStore';
import { useIndicatorStore } from '../store/useIndicatorStore';

export const IndicatorLab: React.FC = () => {
  const { addToast } = useToastStore();
  const { indicators: INDICATORS_METADATA, fetchIndicators } = useIndicatorStore();

  useEffect(() => { fetchIndicators(); }, []);

  // Active workspace indicators
  const [workspaceIndicators, setWorkspaceIndicators] = useState<IndicatorMetadata[]>([]);

  // Initialise workspace once indicators are available (handles both static + API data)
  useEffect(() => {
    if (workspaceIndicators.length > 0 || INDICATORS_METADATA.length === 0) return;
    setWorkspaceIndicators(
      ['ema', 'rsi', 'orderblock']
        .map(id => INDICATORS_METADATA.find(i => i.id === id)!)
        .filter(Boolean)
    );
  }, [INDICATORS_METADATA]);

  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom workspace parameters (indicatorId -> key -> value)
  const [workspaceParams, setWorkspaceParams] = useState<Record<string, Record<string, any>>>({
    ema: { period: 20, source: 'close' },
    rsi: { period: 14, overbought: 70, oversold: 30 },
    orderblock: { lookback: 200, showMitigated: false }
  });

  // Toggle Matrix Modal
  const [showMatrix, setShowMatrix] = useState(false);
  const [isSynthesizingSignals, setIsSynthesizingSignals] = useState(false);
  const [signalsList, setSignalsList] = useState<SignalPreview[]>(MOCK_SIGNAL_PREVIEWS);

  // Add indicator to workspace
  const handleAddToWorkspace = (indicator: IndicatorMetadata) => {
    if (workspaceIndicators.some((ind) => ind.id === indicator.id)) {
      addToast(`"${indicator.name}" is already active in your workspace.`, 'warning');
      return;
    }
    setWorkspaceIndicators([...workspaceIndicators, indicator]);
    
    // Initialize default parameters
    const defaultParams: Record<string, any> = {};
    indicator.parameters.forEach((p) => {
      defaultParams[p.key] = p.default;
    });
    setWorkspaceParams({
      ...workspaceParams,
      [indicator.id]: defaultParams
    });

    addToast(`Added "${indicator.name}" to workspace.`, 'success');
  };

  // Remove indicator from workspace
  const handleRemoveFromWorkspace = (id: string, name: string) => {
    setWorkspaceIndicators(workspaceIndicators.filter((ind) => ind.id !== id));
    addToast(`Removed "${name}" from workspace.`, 'info');
  };

  // Update parameters inside workspace parameters maps
  const handleParamChange = (indicatorId: string, paramKey: string, value: any) => {
    setWorkspaceParams({
      ...workspaceParams,
      [indicatorId]: {
        ...(workspaceParams[indicatorId] || {}),
        [paramKey]: value
      }
    });
  };

  // Simulate Synthesizing Indicator Signals
  const handleSynthesizeSignals = () => {
    setIsSynthesizingSignals(true);
    addToast('Synthesizing technical arrays across active overlays...', 'info');

    setTimeout(() => {
      // Scramble signal confidence prices a bit for rich interaction
      const recalculatedSignals = signalsList.map((sig) => {
        const randomShift = Math.random() < 0.5 ? 'LONG' as const : 'SHORT' as const;
        return {
          ...sig,
          confidence: parseFloat((55 + Math.random() * 40).toFixed(1)),
          price: parseFloat((sig.price * (1 + (Math.random() * 0.002 - 0.001))).toFixed(sig.pair === 'XAUUSD' ? 2 : 4)),
          signal: Math.random() < 0.75 ? sig.signal : randomShift
        };
      });

      setSignalsList(recalculatedSignals);
      setIsSynthesizingSignals(false);
      addToast('Realigned indicator signals and confidence scales!', 'success');
    }, 1200);
  };

  const categories = ['All', 'Trend', 'Momentum', 'Volatility', 'Volume', 'ICT Concepts'];

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-r from-[#111827] to-[#1f2937]/50 border border-[#1f2937] p-5 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-[#00d4aa]">
            Indicator Synthesis Lab
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Combine multiple oscillators, overlays and Smart Money ICT blocks to calculate real-time confluence weights.
          </p>
        </div>

        <div className="flex space-x-3 shrink-0">
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded text-xs font-mono border transition-all cursor-pointer ${
              showMatrix
                ? 'bg-[#00d4aa] text-black font-semibold border-transparent'
                : 'bg-[#1f2937]/50 text-gray-400 border-[#374151] hover:text-white hover:border-gray-500'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{showMatrix ? 'Close Correlation Matrix' : 'Toggle 5x5 Correlation Matrix'}</span>
          </button>

          <button
            onClick={handleSynthesizeSignals}
            disabled={isSynthesizingSignals}
            className="flex items-center space-x-1.5 bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 border border-[#00d4aa]/30 px-3.5 py-1.5 rounded text-xs font-mono text-[#00d4aa] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSynthesizingSignals ? (
              <span className="w-3.5 h-3.5 border-2 border-t-transparent border-[#00d4aa] rounded-full animate-spin"></span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-[#00d4aa]/20" />
            )}
            <span>Synthesize Signals</span>
          </button>
        </div>
      </section>

      {/* Correlation Matrix View */}
      {showMatrix && (
        <div className="border border-[#1f2937] bg-[#111827] p-5 rounded-md">
          <CorrelationMatrix />
        </div>
      )}

      {/* 2. Main Lab workstation layout */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Library panel (Columns: 4) */}
        <div className="xl:col-span-4 bg-[#111827] border border-[#1f2937] p-4 rounded-md flex flex-col h-[550px] overflow-hidden justify-between">
          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-mono font-bold uppercase text-gray-300 mb-4 tracking-wider flex items-center space-x-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Indicator Library</span>
            </h3>

            {/* Inputs controls */}
            <div className="space-y-2.5 mb-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search 20+ indicators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded pl-9 pr-4 py-2 text-xs text-gray-300 font-sans focus:border-[#00d4aa] focus:outline-none"
                />
              </div>

              {/* Categorization chips */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono border tracking-wider uppercase transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/30'
                        : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of elements */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1f2937] pr-1">
              {INDICATORS_METADATA.filter((ind) => {
                const matchesSearch = ind.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      ind.description.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = selectedCategory === 'All' || ind.category === selectedCategory;
                return matchesSearch && matchesCategory;
              }).map((indicator) => (
                <div key={indicator.id} className="py-2.5 px-1.5 flex items-start justify-between space-x-2 hover:bg-[#1f2937]/30 transition-all">
                  <div className="space-y-1 min-w-0 flex-1 pr-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-200 truncate">{indicator.name}</span>
                      <span className="text-[8px] font-mono bg-gray-800 text-gray-400 px-1 rounded uppercase">
                        {indicator.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal truncate">
                      {indicator.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToWorkspace(indicator)}
                    className="p-1 px-2 text-[10px] bg-[#1f2937] hover:bg-[#00d4aa] text-gray-300 hover:text-black border border-[#374151] hover:border-transparent rounded font-mono font-bold transition-all cursor-pointer flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] font-mono text-[#6b7280] border-t border-[#1f2937] pt-3.5 mt-2 shrink-0">
            *Add oscillators like RSI or ICT blocks to customize. We calculate intersection confluences immediately.
          </div>
        </div>

        {/* Center workspace config cards (Columns: 5) */}
        <div className="xl:col-span-5 bg-[#111827] border border-[#1f2937] p-4 rounded-md flex flex-col h-[550px] overflow-hidden justify-between">
          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-mono font-bold uppercase text-gray-300 mb-4 tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Active Confluence Workspace ({workspaceIndicators.length})</span>
              </span>
              <span className="text-[9px] font-mono text-gray-500 uppercase">Interactive matrix</span>
            </h3>

            {/* List of working indicator parameters controls */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {workspaceIndicators.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-800">
                  <Activity className="w-8 h-8 text-gray-700 mb-2 animate-pulse" />
                  <p className="text-xs text-gray-400 font-mono">Workspace Canvas is empty.</p>
                  <p className="text-[11px] text-gray-600 font-sans mt-1">Select libraries on the left and insert overlay triggers.</p>
                </div>
              ) : (
                workspaceIndicators.map((indicator) => {
                  const params = workspaceParams[indicator.id] || {};
                  return (
                    <div 
                      key={indicator.id}
                      className="bg-[#1f2937]/50 border border-[#1f2937] hover:border-[#374151] rounded p-3 space-y-3 relative group"
                    >
                      {/* Name of Card with Delete Option */}
                      <div className="flex items-center justify-between border-b border-[#1f2937] pb-1.5">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono text-[#00d4aa] uppercase tracking-wider block font-bold">
                            {indicator.category} OVERLAY
                          </span>
                          <h4 className="text-xs font-bold text-gray-200">{indicator.name}</h4>
                        </div>
                        <button
                          onClick={() => handleRemoveFromWorkspace(indicator.id, indicator.name)}
                          className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Config parameters form */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                        {indicator.parameters.length === 0 ? (
                          <span className="text-[10px] text-gray-500 italic py-1">Instant continuous feed (No params needed)</span>
                        ) : (
                          indicator.parameters.map((param) => (
                            <div key={param.key} className="flex flex-col space-y-1">
                              <span className="text-[10px] text-gray-500">{param.name}</span>
                              
                              {param.type === 'number' && (
                                <input
                                  type="number"
                                  value={params[param.key] ?? param.default}
                                  onChange={(e) => handleParamChange(indicator.id, param.key, parseFloat(e.target.value) || 0)}
                                  className="bg-[#111827] border border-[#1f2937] rounded px-2.5 py-1 text-xs text-[#00d4aa] font-bold focus:border-[#00d4aa] focus:outline-none"
                                />
                              )}

                              {param.type === 'select' && (
                                <select
                                  value={params[param.key] ?? param.default}
                                  onChange={(e) => handleParamChange(indicator.id, param.key, e.target.value)}
                                  className="bg-[#111827] border border-[#1f2937] rounded px-1.5 py-1 text-xs text-[#00d4aa] font-bold focus:border-[#00d4aa] focus:outline-none"
                                >
                                  {param.options?.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              )}

                              {param.type === 'boolean' && (
                                <label className="flex items-center space-x-2 py-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!(params[param.key] ?? param.default)}
                                    onChange={(e) => handleParamChange(indicator.id, param.key, e.target.checked)}
                                    className="rounded border-[#374151] text-[#00d4aa] bg-[#0a0e17] w-3.5 h-3.5"
                                  />
                                  <span className="text-[11px] text-gray-400">Toggle</span>
                                </label>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-[#1f2937]/30 border border-[#1f2937] p-3 rounded flex items-center justify-between shrink-0 mt-3 pt-2">
            <span className="text-[10px] text-gray-400 font-mono">Confluence overlap model:</span>
            <span className="text-xs font-mono font-bold text-[#00d4aa]">
              {workspaceIndicators.length > 0 ? `${(70 + workspaceIndicators.length * 5)}% Aggregated Confluence` : '0% Idle'}
            </span>
          </div>
        </div>

        {/* Right Preview signal list (Columns: 4) */}
        <div className="xl:col-span-4 bg-[#111827] border border-[#1f2937] p-4 rounded-md flex flex-col h-[550px] overflow-hidden justify-between">
          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-mono font-bold uppercase text-gray-300 mb-4 tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#00d4aa]" />
              <span>Confluence Signal Preview</span>
            </h3>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              {isSynthesizingSignals ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <span className="w-8 h-8 border-3 border-t-transparent border-[#00d4aa] rounded-full animate-spin"></span>
                  <p className="text-xs text-gray-400 font-mono mt-3">Recalculating signal array...</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0a0e17] text-[9px] font-mono text-[#6b7280] border-b border-[#1f2937]">
                      <th className="py-2 px-1">Clock</th>
                      <th className="py-2 px-1">Pair</th>
                      <th className="py-2 px-1">Signal</th>
                      <th className="py-2 px-1 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937] text-xs">
                    {signalsList.map((sig) => (
                      <tr key={sig.id} className="hover:bg-[#1f2937]/40 transition-colors">
                        <td className="py-2.5 px-1 font-mono text-[10px] text-gray-500">
                          {sig.date}
                        </td>
                        <td className="py-2.5 px-1 font-bold text-gray-300">
                          {sig.pair}
                        </td>
                        <td className="py-2.5 px-1">
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            sig.signal === 'LONG'
                              ? 'bg-[#00d4aa]/15 text-[#00d4aa]'
                              : 'bg-[#ef4444]/15 text-[#ef4444]'
                          }`}>
                            {sig.signal}
                          </span>
                        </td>
                        <td className="py-2.5 px-1 text-right font-mono font-bold text-gray-200">
                          {sig.confidence}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <p className="text-[10px] font-mono text-[#6b7280] leading-relaxed border-t border-[#1f2937] pt-3 mt-2 shrink-0">
            *Signals update in true sequence relative to live quotes data feeds. Refresh with "Synthesize Signals" clock action.
          </p>
        </div>

      </section>
    </div>
  );
};
