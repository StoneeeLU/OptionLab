import { createContext, useContext } from 'react'

export interface TabsContextType {
  activeTab: string
  setActiveTab: (id: string) => void
}

export const TabsContext = createContext<TabsContextType | undefined>(undefined)

export function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('useTabs must be used within a Tabs provider')
  }
  return context
}
