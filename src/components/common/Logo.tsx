import React from 'react';
import { AitecLogo } from './AitecLogo';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  variant = 'dark',
}) => {
  const sizeMap: Record<'sm' | 'md' | 'lg', 'sm' | 'md' | 'lg'> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  };

  return (
    <AitecLogo
      size={sizeMap[size]}
      theme={variant === 'light' ? 'dark' : 'light'}
      showArabicSub={showSubtitle}
      className={className}
    />
  );
};
