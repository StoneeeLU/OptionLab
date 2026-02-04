import type { ReactNode, KeyboardEvent } from 'react'
import { useRef } from 'react'

interface TabListProps {
  children: ReactNode
  className?: string
  'aria-label'?: string
}

export function TabList({ children, className = '', 'aria-label': ariaLabel }: TabListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: KeyboardEvent) => {
    const tabs = listRef.current?.querySelectorAll('[role="tab"]:not([disabled])')
    if (!tabs) return

    const tabArray = Array.from(tabs) as HTMLElement[]
    const currentIndex = tabArray.indexOf(document.activeElement as HTMLElement)

    let nextIndex = -1

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % tabArray.length
        break
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + tabArray.length) % tabArray.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = tabArray.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    if (nextIndex !== -1) {
      tabArray[nextIndex].focus()
      tabArray[nextIndex].click()
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      className={`tab-list ${className}`}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  )
}
