import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  horizontal?: boolean;
}

function LogoIcon({ size, color, yellow, variant }: {
  size: number;
  color: string;
  yellow: string;
  variant: 'dark' | 'light';
}): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="26,6 48,16 26,26 4,16" fill={color} />
      <polygon points="26,26 38,20 38,30 26,36 14,30 14,20" fill={variant === 'light' ? 'rgba(255,255,255,0.7)' : '#2A4DA0'} />
      <rect x="41" y="16" width="3" height="12" rx="1.5" fill={yellow} />
      <circle cx="42.5" cy="30" r="2.5" fill={yellow} />
      <rect x="8" y="34" width="36" height="12" rx="4" fill={color} />
      <path d="M14 34 L18 27 L34 27 L38 34 Z" fill={color} />
      <rect x="19" y="28" width="7" height="5" rx="1" fill={variant === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.5)'} />
      <rect x="27" y="28" width="7" height="5" rx="1" fill={variant === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.5)'} />
      <circle cx="16" cy="46" r="4" fill={variant === 'light' ? '#e0e0e0' : '#1A3785'} stroke={variant === 'light' ? '#fff' : '#0d2060'} strokeWidth="2" />
      <circle cx="36" cy="46" r="4" fill={variant === 'light' ? '#e0e0e0' : '#1A3785'} stroke={variant === 'light' ? '#fff' : '#0d2060'} strokeWidth="2" />
    </svg>
  );
}

export function RideSalleLogo({ variant = 'dark', size = 'md', showTagline = false, horizontal = false }: Props): ReactElement {
  const iconSize = size === 'sm' ? 28 : size === 'md' ? 52 : 72;
  const titleClass = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl';
  const color = variant === 'light' ? '#FFFFFF' : '#1A3785';
  const yellow = '#F5B800';

  if (horizontal) {
    return (
      <div className="flex items-center gap-2">
        <LogoIcon size={iconSize} color={color} yellow={yellow} variant={variant} />
        <span className={cn('font-bold tracking-tight leading-none', titleClass, variant === 'light' ? 'text-white' : 'text-[#1A3785]')}>
          Ride<span style={{ color: yellow }}>Salle</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <LogoIcon size={iconSize} color={color} yellow={yellow} variant={variant} />
      <div className={cn('font-bold tracking-tight', titleClass, variant === 'light' ? 'text-white' : 'text-[#1A3785]')}>
        Ride<span style={{ color: yellow }}>Salle</span>
      </div>
      {showTagline && (
        <p className={cn('text-xs', variant === 'light' ? 'text-white/70' : 'text-muted-foreground')}>
          Your Path to Education
        </p>
      )}
    </div>
  );
}
