import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  hover?: boolean;
  tap?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.3,
  hover = true,
  tap = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? { 
        y: -2, 
        transition: { duration: 0.2 } 
      } : undefined}
      whileTap={tap ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : undefined}
    >
      <Card className={className}>
        {children}
      </Card>
    </motion.div>
  );
};