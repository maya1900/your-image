import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface PromptInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  className?: string;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = '描述你想要的画面，越具体越好。例如：戴着复古飞行员护目镜的橘色波斯猫，蒸汽朋克实验室背景，暖光，电影感',
  maxLength = 1500,
  rows = 5,
  className,
}: PromptInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 320) + 'px';
  }, [value]);

  const over = value.length > maxLength;

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter 触发提交
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <textarea
        ref={ref}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full resize-none rounded-md border border-hairline bg-carbon px-3 py-3 text-body text-ink placeholder:text-ink-faded transition-colors hover:border-[#2A2A36] focus:border-aurora-violet focus:outline-none focus:shadow-focus',
          'min-h-[120px] max-h-[320px]',
          over && 'border-status-err/60 focus:border-status-err focus:shadow-[0_0_0_3px_rgba(239,68,68,0.18)]'
        )}
        spellCheck={false}
        aria-label="Prompt 输入框"
      />
      <div
        className={cn(
          'pointer-events-none absolute bottom-2 right-3 text-caption',
          over ? 'text-status-err' : 'text-ink-faded'
        )}
      >
        {value.length} / {maxLength}
      </div>
    </div>
  );
}
