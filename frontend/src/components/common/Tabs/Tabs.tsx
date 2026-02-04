import type { ReactNode } from 'react'
import {
  useEffect,
  useState,
  useCallback,
} from 'react'
import { TabsContext } from './TabsContext'
import './Tabs.css'

interface TabsProps {
  children: ReactNode
  defaultTab: string
  className?: string
}

export function Tabs({ children, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Sync with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        setActiveTab(hash)
      }
    }

    // Initial check
    handleHashChange()

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id)
    window.location.hash = id
  }, [])

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={`tabs-container ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}
