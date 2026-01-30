import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  delay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  delay = 0
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
