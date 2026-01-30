import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={[
        // Base styles
        'flex h-10 w-full rounded-lg px-3 py-2',
        // Border and background
        'border border-input bg-background',
        // Typography
        'text-sm text-foreground',
        'placeholder:text-muted-foreground',
        // File input specific
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        // Focus state with ring (WCAG AAA)
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Smooth transition
        'transition-colors duration-200',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  )
);

Input.displayName = 'Input';

export default Input;


