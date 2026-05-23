import { create } from 'zustand';
import type { Creation } from '@/types/creation';

export type TaskStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface TaskItem {
  id: string;
  status: TaskStatus;
  error?: string;
  creation?: Creation;
  startedAt: number;
}

interface TasksState {
  /** 当前一批生成任务（按用户点击"生成"的顺序），失败/成功后也保留在视图中直到下一次提交 */
  current: TaskItem[];
  reset: (ids: string[]) => void;
  succeed: (id: string, creation: Creation) => void;
  fail: (id: string, error: string) => void;
  removeOne: (id: string) => void;
}

export const useTasks = create<TasksState>((set) => ({
  current: [],
  reset: (ids) =>
    set({
      current: ids.map((id) => ({
        id,
        status: 'pending' as const,
        startedAt: Date.now(),
      })),
    }),
  succeed: (id, creation) =>
    set((s) => ({
      current: s.current.map((t) =>
        t.id === id ? { ...t, status: 'success', creation } : t
      ),
    })),
  fail: (id, error) =>
    set((s) => ({
      current: s.current.map((t) =>
        t.id === id ? { ...t, status: 'failed', error } : t
      ),
    })),
  removeOne: (id) =>
    set((s) => ({ current: s.current.filter((t) => t.id !== id) })),
}));
