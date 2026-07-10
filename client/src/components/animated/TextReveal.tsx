import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}

export const TextReveal: React.FC<TextRevealProps> = ({ text, className, delay = 0, as: Component = 'div' }) => {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(' ');

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: delay },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  if (prefersReducedMotion) {
    return <Component className={twMerge(clsx('', className))}>{text}</Component>;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={twMerge(clsx('flex flex-wrap', className))}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="mr-2 mb-2 inline-block">
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};
