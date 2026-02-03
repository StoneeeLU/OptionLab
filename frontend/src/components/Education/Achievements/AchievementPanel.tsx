import { useEffect, useMemo, useRef, useState } from 'react'

import { useAchievements } from '../../../hooks/useAchievements'
import { GlassPanel } from '../../common/GlassPanel'
import { AchievementBadge } from './AchievementBadge'
import './Achievements.css'

export function AchievementPanel() {
  const { achievements, unlockedCount, totalCount } = useAchievements()

  const prevUnlockedRef = useRef<number>(unlockedCount)
  const [toast, setToast] = useState<string | null>(null)
  const timersRef = useRef<{ show?: number; hide?: number }>({})

  const newlyUnlocked = useMemo(() => {
    const unlocked = achievements.filter((a) => a.unlocked)
    return unlocked
  }, [achievements])

  useEffect(() => {
    const timers = timersRef.current

    const prev = prevUnlockedRef.current
    prevUnlockedRef.current = unlockedCount

    if (unlockedCount > prev) {
      const latest = newlyUnlocked[newlyUnlocked.length - 1]
      if (latest) {
        if (timers.show) window.clearTimeout(timers.show)
        if (timers.hide) window.clearTimeout(timers.hide)

        timers.show = window.setTimeout(() => {
          setToast(`Unlocked: ${latest.title}`)
        }, 0)

        timers.hide = window.setTimeout(() => {
          setToast(null)
        }, 1800)
      }
    }

    return () => {
      if (timers.show) window.clearTimeout(timers.show)
      if (timers.hide) window.clearTimeout(timers.hide)
    }
  }, [newlyUnlocked, unlockedCount])

  return (
    <div className="achievement-panel" data-testid="achievement-panel">
      <GlassPanel variant="subtle" className="achievement-panel-header">
        <div>
          <h3>Achievements</h3>
          <p className="subtitle">
            {unlockedCount}/{totalCount} unlocked
          </p>
        </div>
        {toast && (
          <div className="achievement-toast" data-testid="achievement-toast">
            {toast}
          </div>
        )}
      </GlassPanel>

      <div className="achievement-grid">
        {achievements.map((a) => (
          <AchievementBadge
            key={a.id}
            id={a.id}
            title={a.title}
            description={a.description}
            unlocked={a.unlocked}
          />
        ))}
      </div>
    </div>
  )
}
