import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary:
    'bg-aurora-gradient text-ink font-semibold shadow-card hover:scale-[1.01] active:translate-y-px disabled:bg-none disabled:bg-[#27272F] disabled:text-ink-disabled disabled:hover:scale-100',
  secondary:
    'border border-hairline bg-transparent text-ink-mist hover:border-[#28283A] hover:bg-slate-raised hover:text-ink disabled:opacity-50',
  ghost:
    'bg-transparent text-ink-mist hover:bg-aurora-soft hover:text-ink disabled:opacity-50',
  danger:
    'bg-transparent text-status-err hover:bg-status-err/10 disabled:opacity-50',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-9 px-3 text-body-sm',
  md: 'h-10 px-5 text-body',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading,
    iconLeft,
    iconRight,
    className,
    disabled,
    children,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm transition-transform duration-150 ease-out-expo disabled:cursor-not-allowed',
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
});
