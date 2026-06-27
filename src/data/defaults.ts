import type { DashboardState } from '../types'

export const MOODS = ['😊', '🤩', '😌', '😴', '😤', '😢'] as const

export const defaultState: DashboardState = {
  kidName: 'Champ',
  totalStars: 0,
  todayStars: 0,
  lastResetDate: new Date().toISOString().slice(0, 10),
  mood: '😊',
  tasks: [
    { id: '1', label: 'Make my bed', emoji: '🛏️', stars: 2, done: false },
    { id: '2', label: 'Do homework', emoji: '📚', stars: 3, done: false },
    { id: '3', label: 'Read for 20 minutes', emoji: '📖', stars: 3, done: false },
    { id: '4', label: 'Tidy my room', emoji: '🧹', stars: 2, done: false },
    { id: '5', label: 'Help with dishes', emoji: '🍽️', stars: 2, done: false },
  ],
  routine: [
    { id: 'r1', label: 'Wake up & stretch', emoji: '🌅', stars: 1, done: false },
    { id: 'r2', label: 'Brush teeth', emoji: '🪥', stars: 1, done: false },
    { id: 'r3', label: 'Get dressed', emoji: '👕', stars: 1, done: false },
    { id: 'r4', label: 'Eat breakfast', emoji: '🥣', stars: 1, done: false },
    { id: 'r5', label: 'Pack my bag', emoji: '🎒', stars: 2, done: false },
  ],
  rewards: [
    { id: 'w1', label: 'Extra screen time', emoji: '🎮', cost: 10 },
    { id: 'w2', label: 'Pick dinner tonight', emoji: '🍕', cost: 15 },
    { id: 'w3', label: 'Stay up 30 min late', emoji: '🌙', cost: 20 },
    { id: 'w4', label: 'Special treat', emoji: '🍦', cost: 8 },
    { id: 'w5', label: 'Movie night pick', emoji: '🎬', cost: 25 },
  ],
  redeemedRewards: [],
}

export const STORAGE_KEY = 'kid-dashboard-v1'
export const LEGACY_STORAGE_KEY = STORAGE_KEY
export const AUTH_USERS_KEY = 'kid-dashboard-users'
export const SESSION_KEY = 'kid-dashboard-session'
export const REMEMBER_KEY = 'kid-dashboard-remember'

export function dashboardStorageKey(userId: string) {
  return `${STORAGE_KEY}-${userId}`
}
