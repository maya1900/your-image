import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type GenerateCount = 1 | 2 | 4;

const OPTIONS: GenerateCount[] = [1, 2, 4];

interface CountSelectorProps {
  value: GenerateCount;
  onChange: (v: GenerateCount) => void;
}

export function CountSelector({ value, onChange }: CountSelectorProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Layers className="h-3.5 w-3.5 text-ink-faded" strokeWidth={1.75} />
        <span className="text-overline uppercase tracking-wider text-ink-faded">数量</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'h-10 rounded-sm border font-mono text-body-sm transition-colors',
              value === n
                ? 'border-aurora-violet bg-aurora-soft text-ink'
                : 'border-hairline text-ink-mist hover:border-[#28283A] hover:text-ink'
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
