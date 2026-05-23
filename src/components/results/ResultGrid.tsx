import { ImageOff, Sparkles } from 'lucide-react';
import { ResultCard } from './ResultCard';
import { cn } from '@/lib/utils/cn';
import type { TaskItem } from '@/lib/store/tasks';
import type { Creation } from '@/types/creation';

interface ResultGridProps {
  tasks: TaskItem[];
  onRetry: (taskId: string) => void;
  onSelect: (creation: Creation) => void;
  onToggleFavorite: (creation: Creation) => void;
  onDelete: (creation: Creation) => void;
}

export function ResultGrid({
  tasks,
  onRetry,
  onSelect,
  onToggleFavorite,
  onDelete,
}: ResultGridProps) {
  if (tasks.length === 0) {
    return <EmptyResults />;
  }

  const cols = tasks.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-2 max-w-4xl';

  return (
    <div className={cn('mx-auto grid w-full gap-3', cols)}>
      {tasks.map((t) => (
        <ResultCard
          key={t.id}
          task={t}
          onRetry={onRetry}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-aurora-soft blur-md" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-hairline bg-slate-card">
          <Sparkles className="h-6 w-6 text-aurora-violet" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-h3 text-ink">在左侧描述你想要的画面</h3>
      <p className="mt-2 text-body-sm text-ink-mist">
        越具体越好，包含主体、场景、光线、风格。可以点 ✨ 让 AI 帮你优化提示词。
      </p>
    </div>
  );
}

interface EmptyKeyHintProps {
  className?: string;
}

export function EmptyKeyHint({ className }: EmptyKeyHintProps) {
  return (
    <div
      className={cn(
        'mx-auto flex h-full max-w-md flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-status-warn/30 bg-status-warn/10">
        <ImageOff className="h-6 w-6 text-status-warn" strokeWidth={1.5} />
      </div>
      <h3 className="text-h3 text-ink">还没有配置 API Key</h3>
      <p className="mt-2 text-body-sm text-ink-mist">
        前往 <a href="/settings" className="text-aurora-violet underline-offset-2 hover:underline">设置页</a>{' '}
        填入智谱开放平台的 API Key 即可开始创作。
      </p>
    </div>
  );
}
