import React, { createContext, useContext } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, className = '', children, ...props }) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div className={`w-full ${className}`} {...props}>
      {children}
    </div>
  </TabsContext.Provider>
);

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div 
      ref={ref}
      className={[
        'inline-flex h-10 items-center justify-center rounded-lg',
        'bg-muted p-1',
        'text-muted-foreground',
        className,
      ].filter(Boolean).join(' ')} 
      {...props} 
    />
  )
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className = '', onClick, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const isActive = context.value === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        className={[
          'inline-flex items-center justify-center whitespace-nowrap',
          'rounded-md px-3 py-1.5',
          'text-sm font-medium',
          'ring-offset-background',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
          className,
        ].filter(Boolean).join(' ')}
        onClick={(e) => {
          context.onValueChange(value);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className = '', ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    if (context.value !== value) return null;

    return (
      <div 
        ref={ref}
        role="tabpanel"
        className={[
          'mt-4',
          'ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'animate-fade-in',
          className,
        ].filter(Boolean).join(' ')} 
        {...props} 
      />
    );
  }
);
TabsContent.displayName = 'TabsContent';


