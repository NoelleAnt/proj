import { useCallback, useEffect, useMemo, useState } from 'react'
import { dashboardStorageKey, defaultState } from '../data/defaults'
import type { DashboardState } from '../types'
import { newTaskId } from '../utils/id'
import { normalizeState } from '../utils/normalize'

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function applyNewDayReset(state: DashboardState): DashboardState {
  return normalizeState({
    ...state,
    todayStars: 0,
    lastResetDate: todayString(),
    tasks: state.tasks.map((t) => ({ ...t, done: false })),
    routine: state.routine.map((r) => ({ ...r, done: false })),
    redeemedRewards: [],
  })
}

function resetDaily(state: DashboardState): DashboardState {
  if (state.lastResetDate === todayString()) return state
  return applyNewDayReset(state)
}

function loadState(userId: string): DashboardState {
  try {
    const raw = localStorage.getItem(dashboardStorageKey(userId))
    if (!raw) return resetDaily(normalizeState(defaultState))
    const parsed = JSON.parse(raw) as Partial<DashboardState>
    return resetDaily(normalizeState({ ...defaultState, ...parsed }))
  } catch {
    return resetDaily(normalizeState(defaultState))
  }
}

function saveState(userId: string, state: DashboardState) {
  localStorage.setItem(
    dashboardStorageKey(userId),
    JSON.stringify(normalizeState(state)),
  )
}

type ChecklistItem = { id: string; stars: number; done: boolean }

function toggleItem<T extends ChecklistItem>(
  items: T[],
  id: string,
): { items: T[]; starDelta: number; completed: boolean } | null {
  const item = items.find((i) => i.id === id)
  if (!item) return null

  const done = !item.done
  const starDelta = done ? item.stars : -item.stars
  return {
    items: items.map((i) => (i.id === id ? { ...i, done } : i)),
    starDelta,
    completed: done,
  }
}

export function useDashboard(userId: string) {
  const [state, setState] = useState(() => loadState(userId))
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    setState(loadState(userId))
  }, [userId])

  useEffect(() => {
    const timer = window.setTimeout(() => saveState(userId, state), 250)
    return () => window.clearTimeout(timer)
  }, [state, userId])

  const triggerCelebrate = useCallback(() => {
    setCelebrate(true)
    window.setTimeout(() => setCelebrate(false), 900)
  }, [])

  const applyStarDelta = useCallback(
    (starDelta: number, completed: boolean) => {
      if (completed) triggerCelebrate()
      return (s: DashboardState) =>
        normalizeState({
          ...s,
          totalStars: Math.max(0, s.totalStars + starDelta),
          todayStars: Math.max(0, s.todayStars + starDelta),
        })
    },
    [triggerCelebrate],
  )

  const setKidName = useCallback((kidName: string) => {
    setState((s) => ({ ...s, kidName: kidName.trim() || 'Champ' }))
  }, [])

  const setMood = useCallback((mood: string) => {
    setState((s) => ({ ...s, mood }))
  }, [])

  const toggleTask = useCallback(
    (id: string) => {
      setState((s) => {
        const result = toggleItem(s.tasks, id)
        if (!result) return s
        return {
          ...applyStarDelta(result.starDelta, result.completed)(s),
          tasks: result.items,
        }
      })
    },
    [applyStarDelta],
  )

  const toggleRoutine = useCallback(
    (id: string) => {
      setState((s) => {
        const result = toggleItem(s.routine, id)
        if (!result) return s
        return {
          ...applyStarDelta(result.starDelta, result.completed)(s),
          routine: result.items,
        }
      })
    },
    [applyStarDelta],
  )

  const redeemReward = useCallback(
    (id: string) => {
      setState((s) => {
        const reward = s.rewards.find((r) => r.id === id)
        if (!reward || s.totalStars < reward.cost) return s
        if (s.redeemedRewards.includes(id)) return s

        triggerCelebrate()
        return {
          ...s,
          totalStars: s.totalStars - reward.cost,
          redeemedRewards: [...s.redeemedRewards, id],
        }
      })
    },
    [triggerCelebrate],
  )

  const addTask = useCallback((label: string, emoji: string, stars: number) => {
    const trimmed = label.trim()
    if (!trimmed) return false

    setState((s) =>
      normalizeState({
        ...s,
        tasks: [
          ...s.tasks,
          {
            id: newTaskId(),
            label: trimmed,
            emoji: emoji.trim() || '⭐',
            stars: Math.min(10, Math.max(1, Math.round(stars))),
            done: false,
          },
        ],
      }),
    )
    return true
  }, [])

  const startNewDay = useCallback(() => {
    setState(applyNewDayReset)
  }, [])

  const refreshMissions = useCallback(() => {
    setState((s) => {
      const earned = s.tasks.reduce(
        (sum, t) => sum + (t.done ? t.stars : 0),
        0,
      )
      return normalizeState({
        ...s,
        totalStars: Math.max(0, s.totalStars - earned),
        todayStars: Math.max(0, s.todayStars - earned),
        tasks: s.tasks.map((t) => ({ ...t, done: false })),
      })
    })
  }, [])

  const stats = useMemo(() => {
    const routineDone = state.routine.filter((r) => r.done).length
    const tasksDone = state.tasks.filter((t) => t.done).length
    const routineStars = state.routine.reduce((s, r) => s + r.stars, 0)
    const missionStars = state.tasks.reduce((s, t) => s + t.stars, 0)
    const routineEarned = state.routine.reduce(
      (s, r) => s + (r.done ? r.stars : 0),
      0,
    )
    const missionEarned = state.tasks.reduce(
      (s, t) => s + (t.done ? t.stars : 0),
      0,
    )

    return {
      routineDone,
      tasksDone,
      routinePct: state.routine.length
        ? Math.round((routineDone / state.routine.length) * 100)
        : 0,
      tasksPct: state.tasks.length
        ? Math.round((tasksDone / state.tasks.length) * 100)
        : 0,
      routineStars,
      missionStars,
      routineEarned,
      missionEarned,
    }
  }, [state.routine, state.tasks])

  return {
    state,
    celebrate,
    stats,
    setKidName,
    setMood,
    toggleTask,
    toggleRoutine,
    redeemReward,
    addTask,
    refreshMissions,
    startNewDay,
  }
}
