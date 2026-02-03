import { useCallback, useMemo, useSyncExternalStore } from 'react'

export type EducationProgress = {
  completedChapters: string[]
  quizScores: Record<string, number>
  achievements: string[]
  version: number
}

const STORAGE_KEY = 'optionlab:education:v1'
const SCHEMA_VERSION = 1

const DEFAULT_PROGRESS: EducationProgress = {
  completedChapters: [],
  quizScores: {},
  achievements: [],
  version: SCHEMA_VERSION,
}

function readStoredProgress(): EducationProgress {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_PROGRESS

  try {
    const parsed = JSON.parse(raw) as EducationProgress
    
    // Basic validation
    if (parsed.version !== SCHEMA_VERSION) {
      return DEFAULT_PROGRESS
    }

    if (!Array.isArray(parsed.completedChapters) || !parsed.quizScores || !Array.isArray(parsed.achievements)) {
      return DEFAULT_PROGRESS
    }

    return parsed
  } catch {
    return DEFAULT_PROGRESS
  }
}

function writeStoredProgress(progress: EducationProgress) {
  const raw = JSON.stringify(progress)
  localStorage.setItem(STORAGE_KEY, raw)
  return raw
}

let cachedProgress: EducationProgress = DEFAULT_PROGRESS
let cachedRaw: string | null = null

function getCachedProgress(): EducationProgress {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === cachedRaw) return cachedProgress

  cachedRaw = raw
  cachedProgress = readStoredProgress()
  return cachedProgress
}

const listeners = new Set<() => void>()

function setStore(updater: (prev: EducationProgress) => EducationProgress) {
  const next = updater(getCachedProgress())
  cachedRaw = writeStoredProgress(next)
  cachedProgress = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return getCachedProgress()
}

export function useEducationProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const markChapterComplete = useCallback((chapterId: string) => {
    setStore((prev) => {
      if (prev.completedChapters.includes(chapterId)) return prev
      return {
        ...prev,
        completedChapters: [...prev.completedChapters, chapterId],
      }
    })
  }, [])

  const updateQuizScore = useCallback((chapterId: string, score: number) => {
    setStore((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [chapterId]: Math.max(prev.quizScores[chapterId] || 0, score),
      },
    }))
  }, [])

  const unlockAchievement = useCallback((achievementId: string) => {
    setStore((prev) => {
      if (prev.achievements.includes(achievementId)) return prev
      return {
        ...prev,
        achievements: [...prev.achievements, achievementId],
      }
    })
  }, [])

  const getProgress = useCallback(() => progress, [progress])

  const resetProgress = useCallback(() => {
    setStore(() => DEFAULT_PROGRESS)
  }, [])

  return useMemo(
    () => ({
      progress,
      markChapterComplete,
      updateQuizScore,
      unlockAchievement,
      getProgress,
      resetProgress,
    }),
    [progress, markChapterComplete, updateQuizScore, unlockAchievement, getProgress, resetProgress],
  )
}
