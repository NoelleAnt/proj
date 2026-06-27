import {
  authenticateUser,
  clearSession,
  readSession,
  registerUser,
  writeSession,
} from './auth.js'
import {
  MAX_SAVED_DRAWINGS,
  deleteDrawing,
  getDrawings,
  loadWorkspace,
  saveDrawing,
  saveWorkspace,
} from './storage.js'

const PRESET_COLORS = [
  '#1e293b', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff',
]

const MAX_HISTORY = 40
const THEME_KEY = 'sketch-pad-theme'
const PAINT_TOOLS = new Set([
  'round', 'pen', 'marker', 'highlighter', 'pencil', 'calligraphy', 'spray', 'neon',
])

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const canvasFrame = document.getElementById('canvasFrame')
const colorPicker = document.getElementById('colorPicker')
const colorPreview = document.getElementById('colorPreview')
const colorSwatches = document.getElementById('colorSwatches')
const sizeSlider = document.getElementById('sizeSlider')
const sizeValue = document.getElementById('sizeValue')
const sizePreview = document.getElementById('sizePreview')
const strengthSlider = document.getElementById('strengthSlider')
const strengthValue = document.getElementById('strengthValue')
const strengthLabel = document.getElementById('strengthLabel')
const strengthPreviewFill = document.getElementById('strengthPreviewFill')
const gridToggle = document.getElementById('gridToggle')
const themeBtn = document.getElementById('themeBtn')
const undoBtn = document.getElementById('undoBtn')
const redoBtn = document.getElementById('redoBtn')
const clearBtn = document.getElementById('clearBtn')
const exportBtn = document.getElementById('exportBtn')
const saveGalleryBtn = document.getElementById('saveGalleryBtn')
const logoutBtn = document.getElementById('logoutBtn')
const userBadge = document.getElementById('userBadge')
const saveStatus = document.getElementById('saveStatus')
const galleryList = document.getElementById('galleryList')
const galleryCount = document.getElementById('galleryCount')
const galleryEmpty = document.getElementById('galleryEmpty')
const loginScreen = document.getElementById('loginScreen')
const appRoot = document.getElementById('appRoot')
const loginForm = document.getElementById('loginForm')
const loginUsername = document.getElementById('loginUsername')
const loginPassword = document.getElementById('loginPassword')
const loginRemember = document.getElementById('loginRemember')
const loginError = document.getElementById('loginError')
const loginSubmit = document.getElementById('loginSubmit')
const rememberRow = document.getElementById('rememberRow')
const loginTabs = document.querySelectorAll('.login-tab')

const smudgeBuffer = document.createElement('canvas')
const smudgeCtx = smudgeBuffer.getContext('2d')

/** @type {import('./auth.js').AuthSession | null} */
let session = null
let loginMode = 'login'
let workspaceSaveTimer = null
let activeGalleryId = null
let canvasReady = false

const state = {
  tool: 'round',
  lastPaintTool: 'round',
  color: colorPicker.value,
  size: Number(sizeSlider.value),
  strength: Number(strengthSlider.value) / 100,
  drawing: false,
  lastX: 0,
  lastY: 0,
  undoStack: [],
  redoStack: [],
}

function isPaintTool(tool = state.tool) {
  return PAINT_TOOLS.has(tool)
}

function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getCanvasBackground() {
  return getTheme() === 'dark' ? '#161622' : '#ffffff'
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  localStorage.setItem(THEME_KEY, theme)
  themeBtn.querySelector('span').textContent = theme === 'dark' ? '☀️' : '🌙'
  themeBtn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  themeBtn.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
  )
}

function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark')
}

function scaleAlpha(baseAlpha = 1) {
  return baseAlpha * state.strength
}

function updateStrengthLabel() {
  strengthLabel.textContent =
    state.tool === 'smudge' || state.tool === 'eraser' ? 'Strength' : 'Opacity'
}

function updateStrengthPreview() {
  strengthValue.textContent = `${Math.round(state.strength * 100)}%`
  strengthPreviewFill.style.background =
    state.tool === 'eraser' || state.tool === 'smudge' ? '#94a3b8' : state.color
  strengthPreviewFill.style.opacity = String(state.strength)
}

function resetBrushStyle() {
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = state.size
}

function applyBrushSettings() {
  resetBrushStyle()
  canvas.classList.remove('eraser-cursor', 'smudge-cursor')

  if (state.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.lineWidth = state.size
    canvas.classList.add('eraser-cursor')
    return
  }

  if (state.tool === 'smudge') {
    canvas.classList.add('smudge-cursor')
    return
  }

  ctx.strokeStyle = state.color
  ctx.fillStyle = state.color
  ctx.lineWidth = state.size
}

function drawLine(x, y, options = {}) {
  const {
    lineWidth = state.size,
    lineCap = 'round',
    lineJoin = 'round',
    alpha = 1,
    shadowBlur = 0,
    shadowColor = state.color,
  } = options

  ctx.save()
  ctx.globalAlpha = scaleAlpha(alpha)
  ctx.lineWidth = lineWidth
  ctx.lineCap = lineCap
  ctx.lineJoin = lineJoin
  ctx.shadowBlur = shadowBlur
  ctx.shadowColor = shadowColor
  ctx.beginPath()
  ctx.moveTo(state.lastX, state.lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  ctx.restore()
}

function sprayAt(x, y) {
  const density = Math.max(10, Math.floor(state.size * 2.5))
  const radius = state.size

  ctx.save()
  ctx.fillStyle = state.color

  for (let i = 0; i < density; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * radius
    const dotX = x + Math.cos(angle) * dist
    const dotY = y + Math.sin(angle) * dist
    const dotSize = Math.random() * 1.6 + 0.4

    ctx.globalAlpha = scaleAlpha(0.15 + Math.random() * 0.55)
    ctx.beginPath()
    ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function smudgeAt(fromX, fromY, toX, toY) {
  const radius = Math.max(state.size, 4)
  const brushSize = Math.ceil(radius * 2)
  const dx = toX - fromX
  const dy = toY - fromY
  const dist = Math.hypot(dx, dy) || 1
  const pull = Math.min(dist, radius * 0.55) * 0.75 * state.strength
  const offsetX = (dx / dist) * pull
  const offsetY = (dy / dist) * pull

  if (smudgeBuffer.width !== brushSize || smudgeBuffer.height !== brushSize) {
    smudgeBuffer.width = brushSize
    smudgeBuffer.height = brushSize
  }

  smudgeCtx.clearRect(0, 0, brushSize, brushSize)
  smudgeCtx.drawImage(
    canvas,
    fromX - radius,
    fromY - radius,
    brushSize,
    brushSize,
    0,
    0,
    brushSize,
    brushSize,
  )

  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = scaleAlpha(0.82)
  ctx.drawImage(
    smudgeBuffer,
    fromX - radius + offsetX,
    fromY - radius + offsetY,
    brushSize,
    brushSize,
  )
  ctx.globalAlpha = scaleAlpha(0.4)
  ctx.drawImage(smudgeBuffer, toX - radius, toY - radius, brushSize, brushSize)
  ctx.restore()
}

function drawDab(x, y, options = {}) {
  const {
    lineWidth = state.size,
    alpha = 1,
    shadowBlur = 0,
    shadowColor = state.color,
  } = options

  ctx.save()
  ctx.globalAlpha = scaleAlpha(alpha)
  ctx.shadowBlur = shadowBlur
  ctx.shadowColor = shadowColor
  ctx.beginPath()
  ctx.arc(x, y, Math.max(lineWidth / 2, 0.5), 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function paintDab(x, y) {
  applyBrushSettings()

  switch (state.tool) {
    case 'pen':
      drawDab(x, y)
      break
    case 'marker':
      drawDab(x, y, { lineWidth: state.size * 1.6, alpha: 0.38 })
      break
    case 'highlighter':
      drawDab(x, y, { lineWidth: Math.max(state.size * 2.2, 8), alpha: 0.28 })
      break
    case 'pencil':
      for (let i = 0; i < 4; i += 1) {
        const jitter = state.size * 0.2
        drawDab(
          x + (Math.random() - 0.5) * jitter,
          y + (Math.random() - 0.5) * jitter,
          { lineWidth: Math.max(1, state.size * 0.35), alpha: 0.12 + Math.random() * 0.18 },
        )
      }
      break
    case 'calligraphy':
      drawDab(x, y, { lineWidth: state.size * 0.5 })
      break
    case 'spray':
      sprayAt(x, y)
      break
    case 'neon':
      drawDab(x, y, {
        lineWidth: Math.max(2, state.size * 0.6),
        shadowBlur: state.size * 1.4,
        shadowColor: state.color,
      })
      break
    case 'eraser':
      drawDab(x, y)
      break
    case 'smudge':
      smudgeAt(x, y, x, y)
      break
    default:
      drawDab(x, y)
  }
}

function paintStroke(x, y) {
  applyBrushSettings()

  switch (state.tool) {
    case 'round':
      drawLine(x, y)
      break

    case 'pen':
      drawLine(x, y, { lineCap: 'square', lineJoin: 'miter' })
      break

    case 'marker':
      drawLine(x, y, { lineWidth: state.size * 1.6, alpha: 0.38 })
      break

    case 'highlighter':
      drawLine(x, y, {
        lineWidth: Math.max(state.size * 2.2, 8),
        lineCap: 'square',
        alpha: 0.28,
      })
      break

    case 'pencil':
      for (let i = 0; i < 4; i += 1) {
        const jitter = state.size * 0.15
        const jx = (Math.random() - 0.5) * jitter
        const jy = (Math.random() - 0.5) * jitter
        drawLine(x + jx, y + jy, {
          lineWidth: Math.max(1, state.size * 0.35),
          alpha: 0.12 + Math.random() * 0.18,
        })
      }
      break

    case 'calligraphy': {
      const dx = x - state.lastX
      const dy = y - state.lastY
      const speed = Math.hypot(dx, dy)
      const width = state.size * (0.35 + Math.min(speed / 12, 1) * 0.65)
      drawLine(x, y, { lineWidth: width })
      break
    }

    case 'spray':
      sprayAt(x, y)
      break

    case 'neon':
      drawLine(x, y, {
        lineWidth: Math.max(2, state.size * 0.6),
        shadowBlur: state.size * 1.4,
        shadowColor: state.color,
      })
      drawLine(x, y, { lineWidth: Math.max(1, state.size * 0.25), alpha: 0.95 })
      break

    case 'eraser':
      drawLine(x, y)
      break

    case 'smudge':
      smudgeAt(state.lastX, state.lastY, x, y)
      break

    default:
      drawLine(x, y)
  }
}

function resizeCanvas() {
  const frame = canvasFrame.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const snapshot = canvas.width > 0 ? canvas.toDataURL() : null

  canvas.width = Math.floor(frame.width * dpr)
  canvas.height = Math.floor(frame.height * dpr)
  canvas.style.width = `${frame.width}px`
  canvas.style.height = `${frame.height}px`

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (snapshot) {
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, frame.width, frame.height)
    }
    img.src = snapshot
  } else {
    fillBackground()
    if (canvasReady) pushHistory()
  }
}

function fillBackground() {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = getCanvasBackground()
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
}

function getCoords(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function beginStroke(x, y) {
  state.drawing = true
  state.lastX = x
  state.lastY = y
  paintDab(x, y)
}

function drawStroke(x, y) {
  if (!state.drawing) return
  paintStroke(x, y)
  state.lastX = x
  state.lastY = y
}

function endStroke() {
  if (!state.drawing) return
  state.drawing = false
  resetBrushStyle()
  pushHistory()
}

function pushHistory() {
  state.undoStack.push(canvas.toDataURL())
  if (state.undoStack.length > MAX_HISTORY) {
    state.undoStack.shift()
  }
  state.redoStack = []
  updateHistoryButtons()
  scheduleWorkspaceSave()
}

function scheduleWorkspaceSave() {
  if (!session || !canvasReady) return
  clearTimeout(workspaceSaveTimer)
  workspaceSaveTimer = setTimeout(() => {
    try {
      saveWorkspace(session.userId, canvas.toDataURL('image/jpeg', 0.82))
      flashSaveStatus('Draft saved')
    } catch {
      flashSaveStatus('Could not auto-save draft')
    }
  }, 800)
}

function flashSaveStatus(message) {
  saveStatus.textContent = message
  saveStatus.classList.add('saved')
  clearTimeout(flashSaveStatus.timer)
  flashSaveStatus.timer = setTimeout(() => {
    saveStatus.textContent = 'Draw with mouse, touch, or stylus.'
    saveStatus.classList.remove('saved')
  }, 2000)
}

function formatGalleryDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function renderGallery() {
  if (!session) return
  const drawings = getDrawings(session.userId)
  galleryList.innerHTML = ''
  galleryCount.textContent = `${drawings.length} / ${MAX_SAVED_DRAWINGS}`
  galleryEmpty.hidden = drawings.length > 0

  drawings.forEach((drawing) => {
    const item = document.createElement('li')
    item.className = 'gallery-item'

    const loadBtn = document.createElement('button')
    loadBtn.type = 'button'
    loadBtn.className = 'gallery-load'
    if (drawing.id === activeGalleryId) loadBtn.classList.add('active')
    loadBtn.innerHTML = `
      <img class="gallery-thumb" src="${drawing.thumbnail}" alt="">
      <span class="gallery-meta">
        <span class="gallery-title">${escapeHtml(drawing.title)}</span>
        <span class="gallery-date">${formatGalleryDate(drawing.updatedAt)}</span>
      </span>
    `
    loadBtn.addEventListener('click', () => loadSavedDrawing(drawing))

    const deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.className = 'gallery-delete'
    deleteBtn.title = 'Delete drawing'
    deleteBtn.setAttribute('aria-label', `Delete ${drawing.title}`)
    deleteBtn.textContent = '×'
    deleteBtn.addEventListener('click', () => removeSavedDrawing(drawing))

    item.append(loadBtn, deleteBtn)
    galleryList.appendChild(item)
  })
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function loadSavedDrawing(drawing) {
  if (!confirm(`Load "${drawing.title}"? Unsaved changes on the canvas will be replaced.`)) return
  await restoreFromDataUrl(drawing.image)
  activeGalleryId = drawing.id
  state.undoStack = [canvas.toDataURL()]
  state.redoStack = []
  updateHistoryButtons()
  renderGallery()
  scheduleWorkspaceSave()
  flashSaveStatus(`Loaded "${drawing.title}"`)
}

function removeSavedDrawing(drawing) {
  if (!session) return
  if (!confirm(`Delete "${drawing.title}"? This cannot be undone.`)) return
  deleteDrawing(session.userId, drawing.id)
  if (activeGalleryId === drawing.id) activeGalleryId = null
  renderGallery()
}

async function saveToGallery() {
  if (!session) return
  const defaultTitle = `Drawing ${new Date().toLocaleDateString()}`
  const title = prompt('Name this drawing:', defaultTitle)
  if (title === null) return

  saveGalleryBtn.disabled = true
  const result = await saveDrawing(session.userId, title, canvas.toDataURL('image/png'))
  saveGalleryBtn.disabled = false

  if (!result.ok) {
    alert(result.error)
    return
  }

  activeGalleryId = result.drawing.id
  renderGallery()
  flashSaveStatus(`Saved "${result.drawing.title}"`)
}

function showLogin() {
  loginScreen.hidden = false
  appRoot.hidden = true
  session = null
  canvasReady = false
}

function showApp(nextSession) {
  session = nextSession
  userBadge.textContent = `Hi, ${session.username}`
  loginScreen.hidden = true
  appRoot.hidden = false
}

function setLoginMode(mode) {
  loginMode = mode
  loginTabs.forEach((tab) => {
    const active = tab.dataset.mode === mode
    tab.classList.toggle('active', active)
    tab.setAttribute('aria-selected', String(active))
  })
  rememberRow.hidden = mode !== 'login'
  loginPassword.autocomplete = mode === 'login' ? 'current-password' : 'new-password'
  loginSubmit.textContent = mode === 'login' ? 'Sign in' : 'Create account'
  loginError.hidden = true
}

async function handleLoginSubmit(event) {
  event.preventDefault()
  loginError.hidden = true
  loginSubmit.disabled = true

  const username = loginUsername.value
  const password = loginPassword.value
  const result =
    loginMode === 'login'
      ? await authenticateUser(username, password)
      : await registerUser(username, password)

  loginSubmit.disabled = false

  if (!result.ok) {
    loginError.textContent = result.error
    loginError.hidden = false
    return
  }

  const nextSession = {
    userId: result.user.id,
    username: result.user.username,
  }
  writeSession(nextSession, loginMode === 'register' || loginRemember.checked)
  loginForm.reset()
  loginRemember.checked = true
  await startApp(nextSession)
}

async function handleLogout() {
  if (session && canvasReady) {
    saveWorkspace(session.userId, canvas.toDataURL('image/jpeg', 0.82))
  }
  clearSession()
  activeGalleryId = null
  showLogin()
}

async function startApp(nextSession) {
  showApp(nextSession)
  applyTheme(getPreferredTheme())
  buildSwatches()
  updateStrengthLabel()
  updateStrengthPreview()
  updateSizePreview()
  applyBrushSettings()
  renderGallery()
  resizeCanvas()

  const workspace = loadWorkspace(nextSession.userId)
  if (workspace) {
    await restoreFromDataUrl(workspace)
    state.undoStack = [canvas.toDataURL()]
    state.redoStack = []
    updateHistoryButtons()
    flashSaveStatus('Restored your last draft')
  } else {
    fillBackground()
    state.undoStack = [canvas.toDataURL()]
    state.redoStack = []
    updateHistoryButtons()
  }

  canvasReady = true
}

function restoreFromDataUrl(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const frame = canvasFrame.getBoundingClientRect()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, frame.width, frame.height)
      resolve()
    }
    img.src = dataUrl
  })
}

async function undo() {
  if (state.undoStack.length <= 1) return
  const current = state.undoStack.pop()
  state.redoStack.push(current)
  await restoreFromDataUrl(state.undoStack[state.undoStack.length - 1])
  updateHistoryButtons()
}

async function redo() {
  if (state.redoStack.length === 0) return
  const next = state.redoStack.pop()
  state.undoStack.push(next)
  await restoreFromDataUrl(next)
  updateHistoryButtons()
}

function updateHistoryButtons() {
  undoBtn.disabled = state.undoStack.length <= 1
  redoBtn.disabled = state.redoStack.length === 0
}

function activatePaintTool(tool = state.lastPaintTool) {
  setTool(tool)
}

function setColor(color) {
  state.color = color
  colorPicker.value = color
  colorPreview.style.background = color
  document.querySelectorAll('.swatch').forEach((el) => {
    el.classList.toggle('active', el.dataset.color === color)
  })
  if (isPaintTool()) applyBrushSettings()
  updateSizePreview()
  updateStrengthPreview()
}

function setTool(tool) {
  state.tool = tool
  if (isPaintTool(tool)) {
    state.lastPaintTool = tool
  }
  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tool === tool)
  })
  applyBrushSettings()
  updateSizePreview()
  updateStrengthLabel()
  updateStrengthPreview()
}

function updateSizePreview() {
  sizePreview.innerHTML = ''
  const color = state.tool === 'eraser' ? '#94a3b8' : state.color

  if (state.tool === 'smudge') {
    const wrap = document.createElement('div')
    wrap.className = 'size-preview-smudge'
    const sizes = [0.35, 0.55, 0.75, 0.55, 0.35].map((scale) => Math.max(4, state.size * scale))
    const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#8b5cf6', '#6366f1']
    sizes.forEach((size, i) => {
      const dot = document.createElement('span')
      dot.style.width = `${size}px`
      dot.style.height = `${size}px`
      dot.style.background = colors[i]
      wrap.appendChild(dot)
    })
    sizePreview.appendChild(wrap)
    return
  }

  if (state.tool === 'highlighter') {
    const bar = document.createElement('div')
    bar.className = 'size-preview-bar'
    bar.style.width = `${Math.min(state.size * 2.2, 80)}px`
    bar.style.height = `${Math.max(6, state.size * 0.45)}px`
    bar.style.background = color
    bar.style.opacity = String(0.45 * state.strength)
    sizePreview.appendChild(bar)
    return
  }

  if (state.tool === 'spray') {
    const wrap = document.createElement('div')
    wrap.className = 'size-preview-spray'
    const count = 14
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('span')
      const angle = (i / count) * Math.PI * 2
      const dist = (Math.random() * 0.5 + 0.2) * Math.min(state.size, 20)
      const size = Math.random() * 3 + 2
      dot.style.width = `${size}px`
      dot.style.height = `${size}px`
      dot.style.left = `${24 + Math.cos(angle) * dist}px`
      dot.style.top = `${24 + Math.sin(angle) * dist}px`
      dot.style.background = color
      wrap.appendChild(dot)
    }
    sizePreview.appendChild(wrap)
    return
  }

  if (state.tool === 'neon') {
    const dot = document.createElement('div')
    dot.className = 'size-preview-dot'
    const displaySize = Math.max(6, Math.min(state.size, 36))
    dot.style.width = `${displaySize}px`
    dot.style.height = `${displaySize}px`
    dot.style.background = color
    dot.style.boxShadow = `0 0 ${displaySize * 0.8}px ${color}`
    sizePreview.appendChild(dot)
    return
  }

  const dot = document.createElement('div')
  dot.className = 'size-preview-dot'
  let displaySize = Math.max(4, Math.min(state.size, 40))

  if (state.tool === 'marker') displaySize = Math.min(state.size * 1.4, 44)
  if (state.tool === 'pen') dot.style.borderRadius = '2px'
  if (state.tool === 'pencil') displaySize = Math.max(3, state.size * 0.35)

  dot.style.width = `${displaySize}px`
  dot.style.height = `${displaySize}px`
  dot.style.background = color
  const previewOpacity = state.tool === 'marker' ? 0.45 : state.tool === 'pencil' ? 0.35 : 1
  dot.style.opacity = String(previewOpacity * state.strength)
  sizePreview.appendChild(dot)
}

function buildSwatches() {
  PRESET_COLORS.forEach((color) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'swatch'
    btn.dataset.color = color
    btn.style.background = color
    btn.setAttribute('role', 'listitem')
    btn.setAttribute('aria-label', `Color ${color}`)
    btn.addEventListener('click', () => {
      setColor(color)
      activatePaintTool()
    })
    colorSwatches.appendChild(btn)
  })
  setColor(state.color)
}

function onPointerDown(event) {
  event.preventDefault()
  canvas.setPointerCapture(event.pointerId)
  const { x, y } = getCoords(event)
  beginStroke(x, y)
}

function onPointerMove(event) {
  if (!state.drawing) return
  event.preventDefault()
  const { x, y } = getCoords(event)
  drawStroke(x, y)
}

function onPointerUp(event) {
  if (!state.drawing) return
  canvas.releasePointerCapture(event.pointerId)
  endStroke()
}

clearBtn.addEventListener('click', () => {
  if (!confirm('Clear the whole canvas?')) return
  fillBackground()
  activeGalleryId = null
  pushHistory()
  renderGallery()
})

exportBtn.addEventListener('click', () => {
  const link = document.createElement('a')
  link.download = `sketch-${new Date().toISOString().slice(0, 10)}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
})

saveGalleryBtn.addEventListener('click', saveToGallery)
logoutBtn.addEventListener('click', handleLogout)

loginForm.addEventListener('submit', handleLoginSubmit)
loginTabs.forEach((tab) => {
  tab.addEventListener('click', () => setLoginMode(tab.dataset.mode))
})

undoBtn.addEventListener('click', undo)
redoBtn.addEventListener('click', redo)

document.querySelectorAll('.tool-btn').forEach((btn) => {
  btn.addEventListener('click', () => setTool(btn.dataset.tool))
})

colorPicker.addEventListener('input', (e) => {
  setColor(e.target.value)
  activatePaintTool()
})

sizeSlider.addEventListener('input', (e) => {
  state.size = Number(e.target.value)
  sizeValue.textContent = state.size
  updateSizePreview()
  applyBrushSettings()
})

strengthSlider.addEventListener('input', (e) => {
  state.strength = Number(e.target.value) / 100
  updateStrengthPreview()
  updateSizePreview()
})

gridToggle.addEventListener('change', (e) => {
  canvasFrame.classList.toggle('show-grid', e.target.checked)
})

themeBtn.addEventListener('click', toggleTheme)

canvas.addEventListener('pointerdown', onPointerDown)
canvas.addEventListener('pointermove', onPointerMove)
canvas.addEventListener('pointerup', onPointerUp)
canvas.addEventListener('pointercancel', onPointerUp)
canvas.addEventListener('pointerleave', onPointerUp)

window.addEventListener('resize', resizeCanvas)
window.addEventListener('beforeunload', () => {
  if (session && canvasReady) {
    saveWorkspace(session.userId, canvas.toDataURL('image/jpeg', 0.82))
  }
})

setLoginMode('login')

const existingSession = readSession()
if (existingSession) {
  startApp(existingSession)
} else {
  applyTheme(getPreferredTheme())
  showLogin()
}
