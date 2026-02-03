import { GlassPanel } from '../../common/GlassPanel'
import './Achievements.css'

export type AchievementBadgeProps = {
  id: string
  title: string
  description: string
  unlocked: boolean
}

export function AchievementBadge({ id, title, description, unlocked }: AchievementBadgeProps) {
  return (
    <GlassPanel
      variant="subtle"
      className={`achievement-badge${unlocked ? ' unlocked' : ' locked'}`}
      data-testid={`achievement-${id}`}
    >
      <div className="achievement-badge-top">
        <div className="achievement-title">{title}</div>
        <div
          className={`achievement-state${unlocked ? ' unlocked' : ''}`}
          data-testid={`achievement-${id}-state`}
        >
          {unlocked ? 'Unlocked' : 'Locked'}
        </div>
      </div>
      <div className="achievement-description">{description}</div>
    </GlassPanel>
  )
}
