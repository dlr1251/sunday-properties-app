import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dialog: React.FC<DialogProps> = ({
  className = '',
  open = false,
  onOpenChange,
  children,
  ...props
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && onOpenChange) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <div
      className={[
        'fixed inset-0 z-50',
        'flex items-center justify-center p-4',
        'bg-background/80 backdrop-blur-sm',
        'animate-fade-in',
        className,
      ].filter(Boolean).join(' ')}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      {...props}
    >
      {children}
    </div>
  );
};

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showClose?: boolean;
  onClose?: () => void;
}

export const DialogContent: React.FC<DialogContentProps> = ({ 
  className = '', 
  showClose = true,
  onClose,
  children,
  ...props 
}) => (
  <div
    className={[
      'relative w-full max-w-lg',
      'bg-background rounded-2xl border border-border',
      'shadow-elevated',
      'p-6',
      'animate-scale-in',
      className,
    ].filter(Boolean).join(' ')}
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {showClose && onClose && (
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Close dialog"
      >
        <X className="h-4 w-4" />
      </button>
    )}
    {children}
  </div>
);

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`} {...props} />
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', ...props }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight text-foreground ${className}`} {...props} />
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', ...props }) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props} />
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 ${className}`} {...props} />
);

export const DialogTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }> = ({
  className = '',
  children,
  asChild = false,
  ...props
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      className: `${children.props.className || ''} ${className}`.trim(),
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export default Dialog;


