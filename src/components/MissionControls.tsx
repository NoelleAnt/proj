import { useState, type FormEvent } from 'react'

interface MissionControlsProps {
  onAdd: (label: string, emoji: string, stars: number) => boolean
  onRefresh: () => void
  hasCompleted: boolean
}

export function MissionControls({
  onAdd,
  onRefresh,
  hasCompleted,
}: MissionControlsProps) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const [stars, setStars] = useState(2)

  function handleRefresh() {
    const message =
      'Undo all missions? Stars from completed missions will be taken back.'
    if (!hasCompleted || window.confirm(message)) {
      onRefresh()
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (onAdd(label, emoji, stars)) {
      setLabel('')
      setEmoji('⭐')
      setStars(2)
      setOpen(false)
    }
  }

  return (
    <div className="mission-controls">
      <div className="mission-toolbar">
        <button
          type="button"
          className="action-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? 'Cancel' : '+ Add mission'}
        </button>
        <button
          type="button"
          className="action-btn secondary"
          onClick={handleRefresh}
          title="Undo completed missions and remove their stars"
        >
          ↩ Undo missions
        </button>
      </div>

      {open && (
        <form className="mission-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Mission name</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Practice piano"
              maxLength={40}
              required
              autoFocus
            />
          </label>
          <label className="form-field narrow">
            <span>Emoji</span>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
            />
          </label>
          <label className="form-field narrow">
            <span>Stars</span>
            <input
              type="number"
              value={stars}
              min={1}
              max={10}
              onChange={(e) => setStars(Number(e.target.value))}
            />
          </label>
          <button type="submit" className="action-btn submit">
            Add
          </button>
        </form>
      )}
    </div>
  )
}
