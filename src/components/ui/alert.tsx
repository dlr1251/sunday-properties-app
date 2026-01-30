import React from 'react';

export const Alert: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 ${className}`} {...props} />
);

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', ...props }) => (
  <p className={`text-sm ${className}`} {...props} />
);

export default Alert;


