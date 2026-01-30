import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface ConfettiAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ 
  isActive, 
  onComplete 
}) => {
  useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const confettiPieces = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            delay: Math.random() * 2,
            ease: "easeOut",
          }}
        />
      ))}
      
      {/* Success message */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="bg-green-500 text-white px-8 py-4 rounded-lg shadow-lg text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            🎉 ¡Oferta Aceptada! 🎉
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
