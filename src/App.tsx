import { Dashboard } from './components/Dashboard'
import { LoginPage } from './components/LoginPage'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const { user, ready, login, register, logout } = useAuth()

  if (!ready) {
    return <div className="login-page loading">Loading…</div>
  }

  if (!user) {
    return <LoginPage onLogin={login} onRegister={register} />
  }

  return <Dashboard user={user} onLogout={logout} />
}

export default App
