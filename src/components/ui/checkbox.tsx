import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  id,
  checked,
  onCheckedChange,
  className = '',
  children,
  ...props
}, ref) => {
  const handleClick = () => {
    onCheckedChange(!checked);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only"
        {...props}
      />
      <div
        className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-colors ${
          checked
            ? 'border-primary bg-primary'
            : 'border-input bg-background'
        }`}
        onClick={handleClick}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      {children && (
        <label
          htmlFor={id}
          className="text-sm cursor-pointer select-none"
          onClick={handleClick}
        >
          {children}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;