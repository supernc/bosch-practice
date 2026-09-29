import { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]',
  secondary:
    'bg-bg-card text-text-primary border border-white/10 hover:border-white/20 hover:bg-bg-tertiary active:scale-[0.98]',
  outline:
    'bg-transparent text-primary-light border border-primary/30 hover:bg-primary/10 active:scale-[0.98]',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  danger:
    'bg-danger/15 text-danger border border-danger/20 hover:bg-danger/25 active:scale-[0.98]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        'font-medium transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
