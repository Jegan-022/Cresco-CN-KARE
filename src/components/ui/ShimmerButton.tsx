import React from 'react';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'orange' | 'cyan' | 'purple' | 'emerald' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  className = '',
  icon,
  ...props
}) => {
  const variantStyles = {
    orange: {
      borderGradient: 'from-orange-500 via-amber-400 to-orange-600',
      glow: 'shadow-[0_0_24px_rgba(234,88,12,0.35)] hover:shadow-[0_0_36px_rgba(234,88,12,0.55)]',
      bg: 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500',
      text: 'text-white',
    },
    cyan: {
      borderGradient: 'from-cyan-500 via-sky-400 to-blue-600',
      glow: 'shadow-[0_0_24px_rgba(6,182,212,0.35)] hover:shadow-[0_0_36px_rgba(6,182,212,0.55)]',
      bg: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
      text: 'text-white',
    },
    purple: {
      borderGradient: 'from-purple-500 via-pink-400 to-indigo-600',
      glow: 'shadow-[0_0_24px_rgba(168,85,247,0.35)] hover:shadow-[0_0_36px_rgba(168,85,247,0.55)]',
      bg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500',
      text: 'text-white',
    },
    emerald: {
      borderGradient: 'from-emerald-500 via-teal-400 to-green-600',
      glow: 'shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:shadow-[0_0_36px_rgba(16,185,129,0.55)]',
      bg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
      text: 'text-white',
    },
    ghost: {
      borderGradient: 'from-white/20 via-white/40 to-white/10',
      glow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]',
      bg: 'bg-[#181926]/80 hover:bg-[#202234] border border-white/10 hover:border-white/25',
      text: 'text-slate-200 hover:text-white',
    },
  };

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 font-bold',
  };

  const selectedVariant = variantStyles[variant];

  return (
    <button
      className={`group relative inline-flex items-center justify-center font-semibold transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98] ${selectedVariant.glow} ${sizeStyles[size]} ${selectedVariant.bg} ${selectedVariant.text} ${className}`}
      {...props}
    >
      {/* Moving Shimmer Beam Highlight */}
      <span className="absolute inset-0 w-full h-full block overflow-hidden rounded-[inherit] pointer-events-none">
        <span className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-r from-transparent via-white/15 to-transparent rotate-45 transform transition-transform duration-1000 group-hover:translate-x-full group-hover:translate-y-full" />
      </span>

      {icon && <span className="relative z-10 transition-transform duration-200 group-hover:scale-110">{icon}</span>}
      <span className="relative z-10 tracking-wide">{children}</span>
    </button>
  );
};

export default ShimmerButton;
