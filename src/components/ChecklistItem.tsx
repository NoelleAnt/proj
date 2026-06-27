import { memo } from 'react'

interface ChecklistItemProps {
  id: string
  label: string
  emoji: string
  stars: number
  done: boolean
  onToggle: (id: string) => void
}

export const ChecklistItem = memo(function ChecklistItem({
  id,
  label,
  emoji,
  stars,
  done,
  onToggle,
}: ChecklistItemProps) {
  return (
    <li>
      <button
        type="button"
        className={`check-item ${done ? 'done' : ''}`}
        onClick={() => onToggle(id)}
        aria-pressed={done}
      >
        <span className="check-box">{done ? '✓' : ''}</span>
        <span className="item-emoji">{emoji}</span>
        <span className="item-label">{label}</span>
        <span className="star-badge">+{stars} ⭐</span>
      </button>
    </li>
  )
})
