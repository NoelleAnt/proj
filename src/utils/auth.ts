import {
  AUTH_USERS_KEY,
  LEGACY_STORAGE_KEY,
  REMEMBER_KEY,
  SESSION_KEY,
  dashboardStorageKey,
} from '../data/defaults'
import type { AuthSession, UserAccount } from '../types'

function generateSalt(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  const payload = `${salt}:${password}`
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(payload)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash), (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('')
  }
  let hash = 5381
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash * 33) ^ payload.charCodeAt(i)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  const hash = await hashPassword(password, salt)
  return hash === expectedHash
}

function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as UserAccount[]
  } catch {
    return []
  }
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users))
}

export function getStoredUsers(): UserAccount[] {
  return loadUsers()
}

export function findUserByUsername(username: string): UserAccount | undefined {
  const normalized = username.trim().toLowerCase()
  return loadUsers().find((u) => u.username.toLowerCase() === normalized)
}

export function findUserById(userId: string): UserAccount | undefined {
  return loadUsers().find((u) => u.id === userId)
}

export function migrateLegacyDashboard(userId: string) {
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!legacy) return
  if (localStorage.getItem(dashboardStorageKey(userId))) return
  localStorage.setItem(dashboardStorageKey(userId), legacy)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
}

export async function registerUser(
  username: string,
  password: string,
): Promise<{ ok: true; user: UserAccount } | { ok: false; error: string }> {
  const trimmed = username.trim()
  if (trimmed.length < 2) {
    return { ok: false, error: 'Username must be at least 2 characters.' }
  }
  if (password.length < 4) {
    return { ok: false, error: 'Password must be at least 4 characters.' }
  }
  if (findUserByUsername(trimmed)) {
    return { ok: false, error: 'That username is already taken.' }
  }

  const salt = generateSalt()
  const passwordHash = await hashPassword(password.trim(), salt)
  const user: UserAccount = {
    id: crypto.randomUUID(),
    username: trimmed,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  }

  const users = loadUsers()
  users.push(user)
  saveUsers(users)

  if (users.length === 1) {
    migrateLegacyDashboard(user.id)
  }

  return { ok: true, user }
}

export async function authenticateUser(
  username: string,
  password: string,
): Promise<{ ok: true; user: UserAccount } | { ok: false; error: string }> {
  const trimmedPass = password.trim()
  const user = findUserByUsername(username)
  if (!user) {
    return { ok: false, error: 'Username or password is wrong.' }
  }

  const valid = await verifyPassword(trimmedPass, user.salt, user.passwordHash)
  if (!valid) {
    return { ok: false, error: 'Username or password is wrong.' }
  }

  return { ok: true, user }
}

export function readSession(): AuthSession | null {
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) ??
      localStorage.getItem(REMEMBER_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    if (!findUserById(session.userId)) return null
    return session
  } catch {
    return null
  }
}

export function writeSession(session: AuthSession, rememberMe: boolean) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  if (rememberMe) {
    localStorage.setItem(REMEMBER_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(REMEMBER_KEY)
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(REMEMBER_KEY)
}
