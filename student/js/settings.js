'use strict';

const SETTINGS_KEY = 'edumanage-settings';

const THEMES = {
  teal: {
    label: 'Teal Light',
    icon: 'bi-brightness-high',
    vars: {
      '--primary': '#0d9488',
      '--primary-hover': '#0f766e',
      '--sidebar-bg': '#134e4a',
      '--sidebar-text': '#99f6e4',
      '--sidebar-active': '#0d9488',
      '--body-bg': '#f0fdfa',
      '--card-bg': '#ffffff',
      '--text-primary': '#134e4a',
      '--text-body': '#0f172a',
      '--text-muted': '#64748b',
      '--border-color': '#ccfbf1',
      '--chart-grid': '#ccfbf1',
      '--chart-primary': '#0d9488',
      '--chart-tooltip': '#134e4a',
      '--semester-bg': '#ccfbf1',
      '--input-bg': '#f0fdfa',
      '--summary-bg': '#f8fafc',
    },
  },
  dark: {
    label: 'Dark',
    icon: 'bi-moon-stars',
    vars: {
      '--primary': '#2dd4bf',
      '--primary-hover': '#14b8a6',
      '--sidebar-bg': '#0f172a',
      '--sidebar-text': '#94a3b8',
      '--sidebar-active': '#0d9488',
      '--body-bg': '#1e293b',
      '--card-bg': '#334155',
      '--text-primary': '#f1f5f9',
      '--text-body': '#e2e8f0',
      '--text-muted': '#94a3b8',
      '--border-color': '#475569',
      '--chart-grid': '#475569',
      '--chart-primary': '#2dd4bf',
      '--chart-tooltip': '#0f172a',
      '--semester-bg': '#134e4a',
      '--input-bg': '#1e293b',
      '--summary-bg': '#1e293b',
    },
  },
  indigo: {
    label: 'Indigo',
    icon: 'bi-palette',
    vars: {
      '--primary': '#4f46e5',
      '--primary-hover': '#4338ca',
      '--sidebar-bg': '#1e1b4b',
      '--sidebar-text': '#c7d2fe',
      '--sidebar-active': '#4f46e5',
      '--body-bg': '#eef2ff',
      '--card-bg': '#ffffff',
      '--text-primary': '#1e1b4b',
      '--text-body': '#0f172a',
      '--text-muted': '#64748b',
      '--border-color': '#e0e7ff',
      '--chart-grid': '#e0e7ff',
      '--chart-primary': '#4f46e5',
      '--chart-tooltip': '#1e1b4b',
      '--semester-bg': '#e0e7ff',
      '--input-bg': '#eef2ff',
      '--summary-bg': '#f8fafc',
    },
  },
  rose: {
    label: 'Rose',
    icon: 'bi-heart',
    vars: {
      '--primary': '#e11d48',
      '--primary-hover': '#be123c',
      '--sidebar-bg': '#881337',
      '--sidebar-text': '#fecdd3',
      '--sidebar-active': '#e11d48',
      '--body-bg': '#fff1f2',
      '--card-bg': '#ffffff',
      '--text-primary': '#881337',
      '--text-body': '#0f172a',
      '--text-muted': '#64748b',
      '--border-color': '#fecdd3',
      '--chart-grid': '#fecdd3',
      '--chart-primary': '#e11d48',
      '--chart-tooltip': '#881337',
      '--semester-bg': '#ffe4e6',
      '--input-bg': '#fff1f2',
      '--summary-bg': '#f8fafc',
    },
  },
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const defaults = { theme: 'teal', compactTables: false, emailAlerts: true, showActivity: true };
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return { theme: 'teal', compactTables: false, emailAlerts: true, showActivity: true };
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.teal;
  document.documentElement.setAttribute('data-theme', themeId);

  Object.entries(theme.vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  document.documentElement.style.colorScheme = themeId === 'dark' ? 'dark' : 'light';
}

function applySettings(settings) {
  applyTheme(settings.theme);
  document.body.classList.toggle('compact-tables', !!settings.compactTables);
}

function getChartColors() {
  const root = getComputedStyle(document.documentElement);
  return {
    primary: root.getPropertyValue('--chart-primary').trim() || '#0d9488',
    grid: root.getPropertyValue('--chart-grid').trim() || '#ccfbf1',
    tooltip: root.getPropertyValue('--chart-tooltip').trim() || '#134e4a',
    muted: root.getPropertyValue('--text-muted').trim() || '#64748b',
  };
}

function initSettings(onThemeChange) {
  const settings = loadSettings();
  applySettings(settings);

  const themeGrid = document.getElementById('themeGrid');
  if (themeGrid) {
    themeGrid.innerHTML = Object.entries(THEMES)
      .map(
        ([id, theme]) => `
        <button type="button" class="theme-option ${settings.theme === id ? 'active' : ''}" data-theme="${id}" aria-pressed="${settings.theme === id}">
          <span class="theme-swatch theme-swatch--${id}"></span>
          <span class="theme-option-label"><i class="bi ${theme.icon}"></i> ${theme.label}</span>
        </button>
      `
      )
      .join('');

    themeGrid.querySelectorAll('[data-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        settings.theme = btn.dataset.theme;
        saveSettings(settings);
        applySettings(settings);

        themeGrid.querySelectorAll('[data-theme]').forEach((b) => {
          b.classList.toggle('active', b.dataset.theme === settings.theme);
          b.setAttribute('aria-pressed', b.dataset.theme === settings.theme);
        });

        showSettingsToast('Theme updated to ' + THEMES[settings.theme].label);
        if (onThemeChange) onThemeChange();
      });
    });
  }

  const compactToggle = document.getElementById('settingCompactTables');
  const emailToggle = document.getElementById('settingEmailAlerts');
  const activityToggle = document.getElementById('settingShowActivity');

  if (compactToggle) {
    compactToggle.checked = settings.compactTables;
    compactToggle.addEventListener('change', () => {
      settings.compactTables = compactToggle.checked;
      saveSettings(settings);
      applySettings(settings);
    });
  }

  if (emailToggle) {
    emailToggle.checked = settings.emailAlerts;
    emailToggle.addEventListener('change', () => {
      settings.emailAlerts = emailToggle.checked;
      saveSettings(settings);
      showSettingsToast(emailToggle.checked ? 'Email alerts enabled' : 'Email alerts disabled');
    });
  }

  if (activityToggle) {
    activityToggle.checked = settings.showActivity;
    activityToggle.addEventListener('change', () => {
      settings.showActivity = activityToggle.checked;
      saveSettings(settings);
      const activityPanel = document.getElementById('activityPanel');
      if (activityPanel) activityPanel.hidden = !settings.showActivity;
    });
    const activityPanel = document.getElementById('activityPanel');
    if (activityPanel) activityPanel.hidden = !settings.showActivity;
  }

  const resetBtn = document.getElementById('resetSettingsBtn');
  if (resetBtn && themeGrid) {
    resetBtn.addEventListener('click', () => {
      const defaults = { theme: 'teal', compactTables: false, emailAlerts: true, showActivity: true };
      saveSettings(defaults);
      applySettings(defaults);
      if (compactToggle) compactToggle.checked = false;
      if (emailToggle) emailToggle.checked = true;
      if (activityToggle) activityToggle.checked = true;
      const activityPanel = document.getElementById('activityPanel');
      if (activityPanel) activityPanel.hidden = false;

      themeGrid.querySelectorAll('[data-theme]').forEach((b) => {
        b.classList.toggle('active', b.dataset.theme === 'teal');
        b.setAttribute('aria-pressed', b.dataset.theme === 'teal');
      });

      showSettingsToast('Settings restored to defaults');
      if (onThemeChange) onThemeChange();
    });
  }
}

function showSettingsToast(message) {
  const toastEl = document.getElementById('settingsToast');
  if (!toastEl) return;
  toastEl.querySelector('.toast-body').textContent = message;
  bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

/** Apply theme before paint to avoid flash */
(function applyStoredThemeEarly() {
  const settings = loadSettings();
  applyTheme(settings.theme);
})();
