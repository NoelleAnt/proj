/** @typedef {{ id: string, title: string, thumbnail: string, image: string, createdAt: string, updatedAt: string }} SavedDrawing */

export const MAX_SAVED_DRAWINGS = 12

const DRAWINGS_PREFIX = 'sketch-pad-drawings-'
const WORKSPACE_PREFIX = 'sketch-pad-workspace-'

function drawingsKey(userId) {
  return `${DRAWINGS_PREFIX}${userId}`
}

function workspaceKey(userId) {
  return `${WORKSPACE_PREFIX}${userId}`
}

function loadDrawings(userId) {
  try {
    const raw = localStorage.getItem(drawingsKey(userId))
    if (!raw) return []
    return /** @type {SavedDrawing[]} */ (JSON.parse(raw))
  } catch {
    return []
  }
}

function persistDrawings(userId, drawings) {
  localStorage.setItem(drawingsKey(userId), JSON.stringify(drawings))
}

export function createThumbnail(imageDataUrl, maxSize = 120) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      const width = Math.max(1, Math.round(img.width * scale))
      const height = Math.max(1, Math.round(img.height * scale))
      const buffer = document.createElement('canvas')
      buffer.width = width
      buffer.height = height
      const bufferCtx = buffer.getContext('2d')
      bufferCtx.drawImage(img, 0, 0, width, height)
      resolve(buffer.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = () => reject(new Error('Could not create thumbnail.'))
    img.src = imageDataUrl
  })
}

export function compressDrawing(imageDataUrl, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const buffer = document.createElement('canvas')
      buffer.width = img.width
      buffer.height = img.height
      const bufferCtx = buffer.getContext('2d')
      bufferCtx.drawImage(img, 0, 0)
      resolve(buffer.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('Could not compress drawing.'))
    img.src = imageDataUrl
  })
}

export async function saveDrawing(userId, title, imageDataUrl) {
  const drawings = loadDrawings(userId)
  if (drawings.length >= MAX_SAVED_DRAWINGS) {
    return {
      ok: false,
      error: `Gallery full (${MAX_SAVED_DRAWINGS} max). Delete one to save a new drawing.`,
    }
  }

  try {
    const [thumbnail, image] = await Promise.all([
      createThumbnail(imageDataUrl),
      compressDrawing(imageDataUrl),
    ])
    const now = new Date().toISOString()
    /** @type {SavedDrawing} */
    const drawing = {
      id: crypto.randomUUID(),
      title: title.trim() || 'Untitled',
      thumbnail,
      image,
      createdAt: now,
      updatedAt: now,
    }
    drawings.unshift(drawing)
    persistDrawings(userId, drawings)
    return { ok: true, drawing }
  } catch {
    return { ok: false, error: 'Could not save drawing. Try exporting as PNG instead.' }
  }
}

export function getDrawings(userId) {
  return loadDrawings(userId)
}

export function deleteDrawing(userId, drawingId) {
  const drawings = loadDrawings(userId).filter((d) => d.id !== drawingId)
  persistDrawings(userId, drawings)
  return drawings
}

export function renameDrawing(userId, drawingId, title) {
  const drawings = loadDrawings(userId)
  const drawing = drawings.find((d) => d.id === drawingId)
  if (!drawing) return drawings
  drawing.title = title.trim() || drawing.title
  drawing.updatedAt = new Date().toISOString()
  persistDrawings(userId, drawings)
  return drawings
}

export function saveWorkspace(userId, imageDataUrl) {
  if (!userId || !imageDataUrl) return
  try {
    localStorage.setItem(workspaceKey(userId), imageDataUrl)
  } catch {
    // Storage quota — skip silent auto-save
  }
}

export function loadWorkspace(userId) {
  try {
    return localStorage.getItem(workspaceKey(userId))
  } catch {
    return null
  }
}

export function clearWorkspace(userId) {
  localStorage.removeItem(workspaceKey(userId))
}
