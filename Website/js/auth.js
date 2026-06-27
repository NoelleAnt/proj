/** @typedef {{ id: string, username: string, passwordHash: string, salt: string, createdAt: string }} UserAccount */
/** @typedef {{ userId: string, username: string }} AuthSession */

export const AUTH_USERS_KEY = 'kid-dashboard-users'
export const SESSION_KEY = 'sketch-pad-session'
export const REMEMBER_KEY = 'sketch-pad-remember'

function generateSalt() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password, salt, expectedHash) {
  const hash = await hashPassword(password, salt)
  return hash === expectedHash
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY)
    if (!raw) return []
    return /** @type {UserAccount[]} */ (JSON.parse(raw))
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users))
}

export function findUserByUsername(username) {
  const normalized = username.trim().toLowerCase()
  return loadUsers().find((u) => u.username.toLowerCase() === normalized)
}

export function findUserById(userId) {
  return loadUsers().find((u) => u.id === userId)
}

export async function registerUser(username, password) {
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
  const passwordHash = await hashPassword(password, salt)
  /** @type {UserAccount} */
  const user = {
    id: crypto.randomUUID(),
    username: trimmed,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  }

  const users = loadUsers()
  users.push(user)
  saveUsers(users)
  return { ok: true, user }
}

export async function authenticateUser(username, password) {
  const user = findUserByUsername(username)
  if (!user) {
    return { ok: false, error: 'Username or password is wrong.' }
  }

  const valid = await verifyPassword(password, user.salt, user.passwordHash)
  if (!valid) {
    return { ok: false, error: 'Username or password is wrong.' }
  }

  return { ok: true, user }
}

export function readSession() {
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(REMEMBER_KEY)
    if (!raw) return null
    const session = /** @type {AuthSession} */ (JSON.parse(raw))
    if (!findUserById(session.userId)) return null
    return session
  } catch {
    return null
  }
}

export function writeSession(session, rememberMe) {
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
