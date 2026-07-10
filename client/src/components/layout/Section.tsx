import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ children, className, ...props }) => {
  return (
    <section className={twMerge(clsx('py-12 md:py-20', className))} {...props}>
      {children}
    </section>
  );
};
