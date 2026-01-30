import React from 'react';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className = '', ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props} />
);

export default Label;


