import { useState, type FormEvent } from 'react'

interface LoginPageProps {
  onLogin: (
    username: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<{ ok: true } | { ok: false; error: string }>
  onRegister: (
    username: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>
}

export function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      const result =
        mode === 'login'
          ? await onLogin(username, password, rememberMe)
          : await onRegister(username, password)

      if (!result.ok) {
        setError(result.error)
      }
    } catch {
      setError('Sign-in failed. Open the app at http://localhost:5173 (not as a file).')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-emoji" aria-hidden="true">
            ⭐
          </span>
          <h1>My Awesome Day</h1>
          <p>Sign in to your dashboard</p>
        </div>

        <div className="login-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={mode === 'login' ? 'active' : ''}
            aria-selected={mode === 'login'}
            onClick={() => {
              setMode('login')
              setError('')
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            className={mode === 'register' ? 'active' : ''}
            aria-selected={mode === 'register'}
            onClick={() => {
              setMode('register')
              setError('')
            }}
          >
            Create account
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Your name"
              maxLength={24}
              required
              autoFocus
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
              placeholder="At least 4 characters"
              minLength={4}
              required
            />
          </label>

          {mode === 'login' && (
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me on this device
            </label>
          )}

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login-submit" disabled={busy}>
            {busy
              ? 'Please wait…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <p className="login-note">
          Each account has its own stars, missions, and rewards. Data stays on
          this device.
        </p>
      </div>
    </div>
  )
}
