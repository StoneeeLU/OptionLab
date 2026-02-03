import { useMemo, useState, type ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import { ThemeToggle } from '../ThemeToggle'
import './Sidebar.css'

type NavItem = {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 10.5L12 3l9 7.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h14V9.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 21v-6h5v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChainIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 7h16" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17h16" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 7v10" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 7v10" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function SurfaceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 19V5" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 19h16" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 16.5l4-5 4 2 4.5-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 11.5l-2-2" strokeWidth="2" strokeLinecap="round" />
      <path d="M14.5 13.5l-2-2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M12 2l3 7 7 .6-5.4 4.6 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.6 9 9l3-7z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  const navItems = useMemo<NavItem[]>(
    () => [
      { to: '/', label: 'Home', icon: HomeIcon },
      { to: '/options', label: 'Options', icon: ChainIcon },
      { to: '/volatility', label: 'Volatility', icon: SurfaceIcon },
      { to: '/watchlist', label: 'Watchlist', icon: StarIcon },
    ],
    [],
  )

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand" aria-label="OptionLab">
          <div className="brand-mark">OL</div>
          {!collapsed && <div className="brand-text">OptionLab</div>}
        </div>

        <button
          type="button"
          className="collapse-btn"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <span className="collapse-glyph" aria-hidden>
            {collapsed ? '›' : '‹'}
          </span>
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <item.icon className="nav-icon" />
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle />
      </div>
    </aside>
  )
}
