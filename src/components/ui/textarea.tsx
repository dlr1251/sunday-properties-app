import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={[
        // Base styles
        'flex min-h-[80px] w-full rounded-lg px-3 py-2',
        // Border and background
        'border border-input bg-background',
        // Typography
        'text-sm text-foreground',
        'placeholder:text-muted-foreground',
        // Focus state with ring (WCAG AAA)
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Smooth transition
        'transition-colors duration-200',
        // Resize control
        'resize-none',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

export default Textarea;