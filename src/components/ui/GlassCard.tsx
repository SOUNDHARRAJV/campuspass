import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  onClick,
  id
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-slate-200 shadow-xs transition-all duration-200 text-[#172033]
        ${glow ? 'border-blue-300 shadow-sm' : 'hover:border-slate-300 hover:shadow-sm'}
        ${onClick ? 'cursor-pointer hover:border-blue-400' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
