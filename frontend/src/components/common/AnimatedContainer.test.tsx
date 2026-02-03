import { render, screen } from '@testing-library/react';
import { AnimatedContainer } from './AnimatedContainer';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('AnimatedContainer', () => {
  beforeEach(() => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders children correctly', () => {
    render(<AnimatedContainer>Content</AnimatedContainer>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('respects prefers-reduced-motion', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<AnimatedContainer>Motion Reduced</AnimatedContainer>);
    expect(screen.getByText('Motion Reduced')).toBeInTheDocument();
  });

  it('merges custom classes', () => {
    const { container } = render(<AnimatedContainer className="test-class">Content</AnimatedContainer>);
    expect(container.firstChild).toHaveClass('test-class');
  });
});
