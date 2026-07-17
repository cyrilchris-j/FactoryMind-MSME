import { cn } from '@/lib/utils';
import { forwardRef, InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-[12px] border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
