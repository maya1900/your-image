import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const SIZE_PRESETS = [
  { id: '1024x1024', label: '1:1', desc: '1024×1024' },
  { id: '1152x864', label: '4:3', desc: '1152×864' },
  { id: '864x1152', label: '3:4', desc: '864×1152' },
  { id: '1344x768', label: '16:9', desc: '1344×768' },
  { id: '768x1344', label: '9:16', desc: '768×1344' },
  { id: '1440x720', label: '21:9', desc: '1440×720' },
  { id: '720x1440', label: '9:21', desc: '720×1440' },
] as const;

interface SizeSelectorProps {
  value: string;
  onChange: (v: string) => void;
  /** 当选择 custom 时是否展开自定义输入；预留 v1.1 */
  custom?: { width: number; height: number };
  onCustomChange?: (size: { width: number; height: number }) => void;
}

export function SizeSelector({ value, onChange }: SizeSelectorProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Settings2 className="h-3.5 w-3.5 text-ink-faded" strokeWidth={1.75} />
        <span className="text-overline uppercase tracking-wider text-ink-faded">尺寸</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {SIZE_PRESETS.map((s) => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              className={cn(
                'flex h-12 flex-col items-center justify-center gap-0.5 rounded-sm border text-body-sm transition-colors',
                active
                  ? 'border-aurora-violet bg-aurora-soft text-ink'
                  : 'border-hairline bg-transparent text-ink-mist hover:border-[#28283A] hover:bg-slate-raised hover:text-ink'
              )}
              title={s.desc}
            >
              <span className="font-medium">{s.label}</span>
              <span className="font-mono text-[10px] text-ink-faded">{s.desc.split('×').join('·')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
