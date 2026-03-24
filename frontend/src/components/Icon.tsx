import React from 'react';
import { IconType } from 'react-icons';

// Wrapper to fix react-icons + React 18 JSX type mismatch
export const Icon: React.FC<{ icon: IconType; size?: number; className?: string }> = ({ icon: IconComponent, size = 20, className }) => {
  return React.createElement(IconComponent as any, { size, className });
};
