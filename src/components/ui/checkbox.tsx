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
        className={`w-4 h-4 border-2 rounded cursor-pointer flex items-center justify-center transition-colors ${
          checked
            ? 'bg-blue-600 border-blue-600'
            : 'border-gray-300'
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