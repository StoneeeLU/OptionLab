import type { ReactNode } from 'react'
import { Sidebar } from '../Sidebar'
import './Layout.css'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="layout-root">
      <Sidebar />
      <main className="layout-main">{children}</main>
    </div>
  )
}
