/**
 * Overview: constants.tsx
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */


import React from 'react';

export const COLORS = {
  deepBlue: '#1E3A5F',
  insightTeal: '#1FA2A6',
  signalAmber: '#F2A900',
  softWhite: '#F7F9FC',
  charcoalSlate: '#2B2E34'
};

interface IconProps {
  color?: string;
  size?: number;
  className?: string;
}

export const VaneIcon: React.FC<IconProps> = ({ color = '#1FA2A6', size = 24, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M50 5L90 95L50 75L10 95L50 5Z" 
      stroke={color} 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M50 5V75" 
      stroke={color} 
      strokeWidth="6" 
      strokeLinecap="round" 
    />
    <circle cx="50" cy="50" r="10" fill={color} fillOpacity="0.2" />
  </svg>
);
