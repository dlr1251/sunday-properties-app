import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  duration?: number;
  delay?: number;
  showPercentage?: boolean;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  className = '',
  duration = 1,
  delay = 0,
  showPercentage = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const percentage = Math.min((displayValue / max) * 100, 100);

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ 
          duration, 
          delay,
          ease: "easeOut"
        }}
      >
        <Progress 
          value={percentage} 
          className="h-2"
        />
        {showPercentage && (
          <motion.div
            className="text-sm text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + duration * 0.5 }}
          >
            {Math.round(percentage)}%
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
