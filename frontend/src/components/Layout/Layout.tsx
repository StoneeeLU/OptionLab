import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from '../Sidebar'
import { AnimatedContainer } from '../common/AnimatedContainer'
import './Layout.css'

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  
  return (
    <div className="layout-root">
      <Sidebar />
      <main className="layout-main">
        <AnimatedContainer 
          key={location.pathname}
          animation="fadeIn"
          className="layout-content"
        >
          {children}
        </AnimatedContainer>
      </main>
    </div>
  )
}

