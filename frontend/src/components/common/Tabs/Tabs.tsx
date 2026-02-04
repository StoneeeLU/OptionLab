import type { ReactNode } from 'react'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import './Tabs.css'

interface TabsContextType {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('useTabs must be used within a Tabs provider')
  }
  return context
}

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
