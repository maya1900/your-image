import { create } from 'zustand';
import {
  addCreation,
  clearCreations,
  deleteCreation,
  listCreations,
  updateCreation,
} from '@/lib/db';
import type { Creation } from '@/types/creation';

interface GalleryState {
  items: Creation[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (c: Creation) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useGallery = create<GalleryState>((set, get) => ({
  items: [],
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const items = await listCreations();
    set({ items, loaded: true });
  },
  add: async (c) => {
    await addCreation(c);
    set((s) => ({ items: [c, ...s.items] }));
  },
  remove: async (id) => {
    await deleteCreation(id);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },
  toggleFavorite: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;
    const next = !item.favorite;
    await updateCreation(id, { favorite: next });
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, favorite: next } : i)),
    }));
  },
  clearAll: async () => {
    await clearCreations();
    set({ items: [] });
  },
}));
