import React from 'react';
import { motion } from 'framer-motion';

interface ProgressAnimationProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressAnimation: React.FC<ProgressAnimationProps> = ({ 
  progress, 
  className = '',
  showPercentage = true,
  animated = true
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">Progreso de Negociación</span>
        {showPercentage && (
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        )}
      </div>
      
      <div className="w-full bg-muted rounded-full h-2.5">
        <motion.div
          className="bg-primary h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={animated ? { 
            duration: 1, 
            ease: "easeOut" 
          } : { duration: 0 }}
        />
      </div>
      
      {/* Milestone indicators */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span className={progress >= 20 ? 'text-primary font-medium' : ''}>
          Oferta Enviada
        </span>
        <span className={progress >= 40 ? 'text-primary font-medium' : ''}>
          Visita Completada
        </span>
        <span className={progress >= 60 ? 'text-primary font-medium' : ''}>
          Precio Acordado
        </span>
        <span className={progress >= 80 ? 'text-primary font-medium' : ''}>
          Condiciones
        </span>
        <span className={progress >= 100 ? 'text-primary font-medium' : ''}>
          ¡Completado!
        </span>
      </div>
    </div>
  );
};
