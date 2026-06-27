import { MOODS } from '../data/defaults'

interface DashboardHeaderProps {
  greeting: string
  username: string
  kidName: string
  mood: string
  totalStars: number
  todayStars: number
  hasDayProgress: boolean
  onNameChange: (name: string) => void
  onMoodChange: (mood: string) => void
  onStartNewDay: () => void
  onLogout: () => void
}

export function DashboardHeader({
  greeting,
  username,
  kidName,
  mood,
  totalStars,
  todayStars,
  hasDayProgress,
  onNameChange,
  onMoodChange,
  onStartNewDay,
  onLogout,
}: DashboardHeaderProps) {
  function handleNewDay() {
    const message =
      'Start a new day? Missions and routine will reset, but total stars are kept.'
    if (!hasDayProgress || window.confirm(message)) {
      onStartNewDay()
    }
  }

  return (
    <header className="hero">
      <div className="hero-top">
        <div className="hero-text">
          <div className="hero-title-row">
            <p className="greeting">{greeting}</p>
            <div className="user-menu">
              <span className="username-tag">@{username}</span>
              <button type="button" className="logout-btn" onClick={onLogout}>
                Sign out
              </button>
            </div>
          </div>
          <h1>
            Hi,{' '}
            <input
              className="name-input"
              value={kidName}
              onChange={(e) => onNameChange(e.target.value)}
              aria-label="Your name"
              maxLength={20}
            />
            !
          </h1>
        </div>

        <div className="star-panel">
          <div className="star-card total">
            <span className="star-icon" aria-hidden="true">⭐</span>
            <div>
              <span className="star-value">{totalStars}</span>
              <span className="star-label">Total</span>
            </div>
          </div>
          <div className="star-card today">
            <span className="star-icon" aria-hidden="true">🌟</span>
            <div>
              <span className="star-value">{todayStars}</span>
              <span className="star-label">Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="mood-strip" role="group" aria-label="Pick your mood">
          <span className="mood-label">Mood</span>
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              className={`mood-btn ${mood === m ? 'active' : ''}`}
              onClick={() => onMoodChange(m)}
              aria-pressed={mood === m}
              aria-label={`Mood ${m}`}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="new-day-btn"
          onClick={handleNewDay}
          title="Reset missions and routine for a new day; keep total stars"
        >
          🌅 New day
        </button>
      </div>
    </header>
  )
}
