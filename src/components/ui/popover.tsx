import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue>({
  open: false,
  onOpenChange: () => {},
});

export const Popover: React.FC<PopoverProps> = ({
  open: controlledOpen,
  onOpenChange,
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  return (
    <div data-popover-root>
      <PopoverContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
        {children}
      </PopoverContext.Provider>
    </div>
  );
};

export const PopoverTrigger: React.FC<React.HTMLAttributes<HTMLDivElement> & { 
  asChild?: boolean;
}> = ({
  children,
  asChild,
  className = '',
  ...props
}) => {
  const { open, onOpenChange } = React.useContext(PopoverContext);
  
  const triggerRef = useRef<HTMLElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChange(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      'data-popover-trigger': true,
      ref: (node: HTMLElement) => {
        triggerRef.current = node;
        if (typeof (children as any).ref === 'function') {
          (children as any).ref(node);
        } else if ((children as any).ref) {
          (children as any).ref.current = node;
        }
      },
      onClick: (e: React.MouseEvent) => {
        handleClick(e);
        children.props.onClick?.(e);
      },
      className: `${children.props.className || ''} ${className}`.trim(),
    });
  }

  return (
    <div 
      ref={triggerRef as any} 
      data-popover-trigger 
      onClick={handleClick} 
      className={className} 
      {...props}
    >
      {children}
    </div>
  );
};

export const PopoverContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { 
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}> = ({
  className = '',
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  children,
  ...props
}) => {
  const { open, onOpenChange } = React.useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Find the trigger element
    const findTrigger = () => {
      const popoverElement = contentRef.current?.closest('[data-popover-root]') || document.body;
      const trigger = popoverElement.querySelector('[data-popover-trigger]') as HTMLElement;
      return trigger;
    };

    triggerRef.current = findTrigger();

    const updatePosition = () => {
      if (!contentRef.current || !triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      if (side === 'bottom') {
        top = triggerRect.bottom + sideOffset;
        left = triggerRect.left;
      } else if (side === 'top') {
        top = triggerRect.top - contentRect.height - sideOffset;
        left = triggerRect.left;
      } else if (side === 'right') {
        top = triggerRect.top;
        left = triggerRect.right + sideOffset;
      } else {
        top = triggerRect.top;
        left = triggerRect.left - contentRect.width - sideOffset;
      }

      // Align adjustment
      if (align === 'center') {
        left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
      } else if (align === 'end') {
        left = triggerRect.right - contentRect.width;
      }

      // Ensure content stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (left < 0) left = 8;
      if (left + contentRect.width > viewportWidth) left = viewportWidth - contentRect.width - 8;
      if (top < 0) top = 8;
      if (top + contentRect.height > viewportHeight) top = viewportHeight - contentRect.height - 8;

      contentRef.current.style.position = 'fixed';
      contentRef.current.style.top = `${top}px`;
      contentRef.current.style.left = `${left}px`;
      contentRef.current.style.zIndex = '100';
    };

    // Use requestAnimationFrame for smoother positioning
    const rafId = requestAnimationFrame(() => {
      updatePosition();
    });

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange, side, align, sideOffset]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={`fixed z-[100] w-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Popover;

