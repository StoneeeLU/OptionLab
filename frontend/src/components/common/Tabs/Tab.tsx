import type { ReactNode } from 'react'
import { useTabs } from './Tabs'

interface TabProps {
  id: string
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function Tab({ id, children, className = '', disabled = false }: TabProps) {
  const { activeTab, setActiveTab } = useTabs()
  const isActive = activeTab === id

  return (
    <button
      id={`tab-${id}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      tabIndex={isActive ? 0 : -1}
      className={`education-tab ${isActive ? 'active' : ''} ${className}`}
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  )
}
