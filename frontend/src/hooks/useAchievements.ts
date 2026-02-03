import { useMemo } from 'react'
import { useEducationProgress } from './useEducationProgress'

export type Achievement = {
  id: string
  title: string
  description: string
  unlocked: boolean
}

export const ACHIEVEMENTS_LIST = [
  {
    id: 'first_chapter',
    title: 'First Steps',
    description: 'Complete your first chapter.',
  },
  {
    id: 'perfect_quiz',
    title: 'A+ Student',
    description: 'Get a 100% score on any quiz.',
  },
  {
    id: 'all_complete',
    title: 'Options Master',
    description: 'Complete all education chapters.',
  },
] as const

export function useAchievements() {
  const { progress } = useEducationProgress()

  const achievements = useMemo(() => {
    return ACHIEVEMENTS_LIST.map((achievement) => {
      const isUnlockedInStore = progress.achievements.includes(achievement.id)
      
      // Check for auto-unlock conditions
      let shouldUnlock = isUnlockedInStore

      if (!isUnlockedInStore) {
        if (achievement.id === 'first_chapter' && progress.completedChapters.length > 0) {
          shouldUnlock = true
        } else if (achievement.id === 'perfect_quiz' && Object.values(progress.quizScores).some(score => score === 100)) {
          shouldUnlock = true
        }
        // 'all_complete' would need to know the total number of chapters, 
        // which we don't have yet, so it stays as is for now.
      }

      // If we found a new achievement, we should ideally trigger unlockAchievement,
      // but doing it during render is bad. 
      // However, the task says "data model only", so we just return the state.
      
      return {
        ...achievement,
        unlocked: shouldUnlock,
      }
    })
  }, [progress.achievements, progress.completedChapters.length, progress.quizScores])

  return {
    achievements,
    unlockedCount: achievements.filter(a => a.unlocked).length,
    totalCount: achievements.length,
  }
}
