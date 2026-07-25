import { create } from 'zustand';

interface JunkState {
  clearedIds: Set<string>;
  totalCount: number;
  clearItem: (id: string) => void;
  setTotal: (n: number) => void;
  isComplete: () => boolean;
  reset: () => void;
}

export const useJunkStore = create<JunkState>((set, get) => ({
  clearedIds: new Set(),
  totalCount: 0,
  clearItem: (id) =>
    set((s) => ({ clearedIds: new Set(s.clearedIds).add(id) })),
  setTotal: (n) => set({ totalCount: n }),
  isComplete: () => {
    const { clearedIds, totalCount } = get();
    return totalCount > 0 && clearedIds.size === totalCount;
  },
  reset: () => set({ clearedIds: new Set() }),
}));