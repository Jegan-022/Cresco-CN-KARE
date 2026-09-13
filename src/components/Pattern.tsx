import React from 'react';

interface PatternProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Pattern: React.FC<PatternProps> = ({ className = '', children, style = {} }) => {
  return (
    <div
      className={`w-full h-full relative ${className}`}
      style={{
        backgroundImage: 'conic-gradient(#10b981, #059669)',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#10b981',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default Pattern;
