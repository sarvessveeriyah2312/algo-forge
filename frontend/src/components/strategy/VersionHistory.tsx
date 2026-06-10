import React, { useState } from 'react';
import { 
  History, 
  Save, 
  RotateCcw, 
  Trash2, 
  Clock, 
  ChevronRight, 
  Layers, 
  Sparkles,
  Info 
} from 'lucide-react';
import { useStrategyStore } from '../../store/useStrategyStore';
import { useToastStore } from '../../store/useToastStore';
import { Strategy } from '../../types/strategy';

interface VersionHistoryProps {
  currentStrategy: Strategy | undefined;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ currentStrategy }) => {
  const { 
    versions, 
    saveStrategyVersion, 
    restoreStrategyVersion, 
    deleteStrategyVersion 
  } = useStrategyStore();

  const { addToast } = useToastStore();

  // Dialog state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);

  if (!currentStrategy) return null;

  // Filter versions specifically for the currently selected strategy
  const strategyVersions = versions.filter((v) => v.strategyId === currentStrategy.id);

  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionName.trim()) {
      addToast('Please specify a version label.', 'warning');
      return;
    }

    saveStrategyVersion(
      currentStrategy.id, 
      newVersionName.trim(), 
      newVersionDesc.trim() || 'Custom snapshot of current rules'
    );

    addToast(`Successfully created checkpoint: ${newVersionName.trim()}`, 'success');
    
    // Reset form
    setNewVersionName('');
    setNewVersionDesc('');
    setIsSaveModalOpen(false);
  };

  const handleRestoreVersion = (versionId: string, label: string) => {
    const success = restoreStrategyVersion(versionId);
    if (success) {
      addToast(`Strategy restored to "${label}". Workspace successfully reloaded.`, 'success');
    } else {
      addToast('An error occurred while restoring the checkpoint.', 'error');
    }
  };

  const handleDeleteVersion = (versionId: string, label: string) => {
    deleteStrategyVersion(versionId);
    addToast(`Deleted checkpoint "${label}".`, 'info');
    if (previewVersionId === versionId) {
      setPreviewVersionId(null);
    }
  };

  // Helper to format ISO date elegantly
  const formatTimestamp = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const selectedPreviewVersion = strategyVersions.find(v => v.id === previewVersionId);

  return (
    <div id="version_history_subsystem" className="bg-[#111827] border border-[#1f2937] p-5 rounded-md space-y-4">
      {/* Header block with inline Save button */}
      <div className="border-b border-[#1f2937] pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <History className="w-4.5 h-4.5 text-[#00d4aa]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
              4. Strategy Checkpoints & Version History
            </h3>
            <p className="text-[11px] text-[#6b7280] font-sans">
              Save stable states of your logical blocks, parameters, and indicators to safely revert or compare them.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            // Set auto default name for convenience
            const vCount = strategyVersions.length + 1;
            setNewVersionName(`v1.${vCount} — Checkpoint`);
            setIsSaveModalOpen(true);
          }}
          className="flex items-center space-x-1.5 bg-[#00d4aa] text-black hover:bg-opacity-90 px-3.5 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Current State</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left column: the Timeline list */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#6b7280]">
            <span>HISTORICAL VERSIONS ({strategyVersions.length})</span>
            <span>SORTED BY RECENT</span>
          </div>

          {strategyVersions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#374151] rounded text-center min-h-[180px]">
              <Clock className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-xs text-gray-400 font-mono">No Saved Versions for this Strategy.</p>
              <p className="text-[11px] text-gray-600 font-sans mt-1">
                Press "Save Current State" above to capture current indicator configurations.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {strategyVersions.map((version) => {
                const isPreviewing = previewVersionId === version.id;
                return (
                  <div 
                    key={version.id}
                    className={`p-3.5 rounded border transition-all ${
                      isPreviewing 
                        ? 'bg-[#1f2937]/80 border-[#00d4aa] shadow-[0_0_12px_rgba(0,212,170,0.1)]' 
                        : 'bg-[#111827] border-[#1f2937] hover:border-[#374151]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Name and time details */}
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] text-gray-500 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-600" />
                          <span>{formatTimestamp(version.timestamp)}</span>
                        </span>
                        <h4 className="text-xs font-bold text-gray-200 truncate">{version.versionName}</h4>
                        <p className="text-[11px] text-gray-400 font-sans line-clamp-2">
                          {version.description}
                        </p>
                      </div>

                      {/* Version action triggers */}
                      <div className="flex items-center space-x-1 shrink-0 ml-3">
                        <button
                          onClick={() => setPreviewVersionId(isPreviewing ? null : version.id)}
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                            isPreviewing
                              ? 'bg-[#00d4aa]/20 border-[#00d4aa]/30 text-[#00d4aa]'
                              : 'bg-[#1f2937] border-[#374151] text-gray-400 hover:text-white'
                          }`}
                          title="Preview full snapshot details"
                        >
                          {isPreviewing ? 'Close Details' : 'View Config'}
                        </button>
                        
                        <button
                          onClick={() => handleRestoreVersion(version.id, version.versionName)}
                          className="p-1 px-2 bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 border border-[#00d4aa]/20 text-[#00d4aa] rounded text-[10px] font-mono flex items-center space-x-1 cursor-pointer transition-colors"
                          title="Revert entire workspace configuration to this state"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Revert</span>
                        </button>

                        <button
                          onClick={() => handleDeleteVersion(version.id, version.versionName)}
                          className="p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Miniature parameter pills summary */}
                    <div className="mt-2.5 pt-2 border-t border-[#1f2937] flex flex-wrap gap-1.5 text-[9px] font-mono text-[#6b7280]">
                      <span className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">
                        {version.config.instrument}
                      </span>
                      <span className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">
                        {version.config.timeframe}
                      </span>
                      <span className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">
                        {version.config.direction}
                      </span>
                      <span className="bg-[#00d4aa]/5 text-emerald-400 px-1.5 py-0.5 rounded border border-[#00d4aa]/10">
                        {version.config.blocks.length} Indicator Blocks
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: active checkpoint preview details pane */}
        <div className="lg:col-span-5 bg-[#0a0e17] rounded border border-[#1f2937] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#6b7280] border-b border-[#1f2937] pb-2 mb-3">
              <Layers className="w-3.5 h-3.5 text-[#00d4aa]" />
              <span>CHECKPOINT PREVIEW PANEL</span>
            </div>

            {!selectedPreviewVersion ? (
              <div className="flex flex-col items-center justify-center p-6 text-center h-[280px]">
                <Info className="w-6 h-6 text-gray-600 mb-2" />
                <p className="text-xs text-gray-500 font-mono leading-relaxed">
                  Click <strong className="text-gray-300">"View Config"</strong> on any checkpoint to inspect saved block metrics and rules before reverting.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">{selectedPreviewVersion.versionName}</h4>
                  <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                    Saved on: {formatTimestamp(selectedPreviewVersion.timestamp)}
                  </p>
                </div>

                {/* Parameters specs list */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-[#111827] border border-[#1f2937] p-2 rounded">
                    <span className="text-gray-500 block">INSTRUMENT</span>
                    <span className="text-white font-bold">{selectedPreviewVersion.config.instrument}</span>
                  </div>
                  <div className="bg-[#111827] border border-[#1f2937] p-2 rounded">
                    <span className="text-gray-500 block">TIMEFRAME</span>
                    <span className="text-white font-bold">{selectedPreviewVersion.config.timeframe}</span>
                  </div>
                  <div className="bg-[#111827] border border-[#1f2937] p-2 rounded">
                    <span className="text-gray-500 block">RISK ALLOCATION</span>
                    <span className="text-[#00d4aa] font-bold">{selectedPreviewVersion.config.riskPerTrade}%</span>
                  </div>
                  <div className="bg-[#111827] border border-[#1f2937] p-2 rounded">
                    <span className="text-gray-500 block">DAILY DRAWDOWN LIMIT</span>
                    <span className="text-red-400 font-bold">{selectedPreviewVersion.config.maxDailyDrawdown}%</span>
                  </div>
                </div>

                {/* indicator blocks timeline info */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-[#6b7280] block">SAVED INDICATOR RULE BLOCKS ({selectedPreviewVersion.config.blocks.length})</span>
                  <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                    {selectedPreviewVersion.config.blocks.length === 0 ? (
                      <p className="text-[10px] text-gray-500 font-mono italic">No indicator blocks in this version.</p>
                    ) : (
                      selectedPreviewVersion.config.blocks.map((b) => (
                        <div key={b.id} className="bg-[#111827] border border-[#1f2937] p-2 rounded flex items-center justify-between">
                          <div className="min-w-0">
                            <span className="text-[8px] font-mono font-bold px-1 py-0.2 uppercase bg-[#00d4aa]/10 text-[#00d4aa] rounded mr-1.5">
                              {b.type}
                            </span>
                            <span className="text-[10px] text-gray-300 font-medium truncate inline-block max-w-[150px] align-middle">{b.name}</span>
                          </div>
                          
                          <span className="text-[9px] font-mono text-[#6b7280] max-w-[100px] truncate">
                            {Object.entries(b.parameters).map(([k,v]) => `${k}:${v}`).join(', ')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedPreviewVersion && (
            <div className="mt-4 pt-3 border-t border-[#1f2937]">
              <button
                onClick={() => handleRestoreVersion(selectedPreviewVersion.id, selectedPreviewVersion.versionName)}
                className="w-full py-2 bg-[#00d4aa] text-black hover:bg-opacity-90 rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert Workspace to this Checkpoint</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* modal block for saving */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-[#0a0e17]/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2937] rounded-md max-w-md w-full overflow-hidden shadow-2xl relative font-sans animate-fade-in">
            <div className="p-4 border-b border-[#1f2937] flex items-center space-x-2">
              <Sparkles className="w-4.5 h-4.5 text-[#00d4aa]" />
              <div>
                <h3 className="text-sm font-bold text-gray-100">Create Strategy Checkpoint</h3>
                <p className="text-[10px] font-mono text-gray-500">Record point-in-time coordinates and indicator configurations</p>
              </div>
            </div>

            <form onSubmit={handleSaveVersion} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Checkpoint Label</label>
                <input
                  type="text"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  placeholder="e.g. v1.3 - Reduced drawdown threshold"
                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs text-gray-100 font-sans focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Details / Change Notes</label>
                <textarea
                  value={newVersionDesc}
                  onChange={(e) => setNewVersionDesc(e.target.value)}
                  placeholder="Describe your reasoning or changes (e.g., added 200 EMA to avoid counter trend setups during NY open)"
                  className="w-full bg-[#1f2937] border border-[#374151] rounded px-3 py-2 text-xs text-gray-300 font-sans focus:border-[#00d4aa] focus:outline-none focus:ring-1 focus:ring-[#00d4aa] h-20 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="bg-[#1f2937] border border-[#374151] text-gray-400 hover:text-white px-4 py-2 rounded font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00d4aa] text-black hover:bg-opacity-95 px-5 py-2 rounded font-bold cursor-pointer transition-colors"
                >
                  Confirm Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
