import type { ReactNode } from 'react'
import { useTabs } from './Tabs'
import { motion } from 'framer-motion'

interface TabPanelProps {
  id: string
  children: ReactNode
  className?: string
}

export function TabPanel({ id, children, className = '' }: TabPanelProps) {
  const { activeTab } = useTabs()
  const isActive = activeTab === id

  if (!isActive) return null

  return (
    <div
      id={`panel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`tab-panel ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  )
}
