import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

export const DropdownMenu: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside the entire menu (trigger + content)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Use setTimeout to avoid catching the same click that opened the menu
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, menuRef }}>
      <div ref={menuRef} className={`relative inline-block text-left ${className}`} {...props}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

interface DropdownMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  asChild = false,
  children,
  className = '',
  ...props
}) => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');
  }

  const { isOpen, setIsOpen } = context;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      'aria-expanded': isOpen,
      'aria-haspopup': 'menu',
      ...props,
    });
  }

  return (
    <div
      className={`${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
};

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  className = '', 
  style, 
  align = 'end',
  ...props 
}) => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuContent must be used within a DropdownMenu');
  }

  const { isOpen } = context;

  if (!isOpen) return null;

  const alignmentClass = align === 'start' ? 'left-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-0';

  return (
    <div
      className={`absolute ${alignmentClass} z-50 mt-2 w-56 origin-top-right rounded-md border border-border bg-popover text-popover-foreground shadow-lg ${className}`}
      style={{ minWidth: '10rem', ...style }}
      role="menu"
      {...props}
    />
  );
};

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
  keepOpen?: boolean; // Prevent dropdown from closing when clicked
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  asChild = false,
  children,
  className = '',
  keepOpen = false,
  onClick,
  ...props
}) => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuItem must be used within a DropdownMenu');
  }

  const { setIsOpen } = context;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    // Execute the onClick handler first
    if (onClick) {
      onClick(e);
    }

    // Then close the dropdown (unless keepOpen is true)
    if (!keepOpen) {
      setIsOpen(false);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      onClick: handleClick,
      role: 'menuitem',
    });
  }

  return (
    <button
      className={`w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${className}`}
      onClick={handleClick}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
};

export const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`px-4 py-2 text-xs font-medium text-muted-foreground ${className}`} {...props} />
);

export const DropdownMenuSeparator: React.FC = () => (
  <div className="my-1 h-px bg-border" />
);


