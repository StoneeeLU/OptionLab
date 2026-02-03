import React from 'react';
import { cn } from '../../lib/utils';
import './Skeleton.css';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({
  className,
  variant = 'rect',
  width,
  height,
  style,
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={cn(
        'skeleton',
        `skeleton-${variant}`,
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      role="status"
      aria-busy="true"
      aria-label="Loading..."
      {...props}
    />
  );
};
