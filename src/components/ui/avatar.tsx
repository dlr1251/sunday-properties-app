import React from 'react';

export const Avatar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 ${className}`} {...props} />
);

export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = '', ...props }) => (
  <img className={`h-full w-full object-cover ${className}`} {...props} />
);

export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', children, ...props }) => (
  <span className={`text-sm font-medium text-gray-700 ${className}`} {...props}>{children}</span>
);

export default Avatar;


