import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

interface SelectProps<T extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  value: T;
  onValueChange: (v: T) => void;
  options: SelectOption<T>[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { value, onValueChange, options, className, ...rest },
  ref
) {
  return (
    <div className={cn('relative', className)}>
      <select
        ref={ref}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          'h-10 w-full appearance-none rounded-sm border border-hairline bg-carbon px-3 pr-9 text-body text-ink transition-colors hover:border-[#2A2A36] focus:border-aurora-violet focus:outline-none focus:shadow-focus'
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-raised text-ink">
            {o.label}
            {o.hint ? ` · ${o.hint}` : ''}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mist"
        strokeWidth={1.75}
      />
    </div>
  );
});
