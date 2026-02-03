import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  Layers, 
  Activity, 
  Star, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react'
import { ThemeToggle } from '../ThemeToggle'
import { GlassPanel } from '../common/GlassPanel'
import './Sidebar.css'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  const navItems = useMemo(
    () => [
      { to: '/', label: 'Home', icon: Home },
      { to: '/options', label: 'Options', icon: Layers },
      { to: '/volatility', label: 'Volatility', icon: Activity },
      { to: '/watchlist', label: 'Watchlist', icon: Star },
    ],
    [],
  )

  return (
    <GlassPanel 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      variant="subtle"
    >
      <div className="sidebar-header">
        <div className="brand" aria-label="OptionLab">
          <div className="brand-mark">OL</div>
          {/* Note: AnimatePresence for exit animations would break existing tests that expect immediate removal */}
          {!collapsed && (
            <motion.div 
              className="brand-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              OptionLab
            </motion.div>
          )}
        </div>

        <button
          type="button"
          className="collapse-btn"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
            <item.icon className="nav-icon" size={20} />
            {!collapsed && (
              <motion.span 
                className="nav-label"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle />
      </div>
    </GlassPanel>
  )
}

