'use strict';

/* ── Utilities ── */
function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d9488&color=fff&size=64`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function gradeClass(letter) {
  const map = { A: 'grade-a', B: 'grade-b', C: 'grade-c', D: 'grade-d', F: 'grade-f' };
  return map[letter] || 'grade-c';
}

function statusLabel(status) {
  const labels = {
    'on-leave': 'On Leave',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    excused: 'Excused',
  };
  return labels[status] || capitalize(status);
}

/* ── Sidebar & Navigation ── */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener('click', closeSidebar);

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) closeSidebar();
  });

  return { closeSidebar };
}

function initNavigation(onNavigate) {
  const navLinks = document.querySelectorAll('.sidebar-nav [data-view]');
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  const headerAction = document.getElementById('headerAction');

  const viewMeta = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of student records and academic performance.', action: 'Export Data' },
    students: { title: 'Students', subtitle: 'Manage student profiles, enrollment, and academic standing.', action: 'Add Student' },
    courses: { title: 'Courses', subtitle: 'View and manage course offerings for the current semester.', action: 'Add Course' },
    grades: { title: 'Grades', subtitle: 'Track midterm, final, and project scores across all courses.', action: 'Import Grades' },
    attendance: { title: 'Attendance', subtitle: 'Daily attendance records and compliance monitoring.', action: 'Mark Attendance' },
    reports: { title: 'Reports', subtitle: 'Generate and export academic and administrative reports.', action: 'Export All' },
    settings: { title: 'Settings', subtitle: 'Customize appearance, notifications, and account preferences.', action: null },
  };

  function navigateTo(view) {
    document.querySelectorAll('.sidebar-nav [data-view]').forEach((l) => {
      l.classList.toggle('active', l.dataset.view === view);
    });

    const settingsBtn = document.querySelector('.sidebar-footer [data-goto="settings"]');
    if (settingsBtn) settingsBtn.classList.toggle('active', view === 'settings');

    document.querySelectorAll('.view-section').forEach((section) => {
      section.classList.toggle('active', section.id === `view-${view}`);
    });

    const meta = viewMeta[view];
    if (meta) {
      pageTitle.textContent = meta.title;
      pageSubtitle.textContent = meta.subtitle;
      if (headerAction) {
        headerAction.hidden = !meta.action;
        if (meta.action) {
          headerAction.innerHTML = `<i class="bi bi-download"></i><span class="d-none d-sm-inline">${meta.action}</span>`;
        }
      }
    }

    if (onNavigate) onNavigate(view);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.view);
    });
  });

  document.querySelectorAll('[data-goto]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.goto);
    });
  });

  return { navigateTo };
}

/* ── Global Search ── */
function initGlobalSearch() {
  const input = document.getElementById('globalSearch');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const query = input.value.trim().toLowerCase();
    if (!query) return;

    const studentMatch = STUDENTS.find(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
    );

    document.querySelector('[data-view="students"]').click();
    const studentSearch = document.getElementById('studentSearch');
    if (studentSearch) {
      studentSearch.value = studentMatch ? studentMatch.name.split(' ')[0] : query;
      studentSearch.dispatchEvent(new Event('input'));
    }
  });
}

/* ── Dashboard ── */
let enrollmentChart = null;
let gradeChart = null;

function initDashboardCharts() {
  createEnrollmentChart();
  createGradeChart();
  renderRecentActivity();
  renderDashboardStats();
}

function renderDashboardStats() {
  document.getElementById('statStudents').textContent = SUMMARY.totalStudents;
  document.getElementById('statCourses').textContent = SUMMARY.totalCourses;
  document.getElementById('statGpa').textContent = SUMMARY.avgGpa;
  document.getElementById('statAttendance').textContent = `${SUMMARY.attendanceRate}%`;
}

function createEnrollmentChart() {
  const canvas = document.getElementById('enrollmentChart');
  if (!canvas) return;

  if (enrollmentChart) enrollmentChart.destroy();

  const colors = getChartColors();

  enrollmentChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: CHART_DATA.enrollment.labels,
      datasets: [{
        label: 'Enrolled Students',
        data: CHART_DATA.enrollment.values,
        borderColor: colors.primary,
        backgroundColor: colors.primary + '1a',
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }],
    },
    options: chartOptions('Students'),
  });
}

function createGradeChart() {
  const canvas = document.getElementById('gradeDistChart');
  if (!canvas) return;

  if (gradeChart) gradeChart.destroy();

  gradeChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: CHART_DATA.gradeDistribution.labels,
      datasets: [{
        data: CHART_DATA.gradeDistribution.values,
        backgroundColor: ['#16a34a', '#2563eb', '#ca8a04', '#ea580c', '#dc2626'],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, usePointStyle: true, font: { size: 12 } },
        },
      },
    },
  });
}

function chartOptions(yLabel) {
  const colors = getChartColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.tooltip,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: colors.muted, font: { size: 12 } },
      },
      y: {
        beginAtZero: false,
        grid: { color: colors.grid },
        ticks: { color: colors.muted, font: { size: 12 } },
        title: { display: true, text: yLabel, color: colors.muted, font: { size: 11 } },
      },
    },
  };
}

function renderRecentActivity() {
  const list = document.getElementById('activityList');
  if (!list) return;

  list.innerHTML = RECENT_ACTIVITY.map(
    (item) => `
      <li class="activity-item">
        <div class="activity-icon ${item.color}">
          <i class="bi ${item.icon}"></i>
        </div>
        <div>
          <p class="activity-text">${item.message}</p>
          <p class="activity-time">${item.time}</p>
        </div>
      </li>
    `
  ).join('');
}

function renderTopStudents() {
  const tbody = document.getElementById('topStudentsBody');
  if (!tbody) return;

  const top = [...STUDENTS]
    .filter((s) => s.status === 'active')
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 5);

  tbody.innerHTML = top
    .map(
      (s, i) => `
      <tr>
        <td><span class="tag-badge">#${i + 1}</span></td>
        <td>
          <div class="user-cell">
            <img src="${getAvatarUrl(s.name)}" alt="${s.name}">
            <div>
              <div class="user-name">${s.name}</div>
              <div class="user-id">${s.id}</div>
            </div>
          </div>
        </td>
        <td>${s.major.replace('BS ', '')}</td>
        <td><strong>${s.gpa.toFixed(2)}</strong></td>
      </tr>
    `
    )
    .join('');
}

/* ── Students Table ── */
function renderStudentRow(student) {
  return `
    <tr>
      <td>
        <div class="user-cell">
          <img src="${getAvatarUrl(student.name)}" alt="${student.name}">
          <div>
            <div class="user-name">${student.name}</div>
            <div class="user-id">${student.id}</div>
          </div>
        </div>
      </td>
      <td class="d-none d-lg-table-cell">${student.email}</td>
      <td>${student.major.replace('BS ', '')}</td>
      <td>${student.year}</td>
      <td><span class="status-badge ${student.status}">${statusLabel(student.status)}</span></td>
      <td><strong>${student.gpa.toFixed(2)}</strong></td>
      <td class="d-none d-md-table-cell">${student.enrolled}</td>
      <td class="text-end">
        <button class="action-btn" title="View profile"><i class="bi bi-eye"></i></button>
        <button class="action-btn" title="Edit"><i class="bi bi-pencil"></i></button>
      </td>
    </tr>
  `;
}

function renderStudents(students) {
  const tbody = document.getElementById('studentTableBody');
  tbody.innerHTML = students.length
    ? students.map(renderStudentRow).join('')
    : '<tr><td colspan="8" class="text-center text-muted py-4">No students found</td></tr>';
}

function initStudentFilters() {
  const search = document.getElementById('studentSearch');
  const statusFilter = document.getElementById('studentStatusFilter');
  const majorFilter = document.getElementById('studentMajorFilter');

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const status = statusFilter.value;
    const major = majorFilter.value;

    const filtered = STUDENTS.filter((s) => {
      const matchQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.major.toLowerCase().includes(query);
      const matchStatus = !status || s.status === status;
      const matchMajor = !major || s.major.includes(major);
      return matchQuery && matchStatus && matchMajor;
    });

    renderStudents(filtered);
    document.getElementById('studentCount').textContent = `${filtered.length} students`;
  }

  search.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  majorFilter.addEventListener('change', applyFilters);
  applyFilters();
}

/* ── Courses Table ── */
function renderCourseRow(course) {
  const capacity = Math.round((course.enrolled / 40) * 100);
  return `
    <tr>
      <td><span class="tag-badge">${course.code}</span></td>
      <td><strong>${course.name}</strong></td>
      <td class="d-none d-md-table-cell">${course.instructor}</td>
      <td>${course.credits}</td>
      <td>
        ${course.enrolled}
        <div class="progress progress-thin mt-1" style="width: 80px;">
          <div class="progress-bar bg-teal" style="width: ${Math.min(capacity, 100)}%"></div>
        </div>
      </td>
      <td class="d-none d-lg-table-cell">${course.schedule}</td>
      <td class="d-none d-xl-table-cell">${course.room}</td>
      <td class="text-end">
        <button class="action-btn" title="View roster"><i class="bi bi-people"></i></button>
        <button class="action-btn" title="Edit course"><i class="bi bi-pencil"></i></button>
      </td>
    </tr>
  `;
}

function renderCourses(courses) {
  const tbody = document.getElementById('courseTableBody');
  tbody.innerHTML = courses.length
    ? courses.map(renderCourseRow).join('')
    : '<tr><td colspan="8" class="text-center text-muted py-4">No courses found</td></tr>';
}

function initCourseSearch() {
  const input = document.getElementById('courseSearch');
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    const filtered = COURSES.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.instructor.toLowerCase().includes(query) ||
        c.department.toLowerCase().includes(query)
    );
    renderCourses(filtered);
  });
  renderCourses(COURSES);
}

/* ── Grades Table ── */
function renderGradeRow(grade) {
  return `
    <tr>
      <td>
        <div class="user-name">${grade.studentName}</div>
        <div class="user-id">${grade.studentId}</div>
      </td>
      <td class="d-none d-md-table-cell">${grade.course}</td>
      <td>${grade.midterm ?? '—'}</td>
      <td>${grade.final ?? '—'}</td>
      <td class="d-none d-lg-table-cell">${grade.project ?? '—'}</td>
      <td><strong>${grade.overall.toFixed(1)}</strong></td>
      <td><span class="grade-badge ${gradeClass(grade.letter)}">${grade.letter}</span></td>
      <td class="text-end">
        <button class="action-btn" title="View details"><i class="bi bi-eye"></i></button>
      </td>
    </tr>
  `;
}

function renderGrades(grades) {
  const tbody = document.getElementById('gradeTableBody');
  tbody.innerHTML = grades.length
    ? grades.map(renderGradeRow).join('')
    : '<tr><td colspan="8" class="text-center text-muted py-4">No grade records found</td></tr>';
}

function initGradeFilters() {
  const search = document.getElementById('gradeSearch');
  const letterFilter = document.getElementById('gradeLetterFilter');

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const letter = letterFilter.value;

    const filtered = GRADES.filter((g) => {
      const matchQuery =
        !query ||
        g.studentName.toLowerCase().includes(query) ||
        g.studentId.toLowerCase().includes(query) ||
        g.course.toLowerCase().includes(query);
      const matchLetter = !letter || g.letter === letter;
      return matchQuery && matchLetter;
    });

    renderGrades(filtered);
  }

  search.addEventListener('input', applyFilters);
  letterFilter.addEventListener('change', applyFilters);
  applyFilters();
}

/* ── Attendance Table ── */
function renderAttendanceRow(record) {
  return `
    <tr>
      <td>${formatDate(record.date)}</td>
      <td>
        <div class="user-name">${record.studentName}</div>
        <div class="user-id">${record.studentId}</div>
      </td>
      <td><span class="tag-badge">${record.course}</span></td>
      <td><span class="status-badge ${record.status}">${statusLabel(record.status)}</span></td>
      <td class="d-none d-md-table-cell text-muted">${record.notes || '—'}</td>
      <td class="text-end">
        <button class="action-btn" title="Edit record"><i class="bi bi-pencil"></i></button>
      </td>
    </tr>
  `;
}

function renderAttendance(records) {
  const tbody = document.getElementById('attendanceTableBody');
  tbody.innerHTML = records.length
    ? records.map(renderAttendanceRow).join('')
    : '<tr><td colspan="6" class="text-center text-muted py-4">No attendance records found</td></tr>';
}

function initAttendanceFilters() {
  const search = document.getElementById('attendanceSearch');
  const statusFilter = document.getElementById('attendanceStatusFilter');
  const courseFilter = document.getElementById('attendanceCourseFilter');

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const status = statusFilter.value;
    const course = courseFilter.value;

    const filtered = ATTENDANCE.filter((a) => {
      const matchQuery =
        !query ||
        a.studentName.toLowerCase().includes(query) ||
        a.studentId.toLowerCase().includes(query) ||
        a.course.toLowerCase().includes(query);
      const matchStatus = !status || a.status === status;
      const matchCourse = !course || a.course === course;
      return matchQuery && matchStatus && matchCourse;
    });

    renderAttendance(filtered);

    const presentOrLate = filtered.filter((a) => a.status === 'present' || a.status === 'late').length;
    const rate = filtered.length ? ((presentOrLate / filtered.length) * 100).toFixed(1) : '0.0';
    document.getElementById('attendanceFilterRate').textContent = `${rate}% present/late`;
  }

  search.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  courseFilter.addEventListener('change', applyFilters);
  applyFilters();
}

/* ── Reports ── */
let reportCharts = {};

function renderReportCards() {
  const grid = document.getElementById('reportCards');
  grid.innerHTML = REPORTS.map(
    (r) => `
    <div class="col-sm-6 col-xl-4">
      <article class="report-card">
        <div class="report-card-icon ${r.color}">
          <i class="bi ${r.icon}"></i>
        </div>
        <h4>${r.title}</h4>
        <p>${r.description}</p>
        <button class="btn btn-sm btn-outline-secondary" data-report="${r.id}">
          <i class="bi bi-download"></i> Generate PDF
        </button>
      </article>
    </div>
  `
  ).join('');

  grid.querySelectorAll('[data-report]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.innerHTML = '<i class="bi bi-check-lg"></i> Queued';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-download"></i> Generate PDF';
        btn.disabled = false;
      }, 2000);
    });
  });
}

function initReportCharts() {
  createAttendanceReportChart();
  createDepartmentChart();
}

function createAttendanceReportChart() {
  const canvas = document.getElementById('attendanceReportChart');
  if (!canvas) return;

  if (reportCharts.attendance) reportCharts.attendance.destroy();

  const colors = getChartColors();

  reportCharts.attendance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: CHART_DATA.attendanceWeekly.labels,
      datasets: [{
        label: 'Attendance Rate (%)',
        data: CHART_DATA.attendanceWeekly.values,
        backgroundColor: colors.primary + 'bf',
        borderRadius: 6,
        barThickness: 36,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: colors.muted } },
        y: {
          min: 80,
          max: 100,
          grid: { color: colors.grid },
          ticks: { callback: (v) => v + '%', color: colors.muted },
        },
      },
    },
  });
}

function createDepartmentChart() {
  const canvas = document.getElementById('departmentChart');
  if (!canvas) return;

  if (reportCharts.department) reportCharts.department.destroy();

  const colors = getChartColors();

  reportCharts.department = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: CHART_DATA.departmentEnrollment.labels,
      datasets: [{
        label: 'Students',
        data: CHART_DATA.departmentEnrollment.values,
        backgroundColor: [colors.primary, '#2563eb', '#9333ea', '#ea580c', colors.muted],
        borderRadius: 6,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: colors.grid }, ticks: { color: colors.muted } },
        y: { grid: { display: false }, ticks: { color: colors.muted } },
      },
    },
  });
}

function renderReportSummary() {
  const activeCount = STUDENTS.filter((s) => s.status === 'active').length;
  const atRisk = STUDENTS.filter((s) => s.status === 'active' && s.gpa < 3.0).length;
  const unexcused = ATTENDANCE.filter((a) => a.status === 'absent').length;
  const graduates = STUDENTS.filter((s) => s.status === 'graduated' || (s.status === 'active' && s.year === '4th Year')).length;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('reportActiveCount', activeCount);
  set('reportAtRisk', atRisk);
  set('reportUnexcused', unexcused);
  set('reportGraduates', graduates);
}

function refreshAllCharts() {
  createEnrollmentChart();
  createGradeChart();
  if (reportCharts.attendance || document.getElementById('view-reports')?.classList.contains('active')) {
    initReportCharts();
  }
}

/* ── Init ── */
let appInitialized = false;

function initApp() {
  if (appInitialized) return;
  appInitialized = true;

  if (typeof Chart === 'undefined') {
    throw new Error('Chart.js failed to load. Check your internet connection.');
  }

  const { closeSidebar } = initSidebar();

  const { navigateTo } = initNavigation((view) => {
    closeSidebar();
    if (view === 'reports') {
      requestAnimationFrame(() => {
        initReportCharts();
        renderReportSummary();
      });
    }
  });

  initSettings(refreshAllCharts);

  initGlobalSearch();
  initDashboardCharts();
  renderTopStudents();
  initStudentFilters();
  initCourseSearch();
  initGradeFilters();
  initAttendanceFilters();
  renderReportCards();
  renderReportSummary();

  const semesterText = document.getElementById('semesterText');
  if (semesterText) semesterText.textContent = SEMESTER;

  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.edumanageLogout) window.edumanageLogout();
  });

  return { navigateTo };
}

document.addEventListener('DOMContentLoaded', () => {
  const auth = initLogin(() => {
    initApp();
  });

  if (auth && auth.logout) {
    window.edumanageLogout = auth.logout;
  }
});
