import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ImageModel =
  | 'glm-image'
  | 'cogview-3-flash'
  | 'cogview-4'
  | 'cogview-4-250304';
export type ChatModel = 'glm-4-flash' | 'glm-4-plus';
export type ConnectionStatus = 'ok' | 'failed' | null;

interface SettingsState {
  apiKey: string;
  defaultImageModel: ImageModel;
  defaultChatModel: ChatModel;
  lastTest: ConnectionStatus;
  lastTestedAt: number | null;
  setApiKey: (k: string) => void;
  setDefaultImageModel: (m: ImageModel) => void;
  setDefaultChatModel: (m: ChatModel) => void;
  setLastTest: (s: ConnectionStatus) => void;
  clearAll: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      defaultImageModel: 'cogview-3-flash',
      defaultChatModel: 'glm-4-flash',
      lastTest: null,
      lastTestedAt: null,
      setApiKey: (k) => set({ apiKey: k.trim(), lastTest: null, lastTestedAt: null }),
      setDefaultImageModel: (m) => set({ defaultImageModel: m }),
      setDefaultChatModel: (m) => set({ defaultChatModel: m }),
      setLastTest: (s) =>
        set({ lastTest: s, lastTestedAt: s === null ? null : Date.now() }),
      clearAll: () =>
        set({
          apiKey: '',
          defaultImageModel: 'cogview-3-flash',
          defaultChatModel: 'glm-4-flash',
          lastTest: null,
          lastTestedAt: null,
        }),
    }),
    { name: 'your-image:settings' }
  )
);
