import React from 'react';
import { cn } from '../../lib/utils';
import './GlassPanel.css';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'medium' | 'strong';
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = 'medium', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel',
          `glass-${variant}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';
