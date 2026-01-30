import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement>;
  displayText: string;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

// Simple mapping for common values - can be extended
const valueToDisplayText: Record<string, string> = {
  // User roles
  user: 'Comprador / Vendedor',
  agent: 'Agente Inmobiliario',
  lawyer: 'Abogado',
  // Lead sources
  facebook: 'Facebook',
  instagram: 'Instagram',
  google: 'Google Search',
  real_estate_website: 'Sitio web inmobiliario',
  friend_referral: 'Referencia de amigo',
  agent_referral: 'Referencia de agente',
  other: 'Otro',
};

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayText = value ? (valueToDisplayText[value] || value) : '';

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, triggerRef, displayText }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    const context = useContext(SelectContext);
    if (!context) throw new Error('SelectTrigger must be used within Select');

    return (
      <div
        ref={context.triggerRef}
        className={[
          // Base styles
          'flex h-10 w-full items-center justify-between rounded-lg px-3 py-2',
          // Border and background
          'border border-input bg-background',
          // Typography
          'text-sm',
          // Interactive states
          'cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Transition
          'transition-colors duration-200',
          className,
        ].filter(Boolean).join(' ')}
        onClick={() => context.setIsOpen(!context.isOpen)}
        tabIndex={0}
        role="combobox"
        aria-expanded={context.isOpen}
        {...props}
      >
        {children}
        <ChevronDown 
          className={[
            'h-4 w-4 opacity-50',
            'transition-transform duration-200 ease-out',
            context.isOpen ? 'rotate-180' : '',
          ].join(' ')} 
        />
      </div>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  return (
    <span className={context.displayText ? 'text-foreground' : 'text-muted-foreground'}>
      {context.displayText || placeholder}
    </span>
  );
};

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    const context = useContext(SelectContext);
    if (!context) throw new Error('SelectContent must be used within Select');

    if (!context.isOpen) return null;

    return (
      <div
        ref={ref}
        className={[
          // Positioning
          'absolute top-full left-0 right-0 z-50 mt-1',
          // Appearance
          'rounded-lg border border-border bg-popover text-popover-foreground',
          // Shadow
          'shadow-elevated',
          // Scrolling
          'max-h-60 overflow-auto',
          // Animation
          'animate-fade-in',
          // Custom scrollbar
          'scrollbar-thin',
          className,
        ].filter(Boolean).join(' ')}
        role="listbox"
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    );
  }
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, className = '', children, onClick, ...props }, ref) => {
    const context = useContext(SelectContext);
    if (!context) throw new Error('SelectItem must be used within Select');

    const isSelected = context.value === value;

    return (
      <div
        ref={ref}
        className={[
          // Base styles
          'relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2',
          // Typography
          'text-sm',
          // Interactive states
          'outline-none',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:bg-accent focus:text-accent-foreground',
          // Selected state
          isSelected ? 'bg-accent/50 font-medium' : '',
          // Transition
          'transition-colors duration-150',
          className,
        ].filter(Boolean).join(' ')}
        onClick={(e) => {
          context.onValueChange(value);
          context.setIsOpen(false);
          onClick?.(e);
        }}
        role="option"
        aria-selected={isSelected}
        {...props}
      >
        {/* Check icon for selected state */}
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        {children}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';


