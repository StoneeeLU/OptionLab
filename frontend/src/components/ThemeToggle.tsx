import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 0.9,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="theme-icon-wrapper"
      >
        {isDark ? (
          <Moon size={18} className="theme-icon" />
        ) : (
          <Sun size={18} className="theme-icon" />
        )}
      </motion.div>
      <span className="theme-label">{isDark ? 'Light' : 'Dark'}</span>
    </motion.button>
  );
}

