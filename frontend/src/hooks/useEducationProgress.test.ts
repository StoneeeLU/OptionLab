import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useEducationProgress } from './useEducationProgress'

const STORAGE_KEY = 'optionlab:education:v1'

describe('useEducationProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with default values when localStorage is empty', () => {
    const { result } = renderHook(() => useEducationProgress())
    expect(result.current.progress.completedChapters).toEqual([])
    expect(result.current.progress.quizScores).toEqual({})
    expect(result.current.progress.achievements).toEqual([])
  })

  it('markChapterComplete adds chapter and persists to localStorage', () => {
    const { result } = renderHook(() => useEducationProgress())

    act(() => {
      result.current.markChapterComplete('intro')
    })

    expect(result.current.progress.completedChapters).toContain('intro')

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBeTruthy()
    const stored = JSON.parse(raw as string)
    expect(stored.completedChapters).toContain('intro')
  })

  it('updateQuizScore persists score and keeps the highest', () => {
    const { result } = renderHook(() => useEducationProgress())

    act(() => {
      result.current.updateQuizScore('intro', 80)
    })
    expect(result.current.progress.quizScores['intro']).toBe(80)

    act(() => {
      result.current.updateQuizScore('intro', 70)
    })
    expect(result.current.progress.quizScores['intro']).toBe(80)

    act(() => {
      result.current.updateQuizScore('intro', 90)
    })
    expect(result.current.progress.quizScores['intro']).toBe(90)
  })

  it('unlockAchievement adds achievement', () => {
    const { result } = renderHook(() => useEducationProgress())

    act(() => {
      result.current.unlockAchievement('first_chapter')
    })

    expect(result.current.progress.achievements).toContain('first_chapter')
  })

  it('resetProgress clears all data', () => {
    const { result } = renderHook(() => useEducationProgress())

    act(() => {
      result.current.markChapterComplete('intro')
      result.current.updateQuizScore('intro', 100)
    })

    act(() => {
      result.current.resetProgress()
    })

    expect(result.current.progress.completedChapters).toEqual([])
    expect(result.current.progress.quizScores).toEqual({})
  })

  it('reads back data from localStorage on initialization', () => {
    const data = {
      completedChapters: ['intro', 'basics'],
      quizScores: { 'intro': 100 },
      achievements: ['first_chapter'],
      version: 1
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

    const { result } = renderHook(() => useEducationProgress())
    expect(result.current.progress.completedChapters).toEqual(['intro', 'basics'])
    expect(result.current.progress.quizScores).toEqual({ 'intro': 100 })
    expect(result.current.progress.achievements).toEqual(['first_chapter'])
  })

  it('resets to default if localStorage contains corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json')
    const { result } = renderHook(() => useEducationProgress())
    expect(result.current.progress.completedChapters).toEqual([])
  })

  it('resets to default if version mismatch', () => {
    const oldData = {
      completedChapters: ['intro'],
      version: 0
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldData))
    
    const { result } = renderHook(() => useEducationProgress())
    expect(result.current.progress.completedChapters).toEqual([])
  })

  it('resets to default if required fields are missing', () => {
    const partialData = {
      completedChapters: ['intro'],
      version: 1
      // quizScores and achievements missing
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partialData))
    
    const { result } = renderHook(() => useEducationProgress())
    expect(result.current.progress.completedChapters).toEqual([])
  })
})
