import { Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { usePromptHistory } from '@/lib/store/prompt-history';

interface PromptHistoryChipsProps {
  onPick: (prompt: string) => void;
  /** 默认仅展示 5 条 */
  max?: number;
}

export function PromptHistoryChips({ onPick, max = 5 }: PromptHistoryChipsProps) {
  const items = usePromptHistory((s) => s.items);
  const remove = usePromptHistory((s) => s.remove);

  if (items.length === 0) return null;

  const visible = items.slice(0, max);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-ink-faded" strokeWidth={1.75} />
        <span className="text-overline uppercase tracking-wider text-ink-faded">
          最近使用
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((p) => (
          <div
            key={p}
            className={cn(
              'group flex h-7 max-w-full items-center gap-1.5 rounded-xs border border-hairline bg-transparent pl-2.5 pr-1 text-body-sm text-ink-mist transition-colors hover:border-[#28283A] hover:bg-slate-raised hover:text-ink'
            )}
          >
            <button
              type="button"
              onClick={() => onPick(p)}
              title={p}
              className="min-w-0 max-w-[180px] truncate text-left"
            >
              {p}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(p);
              }}
              aria-label="移除"
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-xs text-ink-faded opacity-0 transition-opacity hover:text-status-err group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
