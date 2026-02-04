import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ContractDiagram } from './ContractDiagram'

// Mock the useI18n hook
vi.mock('../../../i18n/I18nContext', () => ({
  useI18n: () => ({
    language: 'en',
    t: (key: string) => key
  })
}))

describe('ContractDiagram', () => {
  it('renders the contract diagram with default props', () => {
    render(<ContractDiagram />)
    
    // Check for default values
    expect(screen.getByText('Call Option')).toBeInTheDocument()
    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('$150')).toBeInTheDocument()
    expect(screen.getByText('Mar 21, 2025')).toBeInTheDocument()
    expect(screen.getByText('$5.25')).toBeInTheDocument()
  })

  it('renders with custom props', () => {
    render(
      <ContractDiagram 
        type="put"
        underlying="GOOGL"
        strike="$2000"
        expiry="Dec 2025"
        premium="$10.00"
      />
    )
    
    expect(screen.getByText('Put Option')).toBeInTheDocument()
    expect(screen.getByText('GOOGL')).toBeInTheDocument()
    expect(screen.getByText('$2000')).toBeInTheDocument()
    expect(screen.getByText('Dec 2025')).toBeInTheDocument()
    expect(screen.getByText('$10.00')).toBeInTheDocument()
  })

  it('shows information on hover', () => {
    render(<ContractDiagram />)
    
    // Initially shows placeholder
    expect(screen.getByText('Hover over parts of the contract to learn more')).toBeInTheDocument()
    
    // Hover over Underlying
    const underlyingSection = screen.getByText('Underlying Asset').closest('.contract-section')
    expect(underlyingSection).toBeTruthy()
    if (underlyingSection) {
      fireEvent.mouseEnter(underlyingSection)
      expect(screen.getByText(/The actual asset/)).toBeInTheDocument()
    }

    // Hover over Strike
    const strikeSection = screen.getByText('Strike Price').closest('.contract-section')
    expect(strikeSection).toBeTruthy()
    if (strikeSection) {
      fireEvent.mouseEnter(strikeSection)
      expect(screen.getByText(/pre-agreed price/)).toBeInTheDocument()
    }
  })
})
