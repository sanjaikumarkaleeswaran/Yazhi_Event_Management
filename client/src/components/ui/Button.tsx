import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  to?: string;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  to,
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center px-8 py-3 font-medium transition-all duration-300 ease-out relative overflow-hidden group';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-[0_4px_14px_0_rgba(201,151,42,0.39)] hover:shadow-[0_6px_20px_rgba(201,151,42,0.23)] hover:-translate-y-0.5 rounded-md',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 shadow-[0_4px_14px_0_rgba(122,17,40,0.39)] hover:shadow-[0_6px_20px_rgba(122,17,40,0.23)] hover:-translate-y-0.5 rounded-md',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-md',
  };

  const buttonClasses = twMerge(clsx(baseStyles, variants[variant], className));

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {variant !== 'outline' && (
        <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out"></div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button className={buttonClasses} {...props}>
      {content}
    </button>
  );
};
