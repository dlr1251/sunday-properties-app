import React, { createContext, useContext, useState, useCallback } from 'react';

type AvatarContextValue = {
  showFallback: boolean;
  onImageLoad: () => void;
  onImageError: () => void;
  hasSrc: boolean;
  setHasSrc: (has: boolean) => void;
};

const AvatarContext = createContext<AvatarContextValue | null>(null);

export const Avatar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  const [showFallback, setShowFallback] = useState(true);
  const [hasSrc, setHasSrc] = useState(false);

  const onImageLoad = useCallback(() => {
    setShowFallback(false);
  }, []);

  const onImageError = useCallback(() => {
    setShowFallback(true);
  }, []);

  const value: AvatarContextValue = {
    showFallback,
    onImageLoad,
    onImageError,
    hasSrc,
    setHasSrc,
  };

  return (
    <AvatarContext.Provider value={value}>
      <div className={`relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 ${className}`} {...props}>
        {children}
      </div>
    </AvatarContext.Provider>
  );
};

export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = '', src, onLoad, onError, ...props }) => {
  const ctx = useContext(AvatarContext);
  const hasSrc = Boolean(src?.toString().trim());

  React.useEffect(() => {
    ctx?.setHasSrc(hasSrc);
    if (!hasSrc) ctx?.onImageError?.();
  }, [hasSrc, ctx]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    ctx?.onImageLoad?.();
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    ctx?.onImageError?.();
    onError?.(e);
  };

  return (
    <img
      className={`h-full w-full object-cover ${className}`}
      src={src}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', children, ...props }) => {
  const ctx = useContext(AvatarContext);

  // Only show fallback when we have no image src, or image failed/not loaded yet
  const visible = ctx ? (ctx.hasSrc ? ctx.showFallback : true) : true;

  if (!visible) {
    return null;
  }

  return (
    <span
      className={`absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Avatar;
