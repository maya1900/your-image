import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-10 w-full rounded-sm border border-hairline bg-carbon px-3 text-body text-ink placeholder:text-ink-faded transition-colors hover:border-[#2A2A36] focus:border-aurora-violet focus:outline-none focus:shadow-focus',
          className
        )}
        {...rest}
      />
    );
  }
);
