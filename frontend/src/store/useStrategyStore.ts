import { create } from 'zustand';
import { Strategy, StrategyBlock, StrategyVersion } from '../types/strategy';
import { INITIAL_STRATEGIES } from '../data/mockData';
import { api, ApiError } from '../lib/api';
import { strategyFromBackend, strategyToBackend } from '../lib/mappers';

// ─── Version helpers (unchanged) ──────────────────────────────────────────────

const INITIAL_VERSIONS: StrategyVersion[] = [];

const loadInitialVersions = (): StrategyVersion[] => {
  const saved = localStorage.getItem('algoforge_strategy_versions');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return INITIAL_VERSIONS;
};

const saveVersionsToStorage = (versions: StrategyVersion[]) => {
  localStorage.setItem('algoforge_strategy_versions', JSON.stringify(versions));
};

// ─── State ────────────────────────────────────────────────────────────────────

interface StrategyState {
  strategies: Strategy[];
  selectedStrategyId: string;
  versions: StrategyVersion[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Remote sync
  fetchStrategies: () => Promise<void>;
  saveStrategyToBackend: (id: string) => Promise<void>;

  // Local + synced mutations
  addStrategy: (strategy: Strategy) => Promise<void>;
  updateStrategy: (id: string, updated: Partial<Strategy>) => void;
  deleteStrategy: (id: string) => Promise<void>;
  setSelectedStrategyId: (id: string) => void;

  // Block mutations (local only)
  addBlockToStrategy: (strategyId: string, block: StrategyBlock) => void;
  removeBlockFromStrategy: (strategyId: string, blockId: string) => void;
  updateBlockInStrategy: (strategyId: string, blockId: string, parameters: Record<string, any>) => void;
  reorderBlocks: (strategyId: string, blockId: string, direction: 'up' | 'down') => void;
  toggleFavorite: (id: string) => void;

  // Version management (local only)
  saveStrategyVersion: (strategyId: string, versionName: string, description: string) => void;
  restoreStrategyVersion: (versionId: string) => boolean;
  deleteStrategyVersion: (versionId: string) => void;
}

export const useStrategyStore = create<StrategyState>((set, get) => ({
  strategies: INITIAL_STRATEGIES,
  selectedStrategyId: INITIAL_STRATEGIES[0]?.id || '',
  versions: loadInitialVersions(),
  isLoading: false,
  isSaving: false,
  error: null,

  // ─── Remote sync ────────────────────────────────────────────────────────────

  fetchStrategies: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<{ items: any[]; total: number }>('/strategies?page_size=100');
      const strategies = data.items.map(strategyFromBackend);
      set({
        strategies,
        selectedStrategyId: strategies[0]?.id || '',
        isLoading: false,
      });
    } catch (err) {
      // Fall back to mock data if API unavailable
      const msg = err instanceof ApiError ? err.message : 'Could not load strategies';
      set({ isLoading: false, error: msg });
    }
  },

  saveStrategyToBackend: async (id) => {
    const strategy = get().strategies.find(s => s.id === id);
    if (!strategy) return;
    set({ isSaving: true });
    try {
      const payload = strategyToBackend(strategy);
      // Determine if this is a UUID (backend-created) or a local mock ID
      const isUUID = /^[0-9a-f-]{36}$/.test(id);
      if (isUUID) {
        await api.put(`/strategies/${id}`, payload);
      } else {
        const created = await api.post<any>('/strategies', payload);
        // Replace local ID with backend UUID
        set(state => ({
          strategies: state.strategies.map(s =>
            s.id === id ? { ...s, id: created.id } : s
          ),
          selectedStrategyId: state.selectedStrategyId === id ? created.id : state.selectedStrategyId,
        }));
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save strategy';
      set({ error: msg });
    } finally {
      set({ isSaving: false });
    }
  },

  // ─── Mutations ──────────────────────────────────────────────────────────────

  addStrategy: async (strategy) => {
    // Optimistic local add
    set(state => ({ strategies: [strategy, ...state.strategies], selectedStrategyId: strategy.id }));
    try {
      const payload = strategyToBackend(strategy);
      const created = await api.post<any>('/strategies', payload);
      set(state => ({
        strategies: state.strategies.map(s => s.id === strategy.id ? { ...s, id: created.id } : s),
        selectedStrategyId: state.selectedStrategyId === strategy.id ? created.id : state.selectedStrategyId,
      }));
    } catch {}
  },

  updateStrategy: (id, updated) => set(state => ({
    strategies: state.strategies.map(s => s.id === id ? { ...s, ...updated } : s),
  })),

  deleteStrategy: async (id) => {
    set(state => {
      const next = state.strategies.filter(s => s.id !== id);
      return {
        strategies: next,
        selectedStrategyId: state.selectedStrategyId === id ? (next[0]?.id || '') : state.selectedStrategyId,
      };
    });
    try {
      const isUUID = /^[0-9a-f-]{36}$/.test(id);
      if (isUUID) await api.del(`/strategies/${id}`);
    } catch {}
  },

  setSelectedStrategyId: (id) => set({ selectedStrategyId: id }),

  addBlockToStrategy: (strategyId, block) => set(state => ({
    strategies: state.strategies.map(s =>
      s.id !== strategyId ? s : { ...s, blocks: [...s.blocks, block] }
    ),
  })),

  removeBlockFromStrategy: (strategyId, blockId) => set(state => ({
    strategies: state.strategies.map(s =>
      s.id !== strategyId ? s : { ...s, blocks: s.blocks.filter(b => b.id !== blockId) }
    ),
  })),

  updateBlockInStrategy: (strategyId, blockId, parameters) => set(state => ({
    strategies: state.strategies.map(s =>
      s.id !== strategyId ? s : {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, parameters: { ...b.parameters, ...parameters } } : b),
      }
    ),
  })),

  reorderBlocks: (strategyId, blockId, direction) => set(state => ({
    strategies: state.strategies.map(s => {
      if (s.id !== strategyId) return s;
      const idx = s.blocks.findIndex(b => b.id === blockId);
      if (idx === -1) return s;
      const blocks = [...s.blocks];
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target >= 0 && target < blocks.length) {
        [blocks[idx], blocks[target]] = [blocks[target], blocks[idx]];
      }
      return { ...s, blocks };
    }),
  })),

  toggleFavorite: (id) => set(state => ({
    strategies: state.strategies.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s),
  })),

  // ─── Version management (local only) ────────────────────────────────────────

  saveStrategyVersion: (strategyId, versionName, description) => set(state => {
    const strat = state.strategies.find(s => s.id === strategyId);
    if (!strat) return {};
    const newVersion: StrategyVersion = {
      id: `ver-${Date.now()}`,
      strategyId,
      versionName,
      description,
      timestamp: new Date().toISOString(),
      config: JSON.parse(JSON.stringify({
        name: strat.name,
        instrument: strat.instrument,
        timeframe: strat.timeframe,
        sessions: strat.sessions,
        direction: strat.direction,
        riskPerTrade: strat.riskPerTrade,
        maxDailyDrawdown: strat.maxDailyDrawdown,
        blocks: strat.blocks,
      })),
    };
    const updated = [newVersion, ...state.versions];
    saveVersionsToStorage(updated);
    return { versions: updated };
  }),

  restoreStrategyVersion: (versionId) => {
    const state = get();
    const version = state.versions.find(v => v.id === versionId);
    if (!version) return false;
    set(s => ({
      strategies: s.strategies.map(st => {
        if (st.id !== version.strategyId) return st;
        return {
          ...st,
          name: version.config.name,
          instrument: version.config.instrument,
          timeframe: version.config.timeframe,
          sessions: JSON.parse(JSON.stringify(version.config.sessions)),
          direction: version.config.direction,
          riskPerTrade: version.config.riskPerTrade,
          maxDailyDrawdown: version.config.maxDailyDrawdown,
          blocks: JSON.parse(JSON.stringify(version.config.blocks)),
        };
      }),
    }));
    return true;
  },

  deleteStrategyVersion: (versionId) => set(state => {
    const updated = state.versions.filter(v => v.id !== versionId);
    saveVersionsToStorage(updated);
    return { versions: updated };
  }),
}));
