import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { STYLE_PRESETS } from '@/lib/presets/styles';

interface StylePresetsBarProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function StylePresetsBar({ selected, onToggle }: StylePresetsBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Palette className="h-3.5 w-3.5 text-ink-faded" strokeWidth={1.75} />
        <span className="text-overline uppercase tracking-wider text-ink-faded">
          风格预设
        </span>
        {selected.length > 0 && (
          <span className="ml-1 rounded-xs bg-aurora-soft px-1.5 font-mono text-[10px] text-aurora-violet">
            {selected.length}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STYLE_PRESETS.map((p) => {
          const active = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onToggle(p.id)}
              className={cn(
                'h-7 rounded-xs border px-2.5 text-body-sm transition-colors',
                active
                  ? 'border-aurora-violet bg-aurora-soft text-ink'
                  : 'border-hairline bg-transparent text-ink-mist hover:border-[#28283A] hover:bg-slate-raised hover:text-ink'
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
