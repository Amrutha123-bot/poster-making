import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div className={`${glow ? 'glass-card-glow' : 'glass-card'} p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}
