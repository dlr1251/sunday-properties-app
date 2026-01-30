import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    // Premium variant styles - no gradients, subtle and elegant
    const variantClasses = {
      default: 
        'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]',
      secondary: 
        'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98]',
      outline: 
        'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98]',
      ghost: 
        'hover:bg-accent hover:text-accent-foreground',
      link: 
        'text-primary underline-offset-4 hover:underline',
      destructive: 
        'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]',
    }[variant];

    // Refined size classes with better proportions
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      default: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2',
      icon: 'h-9 w-9',
    }[size];

    const buttonClasses = [
      // Base styles
      'inline-flex items-center justify-center',
      'rounded-lg font-medium',
      // Smooth transitions
      'transition-all duration-200 ease-out',
      // Focus ring for accessibility (WCAG AAA)
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      // Disabled state
      'disabled:pointer-events-none disabled:opacity-50',
      // Variant and size
      variantClasses,
      sizeClasses,
      className,
    ].filter(Boolean).join(' ');

    // If asChild is true, render the child element with button props and classes
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        className: `${buttonClasses} ${children.props.className || ''}`,
        ...props,
      } as React.HTMLAttributes<HTMLElement>);
    }

    // Default button rendering
    return (
      <button
        ref={ref}
        className={buttonClasses}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;


