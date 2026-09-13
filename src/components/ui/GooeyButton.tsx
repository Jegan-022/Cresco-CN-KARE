import React from 'react';

export interface GooeyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const GooeyButton: React.FC<GooeyButtonProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  let sizeStyle = 'px-5 py-2.5 text-xs';
  if (size === 'sm') sizeStyle = 'px-3.5 py-1.5 text-[11px]';
  if (size === 'lg') sizeStyle = 'px-7 py-3.5 text-sm';

  const variantClass = `c-button--gooey-${variant}`;

  return (
    <button
      {...props}
      disabled={disabled}
      className={`c-button c-button--gooey ${variantClass} ${sizeStyle} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <div className="c-button__blobs" aria-hidden="true">
        <div />
        <div />
        <div />
      </div>
    </button>
  );
};
