import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverEffect = true, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-xl border border-primary/10 overflow-hidden',
          'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
          hoverEffect && 'transition-all duration-300 hover:shadow-[0_8px_30px_rgba(201,151,42,0.12)] hover:-translate-y-1',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
