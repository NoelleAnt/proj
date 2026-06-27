'use strict';

/** Realistic sample data for CIIT College of Arts & Technology */

const SEMESTER = '1st Semester 2025–2026';

const STUDENTS = [
  { id: 'STU-2021-0142', name: 'Maria Santos Dela Cruz', email: 'maria.delacruz@student.ciit.edu', major: 'BS Information Technology', year: '4th Year', status: 'active', gpa: 3.72, enrolled: 'Aug 2021' },
  { id: 'STU-2022-0089', name: 'Juan Miguel Reyes', email: 'jm.reyes@student.ciit.edu', major: 'BS Computer Science', year: '3rd Year', status: 'active', gpa: 3.45, enrolled: 'Aug 2022' },
  { id: 'STU-2023-0201', name: 'Angela Nicole Tan', email: 'angela.tan@student.ciit.edu', major: 'BS Multimedia Arts', year: '2nd Year', status: 'active', gpa: 3.88, enrolled: 'Aug 2023' },
  { id: 'STU-2023-0156', name: 'Carlos Eduardo Lim', email: 'carlos.lim@student.ciit.edu', major: 'BS Information Technology', year: '2nd Year', status: 'active', gpa: 3.21, enrolled: 'Aug 2023' },
  { id: 'STU-2024-0034', name: 'Patricia Mae Villanueva', email: 'patricia.v@student.ciit.edu', major: 'BS Animation', year: '1st Year', status: 'active', gpa: 3.95, enrolled: 'Aug 2024' },
  { id: 'STU-2024-0078', name: 'Rafael Dominic Go', email: 'rafael.go@student.ciit.edu', major: 'BS Computer Science', year: '1st Year', status: 'active', gpa: 3.54, enrolled: 'Aug 2024' },
  { id: 'STU-2022-0112', name: 'Sophia Isabel Mendoza', email: 'sophia.mendoza@student.ciit.edu', major: 'BS Multimedia Arts', year: '3rd Year', status: 'on-leave', gpa: 3.67, enrolled: 'Aug 2022' },
  { id: 'STU-2020-0098', name: 'James Patrick Ocampo', email: 'james.ocampo@student.ciit.edu', major: 'BS Information Technology', year: '4th Year', status: 'graduated', gpa: 3.81, enrolled: 'Aug 2020' },
  { id: 'STU-2024-0091', name: 'Hannah Louise Garcia', email: 'hannah.garcia@student.ciit.edu', major: 'BS Animation', year: '1st Year', status: 'active', gpa: 3.62, enrolled: 'Aug 2024' },
  { id: 'STU-2023-0188', name: 'Marcus Andrei Bautista', email: 'marcus.bautista@student.ciit.edu', major: 'BS Computer Science', year: '2nd Year', status: 'inactive', gpa: 2.89, enrolled: 'Aug 2023' },
  { id: 'STU-2021-0067', name: 'Isabelle Rose Fernandez', email: 'isabelle.f@student.ciit.edu', major: 'BS Multimedia Arts', year: '4th Year', status: 'active', gpa: 3.79, enrolled: 'Aug 2021' },
  { id: 'STU-2024-0045', name: 'Ethan Samuel Cruz', email: 'ethan.cruz@student.ciit.edu', major: 'BS Information Technology', year: '1st Year', status: 'active', gpa: 3.41, enrolled: 'Aug 2024' },
];

const COURSES = [
  { code: 'IT-301', name: 'Web Application Development', instructor: 'Prof. Elena Ramirez', credits: 3, enrolled: 28, schedule: 'MWF 10:00–11:30 AM', room: 'Lab 204', department: 'Information Technology' },
  { code: 'CS-210', name: 'Data Structures & Algorithms', instructor: 'Dr. Michael Torres', credits: 4, enrolled: 32, schedule: 'TTh 1:00–2:30 PM', room: 'Room 312', department: 'Computer Science' },
  { code: 'MMA-105', name: 'Digital Illustration Fundamentals', instructor: 'Ms. Clara Navarro', credits: 3, enrolled: 24, schedule: 'MWF 2:00–3:30 PM', room: 'Studio A', department: 'Multimedia Arts' },
  { code: 'IT-205', name: 'Database Management Systems', instructor: 'Prof. Elena Ramirez', credits: 3, enrolled: 30, schedule: 'TTh 9:00–10:30 AM', room: 'Lab 201', department: 'Information Technology' },
  { code: 'ANIM-120', name: '2D Character Animation', instructor: 'Mr. Diego Salazar', credits: 3, enrolled: 18, schedule: 'MWF 8:00–9:30 AM', room: 'Studio B', department: 'Animation' },
  { code: 'CS-315', name: 'Machine Learning Basics', instructor: 'Dr. Michael Torres', credits: 3, enrolled: 22, schedule: 'TTh 3:00–4:30 PM', room: 'Lab 305', department: 'Computer Science' },
  { code: 'GE-102', name: 'Ethics in Technology', instructor: 'Prof. Linda Aquino', credits: 2, enrolled: 45, schedule: 'Sat 9:00–11:00 AM', room: 'Room 101', department: 'General Education' },
  { code: 'IT-410', name: 'Capstone Project I', instructor: 'Prof. Elena Ramirez', credits: 3, enrolled: 15, schedule: 'F 1:00–4:00 PM', room: 'Lab 204', department: 'Information Technology' },
  { code: 'MMA-220', name: 'Motion Graphics & VFX', instructor: 'Ms. Clara Navarro', credits: 3, enrolled: 20, schedule: 'TTh 10:30–12:00 NN', room: 'Studio A', department: 'Multimedia Arts' },
  { code: 'CS-180', name: 'Object-Oriented Programming', instructor: 'Dr. Michael Torres', credits: 4, enrolled: 35, schedule: 'MWF 1:00–2:30 PM', room: 'Lab 302', department: 'Computer Science' },
];

const GRADES = [
  { studentId: 'STU-2021-0142', studentName: 'Maria Santos Dela Cruz', course: 'IT-301 Web Application Development', midterm: 88, final: 92, project: 95, overall: 91.7, letter: 'A' },
  { studentId: 'STU-2022-0089', studentName: 'Juan Miguel Reyes', course: 'CS-210 Data Structures & Algorithms', midterm: 76, final: 82, project: 85, overall: 80.8, letter: 'B' },
  { studentId: 'STU-2023-0201', studentName: 'Angela Nicole Tan', course: 'MMA-105 Digital Illustration', midterm: 94, final: 96, project: 98, overall: 96.0, letter: 'A' },
  { studentId: 'STU-2023-0156', studentName: 'Carlos Eduardo Lim', course: 'IT-205 Database Management', midterm: 72, final: 78, project: 80, overall: 76.7, letter: 'C' },
  { studentId: 'STU-2024-0034', studentName: 'Patricia Mae Villanueva', course: 'ANIM-120 2D Character Animation', midterm: 90, final: 93, project: 94, overall: 92.3, letter: 'A' },
  { studentId: 'STU-2024-0078', studentName: 'Rafael Dominic Go', course: 'CS-180 Object-Oriented Programming', midterm: 84, final: 86, project: 88, overall: 86.0, letter: 'B' },
  { studentId: 'STU-2021-0142', studentName: 'Maria Santos Dela Cruz', course: 'IT-410 Capstone Project I', midterm: 91, final: null, project: 93, overall: 92.0, letter: 'A' },
  { studentId: 'STU-2022-0112', studentName: 'Sophia Isabel Mendoza', course: 'MMA-220 Motion Graphics & VFX', midterm: 85, final: 87, project: 90, overall: 87.3, letter: 'B' },
  { studentId: 'STU-2023-0188', studentName: 'Marcus Andrei Bautista', course: 'CS-315 Machine Learning Basics', midterm: 58, final: 65, project: 70, overall: 64.3, letter: 'D' },
  { studentId: 'STU-2021-0067', studentName: 'Isabelle Rose Fernandez', course: 'MMA-220 Motion Graphics & VFX', midterm: 92, final: 94, project: 96, overall: 94.0, letter: 'A' },
  { studentId: 'STU-2024-0091', studentName: 'Hannah Louise Garcia', course: 'ANIM-120 2D Character Animation', midterm: 88, final: 90, project: 91, overall: 89.7, letter: 'B' },
  { studentId: 'STU-2024-0045', studentName: 'Ethan Samuel Cruz', course: 'IT-205 Database Management', midterm: 80, final: 83, project: 86, overall: 83.0, letter: 'B' },
  { studentId: 'STU-2022-0089', studentName: 'Juan Miguel Reyes', course: 'CS-315 Machine Learning Basics', midterm: 79, final: 84, project: 82, overall: 81.7, letter: 'B' },
  { studentId: 'STU-2023-0201', studentName: 'Angela Nicole Tan', course: 'GE-102 Ethics in Technology', midterm: 95, final: 97, project: null, overall: 96.0, letter: 'A' },
  { studentId: 'STU-2023-0156', studentName: 'Carlos Eduardo Lim', course: 'IT-301 Web Application Development', midterm: 68, final: 74, project: 72, overall: 71.3, letter: 'C' },
];

const ATTENDANCE = [
  { date: '2025-06-02', studentId: 'STU-2021-0142', studentName: 'Maria Santos Dela Cruz', course: 'IT-301', status: 'present', notes: '' },
  { date: '2025-06-02', studentId: 'STU-2023-0156', studentName: 'Carlos Eduardo Lim', course: 'IT-301', status: 'late', notes: 'Arrived 15 min late' },
  { date: '2025-06-02', studentId: 'STU-2024-0045', studentName: 'Ethan Samuel Cruz', course: 'IT-301', status: 'present', notes: '' },
  { date: '2025-06-03', studentId: 'STU-2022-0089', studentName: 'Juan Miguel Reyes', course: 'CS-210', status: 'present', notes: '' },
  { date: '2025-06-03', studentId: 'STU-2024-0078', studentName: 'Rafael Dominic Go', course: 'CS-180', status: 'absent', notes: 'Unexcused absence' },
  { date: '2025-06-04', studentId: 'STU-2023-0201', studentName: 'Angela Nicole Tan', course: 'MMA-105', status: 'present', notes: '' },
  { date: '2025-06-04', studentId: 'STU-2022-0112', studentName: 'Sophia Isabel Mendoza', course: 'MMA-220', status: 'excused', notes: 'Medical certificate submitted' },
  { date: '2025-06-05', studentId: 'STU-2024-0034', studentName: 'Patricia Mae Villanueva', course: 'ANIM-120', status: 'present', notes: '' },
  { date: '2025-06-05', studentId: 'STU-2024-0091', studentName: 'Hannah Louise Garcia', course: 'ANIM-120', status: 'present', notes: '' },
  { date: '2025-06-05', studentId: 'STU-2023-0188', studentName: 'Marcus Andrei Bautista', course: 'CS-315', status: 'absent', notes: 'No prior notice' },
  { date: '2025-06-06', studentId: 'STU-2021-0067', studentName: 'Isabelle Rose Fernandez', course: 'MMA-220', status: 'present', notes: '' },
  { date: '2025-06-06', studentId: 'STU-2021-0142', studentName: 'Maria Santos Dela Cruz', course: 'IT-410', status: 'present', notes: '' },
  { date: '2025-06-09', studentId: 'STU-2022-0089', studentName: 'Juan Miguel Reyes', course: 'CS-315', status: 'late', notes: 'Traffic delay' },
  { date: '2025-06-09', studentId: 'STU-2023-0156', studentName: 'Carlos Eduardo Lim', course: 'IT-205', status: 'present', notes: '' },
  { date: '2025-06-10', studentId: 'STU-2024-0078', studentName: 'Rafael Dominic Go', course: 'CS-180', status: 'present', notes: '' },
  { date: '2025-06-10', studentId: 'STU-2024-0045', studentName: 'Ethan Samuel Cruz', course: 'IT-205', status: 'absent', notes: 'Family emergency — excused pending docs' },
  { date: '2025-06-11', studentId: 'STU-2023-0201', studentName: 'Angela Nicole Tan', course: 'GE-102', status: 'present', notes: '' },
  { date: '2025-06-11', studentId: 'STU-2021-0142', studentName: 'Maria Santos Dela Cruz', course: 'IT-301', status: 'present', notes: '' },
];

const RECENT_ACTIVITY = [
  { type: 'enrollment', message: 'Patricia Mae Villanueva enrolled in ANIM-120', time: '2 hours ago', icon: 'bi-person-plus', color: 'bg-success-subtle text-success' },
  { type: 'grade', message: 'Final grades posted for CS-210 Data Structures', time: '5 hours ago', icon: 'bi-journal-check', color: 'bg-primary-subtle text-primary' },
  { type: 'attendance', message: '3 unexcused absences flagged for Marcus Andrei Bautista', time: 'Yesterday', icon: 'bi-exclamation-triangle', color: 'bg-warning-subtle text-warning' },
  { type: 'course', message: 'New section added: IT-301 (MWF PM)', time: 'Yesterday', icon: 'bi-book', color: 'bg-info-subtle text-info' },
  { type: 'graduation', message: 'James Patrick Ocampo marked as graduated', time: '2 days ago', icon: 'bi-mortarboard', color: 'bg-secondary-subtle text-secondary' },
];

const CHART_DATA = {
  enrollment: {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [842, 856, 861, 858, 845, 848, 852, 859, 864, 871, 876],
  },
  gradeDistribution: {
    labels: ['A', 'B', 'C', 'D', 'F'],
    values: [38, 34, 18, 7, 3],
  },
  attendanceWeekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    values: [94.2, 91.8, 93.5, 89.6, 92.1],
  },
  departmentEnrollment: {
    labels: ['IT', 'CS', 'MMA', 'Animation', 'Gen Ed'],
    values: [312, 248, 156, 98, 62],
  },
};

const REPORTS = [
  { id: 'enrollment', title: 'Enrollment Summary', description: 'Headcount by program, year level, and status for the current semester.', icon: 'bi-people', color: 'bg-teal-subtle text-teal' },
  { id: 'grades', title: 'Grade Performance Report', description: 'GPA trends, grade distribution, and at-risk student identification.', icon: 'bi-bar-chart', color: 'bg-primary-subtle text-primary' },
  { id: 'attendance', title: 'Attendance Compliance', description: 'Daily attendance rates, chronic absenteeism, and excused vs unexcused.', icon: 'bi-calendar-check', color: 'bg-success-subtle text-success' },
  { id: 'courses', title: 'Course Load Analysis', description: 'Enrollment capacity, instructor workload, and room utilization.', icon: 'bi-journal-bookmark', color: 'bg-warning-subtle text-warning' },
  { id: 'financial', title: 'Scholarship & Aid Report', description: 'Scholarship recipients, tuition status, and financial hold summary.', icon: 'bi-cash-stack', color: 'bg-info-subtle text-info' },
  { id: 'graduation', title: 'Graduation Pipeline', description: 'Expected graduates, completion rates, and thesis/capstone progress.', icon: 'bi-mortarboard', color: 'bg-danger-subtle text-danger' },
];

/** Computed summary stats */
const SUMMARY = {
  totalStudents: STUDENTS.length,
  activeStudents: STUDENTS.filter((s) => s.status === 'active').length,
  totalCourses: COURSES.length,
  avgGpa: (STUDENTS.filter((s) => s.status !== 'graduated').reduce((sum, s) => sum + s.gpa, 0) / STUDENTS.filter((s) => s.status !== 'graduated').length).toFixed(2),
  attendanceRate: ((ATTENDANCE.filter((a) => a.status === 'present' || a.status === 'late').length / ATTENDANCE.length) * 100).toFixed(1),
  totalEnrolled: COURSES.reduce((sum, c) => sum + c.enrolled, 0),
};
