import { defaultState } from '../data/defaults'
import type { DashboardState, RoutineItem, Task } from '../types'

export function resolveStars(
  stars: unknown,
  id: string,
  defaults: { id: string; stars: number }[],
): number {
  if (typeof stars === 'number' && !Number.isNaN(stars) && stars > 0) {
    return Math.min(10, Math.round(stars))
  }
  const def = defaults.find((d) => d.id === id)
  return def?.stars ?? 1
}

function normalizeTask(task: Task): Task {
  return {
    ...task,
    stars: resolveStars(task.stars, task.id, defaultState.tasks),
  }
}

function normalizeRoutineItem(item: RoutineItem): RoutineItem {
  return {
    ...item,
    stars: resolveStars(item.stars, item.id, defaultState.routine),
  }
}

/** Ensures every checklist item has a valid star value before use or save. */
export function normalizeState(state: DashboardState): DashboardState {
  return {
    ...state,
    tasks: state.tasks.map(normalizeTask),
    routine: state.routine.map(normalizeRoutineItem),
  }
}

export function sumPossibleStars(items: { stars: number }[]): number {
  return items.reduce((sum, item) => sum + item.stars, 0)
}

export function sumEarnedStars(items: { stars: number; done: boolean }[]): number {
  return items.reduce((sum, item) => sum + (item.done ? item.stars : 0), 0)
}
