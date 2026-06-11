import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trash2, ArrowUp, ArrowDown, ChevronRight, Settings,
  HelpCircle, X, ArrowLeft, Save, Loader2,
} from 'lucide-react';
import { useStrategyStore } from '../store/useStrategyStore';
import { useToastStore } from '../store/useToastStore';
import { Strategy, StrategyBlock, Instrument, Timeframe, TradeDirection } from '../types/strategy';
import { getBlockDescription } from '../data/mockData';
import { useIndicatorStore } from '../store/useIndicatorStore';
import { VersionHistory } from '../components/strategy/VersionHistory';

export const StrategyBuilder: React.FC = () => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const navigate = useNavigate();

  const {
    strategies,
    selectedStrategyId,
    isSaving,
    updateStrategy,
    deleteStrategy,
    addBlockToStrategy,
    removeBlockFromStrategy,
    reorderBlocks,
    saveStrategyToBackend,
  } = useStrategyStore();

  const { addToast } = useToastStore();
  const { indicators: INDICATORS_METADATA, fetchIndicators } = useIndicatorStore();

  useEffect(() => { fetchIndicators(); }, []);

  // Find strategy by URL param, fall back to selected (e.g. direct /builder access)
  const currentStrategy = strategies.find(s => s.id === (strategyId ?? selectedStrategyId));

  // After saveStrategyToBackend replaces local ID with UUID, sync URL
  useEffect(() => {
    if (!strategyId) return;
    const stillExists = strategies.some(s => s.id === strategyId);
    if (!stillExists && selectedStrategyId && selectedStrategyId !== strategyId) {
      navigate(`/strategies/${selectedStrategyId}`, { replace: true });
    }
  }, [strategies, selectedStrategyId]);

  // ── Block modal state ────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState<'entry' | 'exit' | 'filter' | 'risk'>('entry');
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>('');
  const [blockParameters, setBlockParameters]     = useState<Record<string, any>>({});
  const [indicatorSearch, setIndicatorSearch]     = useState('');
  const [indicatorCategory, setIndicatorCategory] = useState<string>('All');

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleStrategyChange = (key: keyof Strategy, value: any) => {
    if (!currentStrategy) return;
    updateStrategy(currentStrategy.id, { [key]: value });
  };

  const handleSessionsChange = (key: 'london' | 'newYork' | 'asia' | 'overlap', checked: boolean) => {
    if (!currentStrategy) return;
    updateStrategy(currentStrategy.id, {
      sessions: { ...currentStrategy.sessions, [key]: checked },
    });
  };

  const handleSave = async () => {
    if (!currentStrategy) return;
    await saveStrategyToBackend(currentStrategy.id);
    addToast('Strategy saved.', 'success');
  };

  const handleDelete = async () => {
    if (!currentStrategy) return;
    const name = currentStrategy.name;
    await deleteStrategy(currentStrategy.id);
    addToast(`Strategy "${name}" deleted.`, 'info');
    navigate('/strategies');
  };

  const openAddBlockModal = (type: 'entry' | 'exit' | 'filter' | 'risk') => {
    setSelectedBlockType(type);
    const def = INDICATORS_METADATA[0];
    setSelectedIndicatorId(def.id);
    const params: Record<string, any> = {};
    def.parameters.forEach(p => { params[p.key] = p.default; });
    setBlockParameters(params);
    setIsModalOpen(true);
  };

  const handleIndicatorChangeInModal = (id: string) => {
    setSelectedIndicatorId(id);
    const ind = INDICATORS_METADATA.find(i => i.id === id);
    if (ind) {
      const params: Record<string, any> = {};
      ind.parameters.forEach(p => { params[p.key] = p.default; });
      setBlockParameters(params);
    }
  };

  const handleAddBlockConfirm = () => {
    const ind = INDICATORS_METADATA.find(i => i.id === selectedIndicatorId);
    if (!ind || !currentStrategy) return;
    const block: StrategyBlock = {
      id: `block-${Date.now()}`,
      type: selectedBlockType,
      indicatorId: selectedIndicatorId,
      name: ind.name,
      parameters: { ...blockParameters },
    };
    addBlockToStrategy(currentStrategy.id, block);
    setIsModalOpen(false);
    addToast(`Added ${selectedBlockType.toUpperCase()} block: ${ind.name}`, 'success');
  };

  const compileStrategyRules = (): string[] => {
    if (!currentStrategy || currentStrategy.blocks.length === 0) {
      return ['No rules configured. Add entries/exits to begin visual compiling.'];
    }
    const out: string[] = [];
    out.push(`Execute trades: [${currentStrategy.direction.toUpperCase()}] orders only.`);
    const activeSessions = Object.entries(currentStrategy.sessions)
      .filter(([, active]) => active)
      .map(([name]) => name.toUpperCase());
    if (activeSessions.length > 0)
      out.push(`Execution window constrained to: ${activeSessions.join(', ')} session clock.`);
    const entries = currentStrategy.blocks.filter(b => b.type === 'entry');
    const filters = currentStrategy.blocks.filter(b => b.type === 'filter');
    const exits   = currentStrategy.blocks.filter(b => b.type === 'exit');
    if (entries.length > 0)
      out.push(`[ENTRY SIGNAL]: Open trade when ${entries.map(e => getBlockDescription(e).replace('Enter when ', '')).join(' AND ')}.`);
    if (filters.length > 0)
      out.push(`[FILTER MATCH]: Validate setups by verifying if ${filters.map(f => getBlockDescription(f).replace('Filter when ', '')).join(' AND ')}.`);
    if (exits.length > 0)
      out.push(`[CLOSE POSITION]: Exit position when ${exits.map(ex => getBlockDescription(ex).replace('Exit when ', '')).join(' OR ')}.`);
    out.push(`[RISK PROTOCOL]: Target size allocation is ${currentStrategy.riskPerTrade}% standard account balance. Max safety daily drawdown capped strictly at ${currentStrategy.maxDailyDrawdown}% threshold.`);
    return out;
  };

  // ── Not-found state ───────────────────────────────────────────────────────────

  if (!currentStrategy) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/strategies')}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO STRATEGIES
        </button>
        <div className="terminal-card p-12 flex items-center justify-center">
          <p className="text-xs font-mono text-gray-500 tracking-widest">STRATEGY NOT FOUND</p>
        </div>
      </div>
    );
  }

  const compiledRules = compileStrategyRules();

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate('/strategies')}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          BACK TO STRATEGIES
        </button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-mono font-bold tracking-widest text-white uppercase">
              {currentStrategy.name}
            </h1>
            <p className="text-xs font-mono text-gray-500 mt-0.5">
              {currentStrategy.instrument} · {currentStrategy.timeframe} · {currentStrategy.direction}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-black bg-[#00d4aa] hover:bg-[#00bfa0] rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              SAVE
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-red-400 border border-red-400/30 hover:bg-red-400/10 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              DELETE
            </button>
          </div>
        </div>
      </div>

      {/* Main 3 Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">

        {/* Panel 1: Configuration */}
        <div className="xl:col-span-4 bg-[#111827] border border-[#1f2937] p-5 rounded-md flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-[#1f2937] pb-3 mb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                1. Symbol & Parameter Set
              </h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Strategy Name</label>
              <input
                type="text"
                value={currentStrategy.name}
                onChange={e => handleStrategyChange('name', e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs text-gray-100 font-sans focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]"
                placeholder="Give strategy a name..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Instrument Tag</label>
                <select
                  value={currentStrategy.instrument}
                  onChange={e => handleStrategyChange('instrument', e.target.value as Instrument)}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs text-gray-100 font-mono focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]"
                >
                  {['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Timeframe Feed</label>
                <select
                  value={currentStrategy.timeframe}
                  onChange={e => handleStrategyChange('timeframe', e.target.value as Timeframe)}
                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs text-gray-100 font-mono focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]"
                >
                  {['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Signal Trade Direction</label>
              <div className="grid grid-cols-3 gap-1 bg-[#1f2937] p-1 rounded border border-[#374151]">
                {(['Long Only', 'Short Only', 'Both'] as TradeDirection[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleStrategyChange('direction', opt)}
                    className={`py-1.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer text-center ${
                      currentStrategy.direction === opt
                        ? 'bg-[#00d4aa] text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {opt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide">Session Exec Filters</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { key: 'london',  label: 'London Open'   },
                  { key: 'newYork', label: 'New York Open' },
                  { key: 'asia',    label: 'Asia Trade'    },
                  { key: 'overlap', label: 'NY/LD Overlap' },
                ].map(s => (
                  <label
                    key={s.key}
                    className="flex items-center space-x-2.5 bg-[#1f2937] p-2 rounded border border-[#1f2937] hover:border-[#374151] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!currentStrategy.sessions?.[s.key as keyof typeof currentStrategy.sessions]}
                      onChange={e => handleSessionsChange(s.key as any, e.target.checked)}
                      className="rounded border-[#374151] text-[#00d4aa] focus:ring-0 bg-[#0a0e17] w-3.5 h-3.5"
                    />
                    <span className="text-gray-300 font-medium">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide flex items-center space-x-1">
                  <span>Risk Per Trade</span>
                  <HelpCircle className="w-3 h-3 text-gray-500" />
                </label>
                <div className="relative">
                  <input
                    type="number" step="0.1" min="0.1" max="10"
                    value={currentStrategy.riskPerTrade}
                    onChange={e => handleStrategyChange('riskPerTrade', parseFloat(e.target.value) || 1.0)}
                    className="w-full bg-[#1f2937] border border-[#374151] rounded pl-3 pr-8 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-mono">%</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wide flex items-center space-x-1">
                  <span>Max Drawdown</span>
                  <HelpCircle className="w-3 h-3 text-gray-500" />
                </label>
                <div className="relative">
                  <input
                    type="number" step="0.5" min="1.0" max="20"
                    value={currentStrategy.maxDailyDrawdown}
                    onChange={e => handleStrategyChange('maxDailyDrawdown', parseFloat(e.target.value) || 5.0)}
                    className="w-full bg-[#1f2937] border border-[#374151] rounded pl-3 pr-8 py-2 text-xs font-mono text-gray-100 focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-mono">%</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-mono text-[#6b7280] leading-relaxed mt-6 border-t border-[#1f2937] pt-4">
            *Parameters bound instantly. Click blocks on the Canvas to configure technical indicators.
          </p>
        </div>

        {/* Panel 2: Block Canvas */}
        <div className="xl:col-span-5 bg-[#111827] border border-[#1f2937] p-5 rounded-md flex flex-col justify-between">
          <div>
            <div className="border-b border-[#1f2937] pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                2. Block Configuration Canvas
              </h3>
              <span className="text-[10px] font-mono text-[#00d4aa] bg-[#00d4aa]/10 border border-[#00d4aa]/20 px-2 py-0.5 rounded">
                MVP ORDER MODULE
              </span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {currentStrategy.blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#374151] rounded text-center">
                  <HelpCircle className="w-8 h-8 text-gray-600 mb-2" />
                  <p className="text-xs text-gray-400 font-mono">No indicator blocks in this structure.</p>
                  <p className="text-[11px] text-gray-600 font-sans mt-1">Add entry blocks, exit triggers, and filters.</p>
                </div>
              ) : (
                currentStrategy.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="bg-[#1f2937] border border-[#374151] rounded p-3 flex flex-col justify-between hover:border-gray-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                            block.type === 'entry'  ? 'bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/20' :
                            block.type === 'exit'   ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            block.type === 'filter' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                      'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {block.type.toUpperCase()}
                          </span>
                          <span className="text-[11px] font-bold text-gray-200 truncate">{block.name}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-sans mt-1 italic">
                          "{getBlockDescription(block)}"
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0 ml-2">
                        <button
                          onClick={() => reorderBlocks(currentStrategy.id, block.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-[#374151] text-gray-400 hover:text-white rounded disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => reorderBlocks(currentStrategy.id, block.id, 'down')}
                          disabled={index === currentStrategy.blocks.length - 1}
                          className="p-1 hover:bg-[#374151] text-gray-400 hover:text-white rounded disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { removeBlockFromStrategy(currentStrategy.id, block.id); addToast(`Removed block: ${block.name}`, 'info'); }}
                          className="p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#374151] flex flex-wrap gap-2 text-[10px] font-mono text-[#6b7280]">
                      {Object.entries(block.parameters).map(([key, val]) => (
                        <span key={key} className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">
                          {key}: <strong className="text-[#00d4aa]">{String(val)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1f2937] space-y-2">
            <span className="text-[10px] font-mono text-[#6b7280] block">INSERT CANONICAL RULES</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {([
                { type: 'entry'  as const, color: 'hover:border-[#00d4aa] hover:text-[#00d4aa]' },
                { type: 'exit'   as const, color: 'hover:border-red-400 hover:text-red-400' },
                { type: 'filter' as const, color: 'hover:border-amber-500 hover:text-amber-500' },
                { type: 'risk'   as const, color: 'hover:border-purple-400 hover:text-purple-400' },
              ]).map(btn => (
                <button
                  key={btn.type}
                  onClick={() => openAddBlockModal(btn.type)}
                  className={`border border-[#374151] p-2 rounded text-center text-[10px] font-mono uppercase bg-[#1f2937]/30 transition-all font-bold cursor-pointer ${btn.color}`}
                >
                  + {btn.type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: Compiled Plain English */}
        <div className="xl:col-span-3 bg-[#111827] border border-[#1f2937] p-5 rounded-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[#1f2937] pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                3. Compiled Plain English
              </h3>
            </div>

            <div className="bg-[#0a0e17] rounded p-4 border border-[#1f2937] min-h-[350px] flex flex-col justify-between">
              <div className="space-y-4 text-xs font-mono leading-relaxed text-gray-300">
                {compiledRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5">
                    <ChevronRight className="w-3.5 h-3.5 text-[#00d4aa] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#1f2937]">
                <div className="flex items-center space-x-1.5 text-[10px] text-[#6b7280]">
                  <Settings className="w-3 h-3 text-[#00d4aa]" />
                  <span>MQL5 Target: MetaTrader 5 Expert</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <button
              onClick={() => addToast('Connect terminal integration in Settings to parse local MQL5 triggers.', 'warning')}
              className="w-full py-2.5 bg-[#0a0e17] hover:bg-[#1f2937] text-gray-400 hover:text-white border border-[#1f2937] hover:border-gray-600 rounded text-xs font-mono tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Export as MQL5 Source</span>
            </button>
            <span className="text-[10px] text-[#6b7280] block text-center font-sans">
              "Connect backend to enable direct output Compile."
            </span>
          </div>
        </div>

      </div>

      {/* Version History */}
      <VersionHistory currentStrategy={currentStrategy} />

      {/* Add Block Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0a0e17]/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-[#111827] border border-[#1f2937] rounded-md shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]">

            <div className="p-4 border-b border-[#1f2937] flex items-center justify-between bg-[#111827]">
              <div>
                <span className="text-[10px] font-mono text-[#00d4aa] uppercase tracking-widest block font-bold">
                  Inserting Block: [{selectedBlockType.toUpperCase()}]
                </span>
                <h3 className="text-sm font-sans font-bold text-gray-100">Configure Parameter Array</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#1f2937] transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#1f2937]">
              {/* Indicator list */}
              <div className="md:col-span-2 p-3 bg-[#0a0e17]/50 max-h-[350px] overflow-y-auto">
                <input
                  type="text"
                  value={indicatorSearch}
                  onChange={e => setIndicatorSearch(e.target.value)}
                  placeholder="Filter search..."
                  className="w-full bg-[#111827] border border-[#1f2937] rounded p-1.5 text-xs text-gray-200 focus:border-[#00d4aa] focus:outline-none mb-3 font-mono"
                />
                <div className="flex flex-wrap gap-1 mb-3">
                  {['All', 'Trend', 'Momentum', 'Volatility', 'Volume', 'ICT Concepts'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setIndicatorCategory(cat)}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all cursor-pointer ${
                        indicatorCategory === cat
                          ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/30'
                          : 'bg-transparent text-gray-500 border-[#1f2937] hover:text-gray-300'
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  {INDICATORS_METADATA.filter(ind => {
                    const matchSearch = ind.name.toLowerCase().includes(indicatorSearch.toLowerCase());
                    const matchCat = indicatorCategory === 'All' || ind.category === indicatorCategory;
                    return matchSearch && matchCat;
                  }).map(ind => (
                    <button
                      key={ind.id}
                      onClick={() => handleIndicatorChangeInModal(ind.id)}
                      className={`w-full text-left p-2 rounded text-xs font-mono transition-all block max-w-full truncate ${
                        selectedIndicatorId === ind.id
                          ? 'bg-[#00d4aa] text-black font-semibold'
                          : 'text-gray-400 hover:bg-[#1f2937] hover:text-white'
                      }`}
                    >
                      {ind.name.replace(' (EMA)', '').replace(' (SMA)', '').replace(' (RSI)', '').replace(' (VWAP)', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              <div className="md:col-span-3 p-5 flex flex-col justify-between max-h-[350px] overflow-y-auto bg-[#111827]">
                {(() => {
                  const ind = INDICATORS_METADATA.find(i => i.id === selectedIndicatorId);
                  if (!ind) return null;
                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#00d4aa]">{ind.category} Indicator</span>
                        <h4 className="text-xs font-bold text-gray-200">{ind.name}</h4>
                        <p className="text-[11px] text-gray-500 leading-normal">{ind.description}</p>
                      </div>
                      <div className="space-y-3.5 border-t border-[#1f2937] pt-4">
                        {ind.parameters.length === 0 ? (
                          <p className="text-[10px] font-mono text-gray-500 italic">This indicator requires zero additional parameters.</p>
                        ) : ind.parameters.map(param => (
                          <div key={param.key} className="grid grid-cols-12 gap-3 items-center">
                            <label className="col-span-5 text-xs font-mono text-gray-400">{param.name}</label>
                            <div className="col-span-7">
                              {param.type === 'number' && (
                                <input
                                  type="number"
                                  value={blockParameters[param.key] ?? param.default}
                                  onChange={e => setBlockParameters({ ...blockParameters, [param.key]: parseFloat(e.target.value) || 0 })}
                                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-2.5 py-1 text-xs text-gray-200 font-mono focus:border-[#00d4aa] focus:outline-none"
                                />
                              )}
                              {param.type === 'select' && (
                                <select
                                  value={blockParameters[param.key] ?? param.default}
                                  onChange={e => setBlockParameters({ ...blockParameters, [param.key]: e.target.value })}
                                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-2 py-1 text-xs text-gray-200 font-mono focus:border-[#00d4aa] focus:outline-none"
                                >
                                  {param.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              )}
                              {param.type === 'boolean' && (
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!(blockParameters[param.key] ?? param.default)}
                                    onChange={e => setBlockParameters({ ...blockParameters, [param.key]: e.target.checked })}
                                    className="rounded border-[#374151] text-[#00d4aa] focus:ring-0 bg-[#0a0e17] w-3.5 h-3.5"
                                  />
                                  <span className="text-xs text-gray-400 font-mono">Enable</span>
                                </label>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-4 border-t border-[#1f2937] bg-[#0a0e17]/50 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-[#1f2937] border border-[#374151] text-gray-400 hover:text-white px-4 py-2 rounded text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBlockConfirm}
                className="bg-[#00d4aa] text-black hover:bg-opacity-90 px-5 py-2 rounded text-xs font-semibold cursor-pointer transition-colors"
              >
                Insert Block
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
