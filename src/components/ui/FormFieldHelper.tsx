import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface FormFieldHelperProps {
  fieldId: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const FormFieldHelper: React.FC<FormFieldHelperProps> = ({
  fieldId,
  content,
  position = 'top'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = rect.top + scrollY - 10;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + scrollY + 10;
            left = rect.left + scrollX + rect.width / 2;
            break;
          case 'left':
            top = rect.top + scrollY + rect.height / 2;
            left = rect.left + scrollX - 10;
            break;
          case 'right':
            top = rect.top + scrollY + rect.height / 2;
            left = rect.right + scrollX + 10;
            break;
        }

        setTooltipPosition({ top, left });
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getTooltipStyles = () => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          ...baseStyles,
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          ...baseStyles,
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return baseStyles;
    }
  };

  const tooltipContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={getTooltipStyles()}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs w-80"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Ayuda
                </h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {content}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 flex-shrink-0"
              aria-label="Cerrar ayuda"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-8 border-transparent ${
              position === 'top'
                ? 'bottom-[-16px] left-1/2 -translate-x-1/2 border-t-gray-200 dark:border-t-gray-700'
                : position === 'bottom'
                ? 'top-[-16px] left-1/2 -translate-x-1/2 border-b-gray-200 dark:border-b-gray-700'
                : position === 'left'
                ? 'right-[-16px] top-1/2 -translate-y-1/2 border-l-gray-200 dark:border-l-gray-700'
                : 'left-[-16px] top-1/2 -translate-y-1/2 border-r-gray-200 dark:border-r-gray-700'
            }`}
          />
          <div
            className={`absolute w-0 h-0 border-8 border-transparent ${
              position === 'top'
                ? 'bottom-[-15px] left-1/2 -translate-x-1/2 border-t-white dark:border-t-gray-800'
                : position === 'bottom'
                ? 'top-[-15px] left-1/2 -translate-x-1/2 border-b-white dark:border-b-gray-800'
                : position === 'left'
                ? 'right-[-15px] top-1/2 -translate-y-1/2 border-l-white dark:border-l-gray-800'
                : 'left-[-15px] top-1/2 -translate-y-1/2 border-r-white dark:border-r-gray-800'
            }`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
              className="inline-flex items-center justify-center rounded-full p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Ayuda para el campo ${fieldId}`}
        aria-expanded={isOpen}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
};

