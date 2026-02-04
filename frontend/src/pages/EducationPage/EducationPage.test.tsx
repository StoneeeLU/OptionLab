import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EducationPage } from './EducationPage'

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null
  rootMargin: string = ''
  thresholds: ReadonlyArray<number> = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn().mockReturnValue([])
  constructor() {}
}
window.IntersectionObserver = MockIntersectionObserver

// Mock scrollIntoView
window.scrollTo = vi.fn()

describe('EducationPage', () => {
  it('renders the heading and layout', () => {
    render(
      <MemoryRouter>
        <EducationPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /options/i })).toBeInTheDocument()
    expect(screen.getByTestId('language-toggle')).toBeInTheDocument()
    
    // Check for Sidebar and Content
    expect(screen.getByTestId('education-sidebar')).toBeInTheDocument()
  })

  it('renders sidebar navigation with links', () => {
    render(
      <MemoryRouter>
        <EducationPage />
      </MemoryRouter>,
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    const links = screen.getAllByRole('link')
    
    // Verify some expected links
    const chapterIds = ['basics', 'pricing', 'greeks', 'iv', 'strategies']
    chapterIds.forEach(id => {
       const link = links.find(l => l.getAttribute('href') === `#${id}`)
       expect(link).toBeInTheDocument()
    })

    // Progress indicator should be present
    expect(screen.getByTestId('education-progress')).toBeInTheDocument()
  })

  it('renders only the active chapter (defaults to basics)', () => {
     const { container } = render(
      <MemoryRouter>
        <EducationPage />
      </MemoryRouter>,
    )
    
    // Expect basics
    expect(container.querySelector('section#basics')).toBeInTheDocument()
    
    // Expect others NOT to be there
    expect(container.querySelector('section#pricing')).not.toBeInTheDocument()
    expect(container.querySelector('section#greeks')).not.toBeInTheDocument()
  })

  it('switches chapter when sidebar link clicked', async () => {
    const { container } = render(
     <MemoryRouter>
       <EducationPage />
     </MemoryRouter>,
   )
   
   // Start at basics
   expect(container.querySelector('section#basics')).toBeInTheDocument()
   
   // Click Pricing
   const links = screen.getAllByRole('link')
   const pricingLink = links.find(l => l.getAttribute('href') === '#pricing')!
   fireEvent.click(pricingLink)
   
   // Wait for pricing to appear
   await waitFor(() => {
     expect(container.querySelector('section#pricing')).toBeInTheDocument()
   })
 })
})
