import React from 'react';

export const Separator: React.FC<{ orientation?: 'horizontal' | 'vertical'; className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ orientation = 'horizontal', className = '', ...props }) => (
  <div
    className={`bg-gray-200 ${orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full'} ${className}`}
    {...props}
  />
);

export default Separator;


