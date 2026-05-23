import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_HISTORY = 50;

interface PromptHistoryState {
  items: string[];
  add: (prompt: string) => void;
  remove: (prompt: string) => void;
  clear: () => void;
}

export const usePromptHistory = create<PromptHistoryState>()(
  persist(
    (set) => ({
      items: [],
      add: (prompt) =>
        set((s) => {
          const trimmed = prompt.trim();
          if (!trimmed) return s;
          const next = [trimmed, ...s.items.filter((p) => p !== trimmed)];
          if (next.length > MAX_HISTORY) next.length = MAX_HISTORY;
          return { items: next };
        }),
      remove: (prompt) =>
        set((s) => ({ items: s.items.filter((p) => p !== prompt) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'your-image:prompt-history' }
  )
);
