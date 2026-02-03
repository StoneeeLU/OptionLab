import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';
import { describe, it, expect } from 'vitest';

describe('Skeleton', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<Skeleton />);
    const element = container.firstChild;
    expect(element).toHaveClass('skeleton', 'skeleton-rect');
    expect(element).toHaveAttribute('role', 'status');
    expect(element).toHaveAttribute('aria-label', 'Loading...');
  });

  it('applies variant classes', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.firstChild).toHaveClass('skeleton-circle');
  });

  it('applies custom dimensions', () => {
    const { container } = render(<Skeleton width="100px" height="50px" />);
    const element = container.firstChild as HTMLElement;
    expect(element.style.width).toBe('100px');
    expect(element.style.height).toBe('50px');
  });

  it('merges custom classes', () => {
    const { container } = render(<Skeleton className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
