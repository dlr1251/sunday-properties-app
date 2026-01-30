import React from 'react';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'premium';
};

// Premium badge design - no gradients, elegant opacity-based colors
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 
        'bg-primary/10 text-primary border-transparent',
      secondary: 
        'bg-secondary text-secondary-foreground border-transparent',
      outline: 
        'text-foreground border-border bg-transparent',
      success: 
        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent',
      warning: 
        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent',
      destructive: 
        'bg-destructive/10 text-destructive dark:text-red-400 border-transparent',
      premium: 
        'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-transparent',
    }[variant];

    return (
      <span
        ref={ref}
        className={[
          'inline-flex items-center rounded-full border px-2.5 py-0.5',
          'text-xs font-medium',
          'transition-colors duration-200',
          variantClasses,
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;


