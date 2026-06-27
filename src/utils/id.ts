/** Creates a unique ID for new missions added at runtime. */
export function newTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
