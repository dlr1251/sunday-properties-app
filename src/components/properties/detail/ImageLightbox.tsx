import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '../../ui/button';
import { AnimatePresence, motion } from 'framer-motion';

interface ImageLightboxProps {
  images: string[];
  isOpen: boolean;
  initialIndex: number;
  onClose: () => void;
  propertyTitle: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  isOpen,
  initialIndex,
  onClose,
  propertyTitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setImageLoaded(false);
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoomLevel((prev) => Math.min(prev + 0.25, 3));
          break;
        case '-':
          e.preventDefault();
          setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => Math.max(0.5, Math.min(3, prev + delta)));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      // Drag functionality can be enhanced here
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `${propertyTitle}-image-${currentIndex + 1}.jpg`;
    link.click();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Image Container */}
        <div
          className="flex items-center justify-center h-full p-4"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="relative max-w-full max-h-full"
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={(e) => e.stopPropagation()}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg" />
            )}
            <img
              src={images[currentIndex]}
              alt={`${propertyTitle} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onLoad={handleImageLoad}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel(1);
            }}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-white text-sm px-2">{Math.round(zoomLevel * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((prev) => Math.min(prev + 0.25, 3));
            }}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="flex gap-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm overflow-x-auto max-w-[90vw]">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThumbnailClick(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white scale-110'
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

