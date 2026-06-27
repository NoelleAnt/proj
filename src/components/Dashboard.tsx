import { ChecklistItem } from './ChecklistItem'
import { DashboardHeader } from './DashboardHeader'
import { MissionControls } from './MissionControls'
import { useDashboard } from '../hooks/useDashboard'
import type { AuthSession } from '../types'

interface DashboardProps {
  user: AuthSession
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const {
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
  } = useDashboard(user.userId)

  const hasDayProgress =
    stats.tasksDone > 0 ||
    stats.routineDone > 0 ||
    state.todayStars > 0

  return (
    <div className={`dashboard ${celebrate ? 'celebrate' : ''}`}>
      {celebrate && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="confetti-piece"
              style={{ '--i': i } as Record<string, number>}
            />
          ))}
        </div>
      )}

      <DashboardHeader
        greeting={getGreeting()}
        username={user.username}
        kidName={state.kidName}
        mood={state.mood}
        totalStars={state.totalStars}
        todayStars={state.todayStars}
        hasDayProgress={hasDayProgress}
        onNameChange={setKidName}
        onMoodChange={setMood}
        onStartNewDay={startNewDay}
        onLogout={onLogout}
      />

      <main className="grid">
        <section className="card routine-card">
          <div className="card-header">
            <h2>🌅 Morning routine</h2>
            <div className="card-meta">
              <span className="badge mint">
                {stats.routineEarned}/{stats.routineStars} ⭐
              </span>
              <span className="badge">
                {stats.routineDone}/{state.routine.length}
              </span>
            </div>
          </div>
          <div className="progress-bar" aria-hidden="true">
            <div
              className="progress-fill mint"
              style={{ width: `${stats.routinePct}%` }}
            />
          </div>
          <ul className="checklist">
            {state.routine.map((item) => (
              <ChecklistItem
                key={item.id}
                id={item.id}
                label={item.label}
                emoji={item.emoji}
                stars={item.stars}
                done={item.done}
                onToggle={toggleRoutine}
              />
            ))}
          </ul>
        </section>

        <section className="card tasks-card">
          <div className="card-header">
            <h2>✅ Today&apos;s missions</h2>
            <div className="card-meta">
              <span className="badge coral">
                {stats.missionEarned}/{stats.missionStars} ⭐
              </span>
              <span className="badge">
                {stats.tasksDone}/{state.tasks.length}
              </span>
            </div>
          </div>
          <MissionControls
            onAdd={addTask}
            onRefresh={refreshMissions}
            hasCompleted={stats.tasksDone > 0}
          />
          <div className="progress-bar" aria-hidden="true">
            <div
              className="progress-fill coral"
              style={{ width: `${stats.tasksPct}%` }}
            />
          </div>
          <ul className="checklist">
            {state.tasks.map((task) => (
              <ChecklistItem
                key={task.id}
                id={task.id}
                label={task.label}
                emoji={task.emoji}
                stars={task.stars}
                done={task.done}
                onToggle={toggleTask}
              />
            ))}
          </ul>
        </section>

        <section className="card rewards-card">
          <div className="card-header">
            <h2>🎁 Reward shop</h2>
            <span className="badge gold">{state.totalStars} ⭐ to spend</span>
          </div>
          <ul className="rewards-list">
            {state.rewards.map((reward) => {
              const redeemed = state.redeemedRewards.includes(reward.id)
              const canAfford = state.totalStars >= reward.cost

              return (
                <li key={reward.id}>
                  <div className={`reward-item ${redeemed ? 'redeemed' : ''}`}>
                    <span className="reward-emoji">{reward.emoji}</span>
                    <div className="reward-info">
                      <span className="reward-label">{reward.label}</span>
                      <span className="reward-cost">{reward.cost} ⭐</span>
                    </div>
                    <button
                      type="button"
                      className="redeem-btn"
                      disabled={redeemed || !canAfford}
                      onClick={() => redeemReward(reward.id)}
                    >
                      {redeemed ? 'Got it!' : canAfford ? 'Redeem' : 'Need more'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </main>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
