import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className,
  delay = 0,
  direction = 'up',
}) => {
  const prefersReducedMotion = useReducedMotion();

  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  const hiddenState = {
    opacity: 0,
    ...(directionOffset[direction] || { y: 40 }),
  };

  if (prefersReducedMotion) {
    return <div className={twMerge(clsx('', className))}>{children}</div>;
  }

  return (
    <motion.div
      initial={hiddenState}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={twMerge(clsx('', className))}
    >
      {children}
    </motion.div>
  );
};
