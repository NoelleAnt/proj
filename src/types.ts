export interface Task {
  id: string
  label: string
  emoji: string
  stars: number
  done: boolean
}

export interface RoutineItem {
  id: string
  label: string
  emoji: string
  stars: number
  done: boolean
}

export interface Reward {
  id: string
  label: string
  emoji: string
  cost: number
}

export interface DashboardState {
  kidName: string
  totalStars: number
  todayStars: number
  lastResetDate: string
  mood: string
  tasks: Task[]
  routine: RoutineItem[]
  rewards: Reward[]
  redeemedRewards: string[]
}

export interface UserAccount {
  id: string
  username: string
  passwordHash: string
  salt: string
  createdAt: string
}

export interface AuthSession {
  userId: string
  username: string
}
