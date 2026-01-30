import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';

interface AnimatedButtonProps extends ButtonProps {
  delay?: number;
  duration?: number;
  scale?: number;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  delay = 0,
  duration = 0.2,
  scale = 0.95,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale,
        transition: { duration: 0.1 }
      }}
    >
      <Button {...props}>
        {children}
      </Button>
    </motion.div>
  );
};
