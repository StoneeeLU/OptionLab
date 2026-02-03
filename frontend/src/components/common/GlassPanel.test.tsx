import { render, screen } from '@testing-library/react';
import { GlassPanel } from './GlassPanel';
import { describe, it, expect } from 'vitest';

describe('GlassPanel', () => {
  it('renders children correctly', () => {
    render(<GlassPanel>Test Content</GlassPanel>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<GlassPanel variant="strong">Strong Panel</GlassPanel>);
    expect(container.firstChild).toHaveClass('glass-strong');
  });

  it('applies default variant if none provided', () => {
    const { container } = render(<GlassPanel>Default Panel</GlassPanel>);
    expect(container.firstChild).toHaveClass('glass-medium');
  });

  it('merges custom classes', () => {
    const { container } = render(<GlassPanel className="custom-class">Content</GlassPanel>);
    expect(container.firstChild).toHaveClass('glass-panel', 'custom-class');
  });
});
