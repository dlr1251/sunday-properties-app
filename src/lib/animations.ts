/**
 * Sunday Premium Design System - Animation Variants
 * 
 * Reusable Framer Motion animation variants for consistent,
 * smooth micro-interactions throughout the application.
 * 
 * Usage:
 * import { fadeInUp, staggerContainer } from '@/lib/animations';
 * 
 * <motion.div variants={staggerContainer} initial="hidden" animate="visible">
 *   <motion.div variants={fadeInUp}>Content</motion.div>
 * </motion.div>
 */

import type { Variants } from 'framer-motion';

// Easing curves for natural motion
export const easings = {
  // Apple-style smooth ease
  smooth: [0.25, 0.4, 0.25, 1],
  // Bouncy for playful interactions
  bounce: [0.68, -0.55, 0.265, 1.55],
  // Quick and snappy
  snappy: [0.16, 1, 0.3, 1],
  // Gradual deceleration
  decelerate: [0, 0.55, 0.45, 1],
} as const;

// ============================================
// FADE VARIANTS
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.2,
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
};

// ============================================
// SCALE VARIANTS
// ============================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: easings.snappy,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.15,
    },
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

// ============================================
// SLIDE VARIANTS
// ============================================

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.decelerate,
    },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: {
      duration: 0.3,
    },
  },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: easings.decelerate,
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: 0.25,
    },
  },
};

// ============================================
// CONTAINER VARIANTS (for staggered children)
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// ============================================
// HOVER ANIMATIONS
// ============================================

export const hoverLift = {
  whileHover: { y: -4, scale: 1.01 },
  whileTap: { scale: 0.99 },
  transition: { duration: 0.25, ease: easings.smooth },
};

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2, ease: easings.smooth },
};

export const hoverGrow = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

// ============================================
// PAGE TRANSITIONS
// ============================================

export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================
// MODAL/DIALOG VARIANTS
// ============================================

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, delay: 0.1 },
  },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: easings.snappy,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 5,
    transition: {
      duration: 0.15,
    },
  },
};

// ============================================
// LIST ITEM VARIANTS
// ============================================

export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================
// SKELETON SHIMMER
// ============================================

export const shimmer: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create a delayed variant of any animation
 */
export const withDelay = (variants: Variants, delay: number): Variants => ({
  ...variants,
  visible: {
    ...variants.visible,
    transition: {
      ...(typeof variants.visible === 'object' ? variants.visible.transition : {}),
      delay,
    },
  },
});

/**
 * Create a custom stagger container
 */
export const createStaggerContainer = (
  staggerChildren: number = 0.05,
  delayChildren: number = 0.1
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});
