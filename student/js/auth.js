'use strict';

const AUTH_SESSION_KEY = 'edumanage-session';
const AUTH_REMEMBER_KEY = 'edumanage-remember';

const DEMO_ACCOUNTS = [
  {
    id: 'usr-001',
    username: 'admin',
    password: 'admin123',
    name: 'Prof. Elena Ramirez',
    role: 'Administrator',
    email: 'elena.ramirez@ciit.edu',
    department: 'Information Technology',
  },
  {
    id: 'usr-002',
    username: 'registrar',
    password: 'registrar123',
    name: 'Ms. Clara Navarro',
    role: 'Registrar',
    email: 'clara.navarro@ciit.edu',
    department: 'Records Office',
  },
  {
    id: 'usr-003',
    username: 'demo',
    password: 'demo123',
    name: 'Demo Instructor',
    role: 'Instructor',
    email: 'demo@ciit.edu',
    department: 'Computer Science',
  },
];

function loadSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY) || sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.userId || !session.username) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

function saveSession(user, remember) {
  const session = {
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    email: user.email,
    department: user.department,
    loggedInAt: new Date().toISOString(),
  };

  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  if (remember) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(AUTH_REMEMBER_KEY, '1');
  } else {
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(AUTH_REMEMBER_KEY);
  }

  return session;
}

function clearSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(AUTH_REMEMBER_KEY);
}

function findAccount(username) {
  const normalized = username.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((a) => a.username.toLowerCase() === normalized);
}

function authenticate(username, password) {
  const account = findAccount(username);
  if (!account || account.password !== password) {
    return { ok: false, error: 'Invalid username or password.' };
  }
  return { ok: true, user: account };
}

function isLoggedIn() {
  return !!loadSession();
}

function updateUserUI(session) {
  if (!session) return;

  document.querySelectorAll('[data-user-name]').forEach((el) => {
    el.textContent = session.name;
  });

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.name)}&background=134e4a&color=fff`;
  document.querySelectorAll('[data-user-avatar]').forEach((el) => {
    el.src = avatarUrl;
    el.alt = session.name;
  });

  const roleEl = document.getElementById('settingsRole');
  const emailEl = document.getElementById('settingsEmail');
  const deptEl = document.getElementById('settingsDepartment');
  if (roleEl) roleEl.textContent = session.role;
  if (emailEl) emailEl.textContent = session.email;
  if (deptEl) deptEl.textContent = session.department;
}

function initLogin(onSuccess) {
  const loginScreen = document.getElementById('loginScreen');
  const appRoot = document.getElementById('appRoot');
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('loginPassword');
  const rememberCheckbox = document.getElementById('loginRemember');
  const usernameInput = document.getElementById('loginUsername');

  if (!loginScreen || !appRoot || !form || !errorEl || !passwordInput || !usernameInput) {
    console.error('Login UI elements missing — check index.html');
    return { showLogin() {}, logout() {} };
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = !message;
  }

  function showLogin() {
    loginScreen.hidden = false;
    appRoot.hidden = true;
    document.body.classList.remove('app-active');
  }

  function showApp(session) {
    loginScreen.hidden = true;
    appRoot.hidden = false;
    document.body.classList.add('app-active');
    updateUserUI(session);

    try {
      if (onSuccess) onSuccess(session);
    } catch (err) {
      console.error('Dashboard failed to load:', err);
      clearSession();
      showLogin();
      showError('Dashboard failed to load. Please refresh and try again.');
    }
  }

  function attemptLogin(username, password, remember) {
    const result = authenticate(username, password);
    if (!result.ok) {
      showError(result.error);
      return false;
    }

    const session = saveSession(result.user, remember);
    showError('');
    showApp(session);
    return true;
  }

  function logout() {
    clearSession();
    usernameInput.value = '';
    passwordInput.value = '';
    if (rememberCheckbox) rememberCheckbox.checked = false;
    showLogin();
    showError('');
  }

  /* Always wire up the form — even when restoring a saved session */
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      const icon = togglePassword.querySelector('i');
      if (icon) icon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    attemptLogin(
      usernameInput.value,
      passwordInput.value,
      rememberCheckbox ? rememberCheckbox.checked : false
    );
  });

  if (rememberCheckbox && localStorage.getItem(AUTH_REMEMBER_KEY)) {
    rememberCheckbox.checked = true;
    const session = loadSession();
    if (session) usernameInput.value = session.username;
  }

  /* Restore session or show login */
  const existing = loadSession();
  if (existing) {
    showApp(existing);
  } else {
    showLogin();
  }

  return { showLogin, logout, attemptLogin };
}
