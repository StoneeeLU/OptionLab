import { render, screen, fireEvent, within } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { EducationSidebar } from './EducationSidebar'

// Mock hooks
const mockT = vi.fn((key) => key)
vi.mock('../../../i18n/I18nContext', () => ({
  useI18n: () => ({ t: mockT }),
}))

const mockProgress = {
  completedChapters: ['basics'],
  quizScores: {},
  achievements: [],
  version: 1,
}

vi.mock('../../../hooks/useEducationProgress', () => ({
  useEducationProgress: () => ({
    progress: mockProgress,
  }),
}))

// Mock Assets
vi.mock('../../../assets/education/basics-icon.svg', () => ({ default: 'basics-icon.svg' }))
vi.mock('../../../assets/education/pricing-icon.svg', () => ({ default: 'pricing-icon.svg' }))
vi.mock('../../../assets/education/greeks-icon.svg', () => ({ default: 'greeks-icon.svg' }))
vi.mock('../../../assets/education/iv-icon.svg', () => ({ default: 'iv-icon.svg' }))
vi.mock('../../../assets/education/strategies-icon.svg', () => ({ default: 'strategies-icon.svg' }))
vi.mock('../../../assets/education/chapter-complete.svg', () => ({ default: 'chapter-complete.svg' }))
vi.mock('../../../assets/education/progress-badge.svg', () => ({ default: 'progress-badge.svg' }))

describe('EducationSidebar', () => {
  const defaultProps = {
    activeId: 'basics',
    onNavigate: vi.fn(),
  }

  it('renders all chapters', () => {
    render(<EducationSidebar {...defaultProps} />)
    const card = screen.getByTestId('education-sidebar-card')
    
    expect(within(card).getByText('education.chapters.basics')).toBeInTheDocument()
    expect(within(card).getByText('education.chapters.pricing')).toBeInTheDocument()
    expect(within(card).getByText('education.chapters.greeks')).toBeInTheDocument()
    expect(within(card).getByText('education.chapters.iv')).toBeInTheDocument()
    expect(within(card).getByText('education.chapters.strategies')).toBeInTheDocument()
  })

  it('shows progress indicator correctly', async () => {
    render(<EducationSidebar {...defaultProps} />)
    
    // 1 chapter completed (basics) out of 5 = 20%
    // Note: Text is split for animation (<span>20</span>%), so we check for "20"
    // Using findByText to account for potential animation delay
    expect(await screen.findByText('20')).toBeInTheDocument()
    expect(screen.getByText('1/5')).toBeInTheDocument()
  })

  it('highlights active chapter based on prop', () => {
    render(<EducationSidebar {...defaultProps} activeId="greeks" />)
    
    const card = screen.getByTestId('education-sidebar-card')
    const greeksTab = within(card).getByText('education.chapters.greeks').closest('a')
    expect(greeksTab).toHaveClass('active')
    
    const basicsTab = within(card).getByText('education.chapters.basics').closest('a')
    expect(basicsTab).not.toHaveClass('active')
  })

  it('navigates when clicked', () => {
    const onNavigate = vi.fn()
    render(<EducationSidebar {...defaultProps} onNavigate={onNavigate} />)
    
    const card = screen.getByTestId('education-sidebar-card')
    const strategiesLink = within(card).getByText('education.chapters.strategies')
    fireEvent.click(strategiesLink)
    
    expect(onNavigate).toHaveBeenCalledWith('strategies')
  })
})
