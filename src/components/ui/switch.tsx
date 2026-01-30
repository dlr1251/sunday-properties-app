import React from 'react';

export const Switch: React.FC<{ checked?: boolean; onCheckedChange?: (v: boolean) => void; className?: string }> = ({ checked = false, onCheckedChange, className = '' }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full border border-gray-300 ${checked ? 'bg-blue-600' : 'bg-gray-200'} ${className}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
  </button>
);

export default Switch;


