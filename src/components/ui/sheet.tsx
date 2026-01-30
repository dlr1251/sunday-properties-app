import React, { useEffect, useState, createContext, useContext } from 'react';
import { X } from 'lucide-react';

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextValue | undefined>(undefined);

interface SheetProps {
  children: React.ReactNode;
}

const Sheet: React.FC<SheetProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

const SheetTrigger: React.FC<SheetTriggerProps> = ({ 
  className = '', 
  children, 
  asChild = false,
  ...props 
}) => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('SheetTrigger must be used within Sheet');
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.setOpen(true);
    props.onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
      className: `${children.props.className || ''} ${className}`.trim(),
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button className={className} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;
}

const SheetContent: React.FC<SheetContentProps> = ({ 
  className = '', 
  side = 'right',
  children,
  ...props 
}) => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('SheetContent must be used within Sheet');
  }

  if (!context.open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      context.setOpen(false);
    }
  };

  const sideClasses = {
    left: 'inset-y-0 left-0 h-full border-r animate-slide-in-left',
    right: 'inset-y-0 right-0 h-full border-l animate-slide-in-right',
    top: 'inset-x-0 top-0 w-full border-b animate-fade-in-down',
    bottom: 'inset-x-0 bottom-0 w-full border-t animate-fade-in-up',
  };

  const sizeClasses = {
    left: 'w-80 max-w-[85vw]',
    right: 'w-80 max-w-[85vw]',
    top: 'h-auto max-h-[85vh]',
    bottom: 'h-auto max-h-[85vh]',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={[
          'fixed p-6',
          'bg-background shadow-elevated',
          'border-border',
          sideClasses[side],
          sizeClasses[side],
          className,
        ].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Close button */}
        <button
          onClick={() => context.setOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SheetHeader: React.FC<SheetHeaderProps> = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-2 mb-6 ${className}`} {...props} />
);

interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const SheetTitle: React.FC<SheetTitleProps> = ({ className = '', ...props }) => (
  <h2 className={`text-lg font-semibold text-foreground ${className}`} {...props} />
);

interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const SheetDescription: React.FC<SheetDescriptionProps> = ({ className = '', ...props }) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props} />
);

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription };

