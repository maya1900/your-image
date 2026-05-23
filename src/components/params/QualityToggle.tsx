import { Gem } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Quality } from '@/types/creation';
import type { ImageModel } from '@/lib/store/settings';

interface QualityToggleProps {
  value: Quality;
  onChange: (v: Quality) => void;
  model: ImageModel;
}

/** 仅 CogView-4 系列支持 HD */
function supportsHD(m: ImageModel): boolean {
  return m === 'cogview-4' || m === 'cogview-4-250304';
}

export function QualityToggle({ value, onChange, model }: QualityToggleProps) {
  const hdAvailable = supportsHD(model);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Gem className="h-3.5 w-3.5 text-ink-faded" strokeWidth={1.75} />
        <span className="text-overline uppercase tracking-wider text-ink-faded">质量</span>
        {!hdAvailable && (
          <span className="text-overline text-ink-faded">· 当前模型仅支持标准</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onChange('standard')}
          className={cn(
            'h-10 rounded-sm border text-body-sm transition-colors',
            value === 'standard'
              ? 'border-aurora-violet bg-aurora-soft text-ink'
              : 'border-hairline text-ink-mist hover:border-[#28283A] hover:text-ink'
          )}
        >
          标准
        </button>
        <button
          type="button"
          disabled={!hdAvailable}
          onClick={() => hdAvailable && onChange('hd')}
          className={cn(
            'h-10 rounded-sm border text-body-sm transition-colors',
            value === 'hd' && hdAvailable
              ? 'border-aurora-violet bg-aurora-soft text-ink'
              : 'border-hairline text-ink-mist hover:border-[#28283A] hover:text-ink',
            !hdAvailable && 'cursor-not-allowed opacity-40 hover:border-hairline hover:text-ink-mist'
          )}
        >
          高清 HD
        </button>
      </div>
    </div>
  );
}
