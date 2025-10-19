import React, { useState } from 'react';
import { getPropertyImage } from '../utils/imageUtils';

interface PropertyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSeed?: number;
}

export const PropertyImage: React.FC<PropertyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  width = 400, 
  height = 300,
  fallbackSeed = 1 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleLoad = () => {
    setImageLoading(false);
  };

  const imageSrc = imageError ? getPropertyImage(width, height, fallbackSeed) : src;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};
