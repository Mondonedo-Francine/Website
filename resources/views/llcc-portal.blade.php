<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>LLCC Portal - Lapu-Lapu City College</title>

    @vite([
        'resources/css/llcc-portal.css',
        'resources/js/llcc-portal.js'
    ])
</head>

<body>

<!-- ================= AUTHENTICATION ================= -->

<section id="authPage" class="auth-page">
    <div class="auth-wrapper">

        <div class="auth-brand">
            <div class="logo-circle">
                <img src="data:image/webp;base64,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" alt="LLCC College logo">
            </div>
            <h1>LLCC PORTAL</h1>
            <p>LAPU-LAPU CITY COLLEGE</p>
        </div>

        <div class="auth-form-area">

            <!-- LOGIN FORM -->
            <div id="loginView">
                <h2>Welcome Back!</h2>
                <p class="auth-description">Login to your account</p>

                <div id="loginMessage" class="message"></div>

                <form id="loginForm">

                    <div class="form-group">
                        <label for="loginRole">Login As</label>
                        <select id="loginRole" required>
                            <option value="">Select your role</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="loginUsername">Email or Phone Number</label>
                        <input
                            type="text"
                            id="loginUsername"
                            placeholder="Enter email or phone number"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input
                            type="password"
                            id="loginPassword"
                            placeholder="Enter password"
                            required
                        >
                    </div>

                    <div class="forgot-link">
                        <a href="#" id="forgotPassword">Forgot Password?</a>
                    </div>

                    <button type="submit" class="primary-btn" style="width:100%;">
                        Login
                    </button>
                </form>

                <p class="auth-links">
                    Don't have an account?
                    <a href="#" id="showSignup">Sign up</a>
                </p>

            </div>

            <!-- SIGNUP FORM -->
            <div id="signupView" class="hidden">
                <h2>Create Account</h2>
                <p class="auth-description">Register for the publication portal</p>

                <div id="signupMessage" class="message"></div>

                <form id="signupForm">

                    <div class="form-group">
                        <label for="signupName">Full Name</label>
                        <input
                            type="text"
                            id="signupName"
                            placeholder="Enter your full name"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="signupEmail">Email Address</label>
                        <input
                            type="email"
                            id="signupEmail"
                            placeholder="Enter your email"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="signupPhone">Phone Number</label>
                        <input
                            type="text"
                            id="signupPhone"
                            placeholder="Enter phone number"
                            required
                        >
                    </div>

                    <p class="auth-description">New registrations are student accounts. Teacher accounts must be created by an administrator.</p>

                    <div class="form-group">
                        <label for="signupPassword">Password</label>
                        <input
                            type="password"
                            id="signupPassword"
                            placeholder="Create a password (at least 8 characters)"
                            minlength="8"
                            autocomplete="new-password"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="signupConfirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="signupConfirmPassword"
                            placeholder="Confirm your password"
                            minlength="8"
                            autocomplete="new-password"
                            required
                        >
                    </div>

                    <button type="submit" class="primary-btn" style="width:100%;">
                        Create Account
                    </button>
                </form>

                <p class="auth-links">
                    Already have an account?
                    <a href="#" id="showLogin">Login</a>
                </p>
            </div>

        </div>
    </div>
</section>

<!-- ================= APPLICATION ================= -->

<section id="appPage" class="app hidden">

    <!-- SIDEBAR -->
    <aside class="sidebar">

        <div class="sidebar-brand">
            <div class="small-logo"><img src="data:image/webp;base64,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" alt="LLCC College logo"></div>
            <strong>
                LLCC PORTAL
                <span>LAPU-LAPU CITY COLLEGE</span>
            </strong>
        </div>

        <div class="sidebar-menu">

            <div class="menu-label">MAIN MENU</div>

            <button class="nav-item active" data-page="dashboard">
                <span class="nav-icon">▦</span>
                Dashboard
            </button>

            <button class="nav-item" data-page="attendance">
                <span class="nav-icon">✓</span>
                Attendance
            </button>

            <button class="nav-item" data-page="homework">
                <span class="nav-icon">▤</span>
                Homework
            </button>

            <button class="nav-item" data-page="results">
                <span class="nav-icon">▥</span>
                Results
            </button>

            <button class="nav-item" data-page="solutions">
                <span class="nav-icon">☑</span>
                Solutions
            </button>

            <button class="nav-item" data-page="notices">
                <span class="nav-icon">◌</span>
                Notices
            </button>

            <button class="nav-item" data-page="messages">
                <span class="nav-icon">✉</span>
                Messages
            </button>

            <button class="nav-item logout-nav" id="logoutBtn">
                <span class="nav-icon">↪</span>
                Logout
            </button>

        </div>
    </aside>

    <!-- MAIN AREA -->
    <main class="main">

        <header class="topbar">
            <div class="topbar-title">
                <h2 id="topbarTitle">Dashboard</h2>
                <p id="currentDate"></p>
            </div>

            <div class="topbar-right">
                <div class="notification" id="notificationBell" aria-label="Notifications" style="cursor:pointer;">
                    <button type="button" id="notificationToggle" aria-label="Open notifications" aria-expanded="false" style="border:0;background:transparent;position:relative;font-size:25px;cursor:pointer;color:#6b7485;padding:5px;">🔔<span id="notificationCount" style="display:none;position:absolute;top:-2px;right:-2px;background:#e74c3c;color:white;border-radius:12px;min-width:18px;height:18px;font-size:11px;line-height:18px;text-align:center;padding:0 4px;"></span></button>
                    <div id="notificationPanel" class="hidden" style="position:absolute;right:0;top:38px;width:330px;max-width:85vw;background:#fff;border:1px solid #e7eaf0;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.16);z-index:200;padding:16px;max-height:400px;overflow:auto;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><strong style="font-size:15px;color:#263248;">Notifications</strong><button type="button" id="markNotificationsRead" style="border:0;background:transparent;color:#3420c8;font-size:12px;cursor:pointer;">Mark all read</button></div>
                        <div id="notificationItems"><p style="font-size:13px;color:#737b8c;padding:12px 0;">No new notifications.</p></div>
                    </div>
                </div>
                <button class="user-box profile-shortcut" id="openProfileBtn" type="button" aria-label="Open My Profile" title="Open My Profile">
                    <div class="avatar" id="topAvatar">CR</div>
                    <div class="profile-shortcut-text">
                        <strong id="topUserName">Student</strong>
                        <small id="topUserRole">Student</small>
                    </div>
                </button>
            </div>
        </header>

        <div class="content">

            <!-- DASHBOARD PAGE -->
            <section id="dashboardPage" class="page active">

                <div class="welcome-card">
                    <div>
                        <h1>Welcome, <span id="welcomeName">Student</span>!</h1>
                        <p>Have a productive day and keep learning.</p>
                    </div>
                    <div class="welcome-art"><img src="data:image/webp;base64,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" alt="LLCC College logo"></div>
                </div>

                <div class="stats-grid">

                    <div class="stat-card">
                        <div class="stat-top">
                            <div class="stat-icon">▣</div>
                        </div>
                        <h3 id="attendanceStat">92%</h3>
                        <p id="attendanceStatLabel">Attendance Rate</p>
                    </div>

                    <div class="stat-card">
                        <div class="stat-top">
                            <div class="stat-icon">▤</div>
                        </div>
                        <h3 id="homeworkStat">4</h3>
                        <p>Pending Homework</p>
                    </div>

                    <div class="stat-card">
                        <div class="stat-top">
                            <div class="stat-icon">♧</div>
                        </div>
                        <h3 id="classesTodayStat">8</h3>
                        <p id="classesTodayLabel">Completed Courses</p>
                    </div>

                    <div class="stat-card" id="averageResultStatCard">
                        <div id="studentAverageResultContent">
                            <div class="stat-top">
                                <div class="stat-icon">★</div>
                            </div>
                            <h3>85%</h3>
                            <p>Average Result</p>
                        </div>
                        <div id="teacherCalendarWidget" class="teacher-calendar-widget hidden" aria-label="Teacher dashboard calendar"></div>
                    </div>

                </div>

                <div class="dashboard-grid">

                    <div class="card">
                        <div class="card-header">
                            <h3>Recent Activity</h3>
                            <a href="#" data-open-page="homework">View All</a>
                        </div>

                        <div class="activity-item">
                            <div class="activity-icon">✓</div>
                            <div>
                                <strong>Mathematics homework submitted</strong>
                                <span>Today, 10:30 AM</span>
                            </div>
                        </div>

                        <div class="activity-item">
                            <div class="activity-icon">★</div>
                            <div>
                                <strong>English result published</strong>
                                <span>Yesterday, 2:00 PM</span>
                            </div>
                        </div>

                        <div class="activity-item">
                            <div class="activity-icon">◌</div>
                            <div>
                                <strong>New notice posted</strong>
                                <span>2 days ago</span>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>Latest Notices</h3>
                            <a href="#" data-open-page="notices">View All</a>
                        </div>

                        <div class="notice-item">
                            <strong>Monthly examination schedule</strong>
                            <p>The examination routine has been updated.</p>
                            <span class="notice-date">September 12, 2026</span>
                        </div>

                        <div class="notice-item">
                            <strong>Assignment submission reminder</strong>
                            <p>Please submit all pending assignments.</p>
                            <span class="notice-date">September 10, 2026</span>
                        </div>

                        <div class="notice-item">
                            <strong>Publication holiday notice</strong>
                            <p>The office will remain closed on Friday.</p>
                            <span class="notice-date">September 8, 2026</span>
                        </div>
                    </div>

                </div>
            </section>

            <!-- PROFILE PAGE -->
            <section id="profilePage" class="page">

                <div class="page-heading">
                    <div>
                        <h1>My Profile</h1>
                        <p>View and update your account information.</p>
                    </div>
                </div>

                <div class="profile-grid">

                    <div class="profile-card">
                        <div class="profile-avatar" id="profileAvatar">CR</div>
                        <h2 id="profileName">Student Name</h2>
                        <p id="profileRole">Student</p>

                        <div class="profile-meta">
                            <div>
                                <span>Account Status</span>
                                <span class="badge success">Active</span>
                            </div>
                            <div>
                                <span>Member Since</span>
                                <span>2026</span>
                            </div>
                            <div>
                                <span>Account Type</span>
                                <span id="profileType">Student</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-card">
                        <h3>Edit Profile</h3>

                        <form id="profileForm">
                            <div class="form-grid">

                                <div class="form-group">
                                    <label>Full Name</label>
                                    <input type="text" id="profileFullName" required>
                                </div>

                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="profileEmail" required>
                                </div>

                                <div class="form-group">
                                    <label>Phone Number</label>
                                    <input type="text" id="profilePhone" required>
                                </div>

                                <div class="form-group">
                                    <label>Role</label>
                                    <input type="text" id="profileRoleInput" readonly>
                                </div>

                            </div>

                            <div class="form-actions">
                                <button type="submit" class="primary-btn">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </section>

            <!-- ATTENDANCE PAGE -->
            <section id="attendancePage" class="page">

                <div class="page-heading">
                    <div>
                        <h1>Attendance</h1>
                        <p>Review your attendance records.</p>
                    </div>
                </div>

                <div id="teacherAttendanceView" class="hidden">
                    <div class="card" style="margin-bottom:22px;">
                        <div class="card-header"><h3>Classes You Handle</h3><span class="badge info">Teacher</span></div>
                        <p style="color:var(--muted);font-size:13px;margin:-8px 0 18px;">Choose a class to view students and record their attendance.</p>
                        <div id="attendanceClassList" class="contact-grid"></div>
                    </div>
                    <div id="attendanceRosterPanel" class="table-card hidden">
                        <div class="page-heading" style="margin-bottom:18px;">
                            <div><h2 id="attendanceRosterTitle" style="font-size:21px;color:#263248;">BSIT 2-B</h2><p>Mark each student's attendance for the selected date.</p></div>
                            <button type="button" class="secondary-btn" id="backToAttendanceClasses">Back to Classes</button>
                        </div>
                        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:18px;">
                            <label for="teacherAttendanceDate" style="font-weight:600;font-size:13px;">Attendance Date</label>
                            <input id="teacherAttendanceDate" type="date" style="padding:10px;border:1px solid #ccd1dc;border-radius:7px;">
                            <button type="button" class="primary-btn" id="saveClassAttendance">Save Attendance</button>
                        </div>
                        <div class="attendance-summary-grid" aria-label="Attendance summary">
                            <article class="attendance-summary-card total"><span>Total students</span><strong id="attendanceTotalStudents">0</strong></article>
                            <article class="attendance-summary-card present"><span>Present</span><strong id="attendancePresentCount">0</strong></article>
                            <article class="attendance-summary-card absent"><span>Absent</span><strong id="attendanceAbsentCount">0</strong></article>
                            <article class="attendance-summary-card late"><span>Late</span><strong id="attendanceLateCount">0</strong></article>
                        </div>
                        <div id="attendanceSaveMessage" class="contact-success" role="status" aria-live="polite"></div>
                        <div style="overflow-x:auto;"><table class="attendance-table" style="min-width:580px;"><thead><tr><th>#</th><th>Student Name</th><th>Student ID</th><th>Attendance Status</th></tr></thead><tbody id="teacherAttendanceRoster"></tbody></table></div>
                        <div class="attendance-history"><h3>Recent save history</h3><ul id="attendanceHistoryList"><li class="attendance-history-empty">No saved attendance history yet.</li></ul></div>
                        <p style="font-size:12px;color:var(--muted);margin-top:14px;">Attendance records and save history are stored in the portal database.</p>
                    </div>
                </div>
                <div id="studentAttendanceView">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">✓</div>
                        <h3>46</h3>
                        <p>Present Days</p>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">×</div>
                        <h3>4</h3>
                        <p>Absent Days</p>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">%</div>
                        <h3>92%</h3>
                        <p>Attendance Percentage</p>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">▣</div>
                        <h3>50</h3>
                        <p>Total Classes</p>
                    </div>
                </div>

                <div class="table-card">
                    <div class="card-header">
                        <h3>Attendance Details</h3>
                        <select id="attendanceMonth" style="padding:9px;border:1px solid #ddd;border-radius:6px;">
                            <option>September 2026</option>
                            <option>August 2026</option>
                            <option>July 2026</option>
                        </select>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Subject</th>
                                <th>Class Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>September 16, 2026</td>
                                <td>Mathematics</td>
                                <td>9:00 AM</td>
                                <td><span class="badge success">Present</span></td>
                            </tr>
                            <tr>
                                <td>September 15, 2026</td>
                                <td>English</td>
                                <td>10:00 AM</td>
                                <td><span class="badge success">Present</span></td>
                            </tr>
                            <tr>
                                <td>September 14, 2026</td>
                                <td>Science</td>
                                <td>11:00 AM</td>
                                <td><span class="badge danger">Absent</span></td>
                            </tr>
                            <tr>
                                <td>September 13, 2026</td>
                                <td>Computer</td>
                                <td>12:00 PM</td>
                                <td><span class="badge success">Present</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                </div>
            </section>

            <!-- HOMEWORK PAGE -->
            <section id="homeworkPage" class="page">

                <div class="page-heading">
                    <div>
                        <h1>Homework</h1>
                        <p>View assignments and submit your work.</p>
                    </div>
                    <button class="primary-btn" id="addHomeworkBtn">
                        + Add Submission
                    </button>
                </div>

                <div id="homeworkFormCard" class="form-card hidden" style="margin-bottom:25px;">
                    <h3>Submit Homework</h3>

                    <form id="homeworkForm">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Subject</label>
                                <select id="homeworkSubject" required>
                                    <option value="">Select subject</option>
                                    <option>Mathematics</option>
                                    <option>English</option>
                                    <option>Science</option>
                                    <option>Computer</option>
                                    <option>Social Studies</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Assignment Title</label>
                                <input type="text" id="homeworkTitle" required>
                            </div>

                            <div class="form-group full-width">
                                <label>Description</label>
                                <textarea id="homeworkDescription" rows="4" required></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="primary-btn">Submit Homework</button>
                            <button type="button" class="secondary-btn" id="cancelHomeworkBtn">Cancel</button>
                        </div>
                    </form>
                </div>

                <div class="table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Assignment</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="homeworkTableBody">
                            <tr>
                                <td>Mathematics</td>
                                <td>Algebra Practice</td>
                                <td>September 18, 2026</td>
                                <td><span class="badge warning">Pending</span></td>
                                <td><button class="secondary-btn" onclick="showToast('Homework details opened')">View</button></td>
                            </tr>
                            <tr>
                                <td>English</td>
                                <td>Essay Writing</td>
                                <td>September 20, 2026</td>
                                <td><span class="badge success">Submitted</span></td>
                                <td><button class="secondary-btn" onclick="showToast('Submission viewed')">View</button></td>
                            </tr>
                            <tr>
                                <td>Science</td>
                                <td>Laboratory Report</td>
                                <td>September 22, 2026</td>
                                <td><span class="badge warning">Pending</span></td>
                                <td><button class="secondary-btn" onclick="showToast('Homework details opened')">View</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- TEACHER SCHEDULE PAGE (shown when a teacher clicks Schedule) -->
            <section id="schedulePage" class="page">
                <div class="page-heading schedule-page-heading">
                    <div>
                        <h1>Teacher Schedules</h1>
                        <p>View your assigned subjects, class meeting times, and rooms.</p>
                    </div>
                </div>
                <div class="teacher-schedule-card">
                    <div class="teacher-schedule-scroll">
                        <table class="teacher-schedule-table" aria-label="Teacher class schedule">
                            <colgroup>
                                <col style="width:13%"><col style="width:10%"><col style="width:30%"><col style="width:12%"><col style="width:23%"><col style="width:12%">
                            </colgroup>
                            <thead>
                                <tr><th>Code</th><th>Subject</th><th>Description</th><th>Section</th><th>Schedule</th><th>Room</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="schedule-code">IT2601-057</td><td class="schedule-subject">TPCC 211</td><td>Mathematics</td><td class="schedule-section">BIT2B</td>
                                    <td><div class="schedule-meetings"><div class="schedule-meeting"><span>◷&nbsp; 07:30 AM - 12:00 PM</span><span class="schedule-day">▢ M</span></div><div class="schedule-meeting"><span>◷&nbsp; 07:30 AM - 10:00 AM</span><span class="schedule-day">▢ W</span></div></div></td><td class="schedule-room">CAS-RM5B</td>
                                </tr>
                                <tr>
                                    <td class="schedule-code">IT2601-058</td><td class="schedule-subject">TPCC 212</td><td>Mathematics</td><td class="schedule-section">BIT2B</td>
                                    <td><div class="schedule-meetings"><div class="schedule-meeting"><span>◷&nbsp; 04:00 PM - 05:30 PM</span><span class="schedule-day">▢ M</span></div><div class="schedule-meeting"><span>◷&nbsp; 01:00 PM - 04:30 PM</span><span class="schedule-day">▢ T</span></div></div></td><td class="schedule-room">CAS-RM5A</td>
                                </tr>
                                <tr>
                                    <td class="schedule-code">IT2601-059</td><td class="schedule-subject">TPCC 213</td><td>Mathematics</td><td class="schedule-section">BIT AE3</td>
                                    <td><div class="schedule-meetings"><div class="schedule-meeting"><span>◷&nbsp; 07:30 PM - 08:30 PM</span><span class="schedule-day">▢ M</span></div><div class="schedule-meeting"><span>◷&nbsp; 04:30 PM - 08:30 PM</span><span class="schedule-day">▢ TH</span></div></div></td><td class="schedule-room">CAS-RM5B</td>
                                </tr>
                                <tr>
                                    <td class="schedule-code">IT2601-060</td><td class="schedule-subject">TPCC 214</td><td>Science</td><td class="schedule-section">BIT2B</td>
                                    <td><div class="schedule-meetings"><div class="schedule-meeting"><span>◷&nbsp; 04:30 PM - 05:30 PM</span><span class="schedule-day">▢ T</span></div><div class="schedule-meeting"><span>◷&nbsp; 04:30 PM - 08:30 PM</span><span class="schedule-day">▢ W</span></div></div></td><td class="schedule-room">CAS-RM10</td>
                                </tr>
                                <tr>
                                    <td class="schedule-code">IT2601-061</td><td class="schedule-subject">MSC 3</td><td>Science</td><td class="schedule-section">BIT AE3</td>
                                    <td><div class="schedule-meetings"><div class="schedule-meeting"><span>◷&nbsp; 01:00 PM - 04:00 PM</span><span class="schedule-day">▢ M</span></div><div class="schedule-meeting"><span>◷&nbsp; 10:00 AM - 12:00 PM</span><span class="schedule-day">▢ W</span></div></div></td><td class="schedule-room">CAS-RM3</td>
                                </tr>
                                <tr>
                                    <td class="schedule-code">IT2601-062</td><td class="schedule-subject">GE 4</td><td>Science</td><td class="schedule-section">BIT AE3</td>
                                    <td><div class="schedule-meetings"><div class="schedule-meeting"><span>◷&nbsp; 05:30 PM - 08:30 PM</span><span class="schedule-day">▢ T</span></div></div></td><td class="schedule-room">CAS-RM12</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="table-card" style="margin-top:22px;">
                    <div class="card-header"><h3>Student Homework Submissions</h3><span class="badge info">Teacher</span></div>
                    <p style="color:var(--muted);font-size:13px;margin:-6px 0 16px;">Submissions saved by students appear here.</p>
                    <div style="overflow-x:auto;">
                        <table aria-label="Student homework submissions">
                            <thead><tr><th>Student</th><th>Subject</th><th>Assignment</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody id="teacherHomeworkSubmissionsTableBody"><tr><td colspan="6">Loading submissions...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- RESULTS PAGE -->
            <section id="resultsPage" class="page">
                <div class="page-heading">
                    <div>
                        <h1>Results</h1>
                        <p id="resultsPageDescription">Check your examination results and grades.</p>
                    </div>
                </div>

                <!-- Student view: examination grades -->
                <div class="table-card" id="studentResultsCard">
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Full Marks</th>
                                <th>Obtained Marks</th>
                                <th>Percentage</th>
                                <th>Grade</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Mathematics</td><td>100</td><td>88</td><td>88%</td><td>A</td><td><span class="badge success">Passed</span></td></tr>
                            <tr><td>English</td><td>100</td><td>85</td><td>85%</td><td>A</td><td><span class="badge success">Passed</span></td></tr>
                            <tr><td>Science</td><td>100</td><td>82</td><td>82%</td><td>A-</td><td><span class="badge success">Passed</span></td></tr>
                            <tr><td>Computer</td><td>100</td><td>90</td><td>90%</td><td>A+</td><td><span class="badge success">Passed</span></td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Teacher view: activities sent and student turn-in counts -->
                <div class="table-card hidden" id="teacherResultsCard">
                    <table aria-label="Activity submission results">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Assignment</th>
                                <th>Due Date</th>
                                <th>Section</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="teacherResultsTableBody">
                            <tr><td colspan="5"><div class="empty-state"><h3>No activities sent yet</h3><p>Activities you send from Solutions will appear here with their due dates and submission counts.</p></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- SOLUTIONS PAGE -->
            <section id="solutionsPage" class="page">
                <div class="page-heading solutions-heading">
                    <div>
                        <h1>Solutions</h1>
                        <p>Access available study solutions and materials.</p>
                    </div>
                </div>
                <div id="teacherLessonTools" class="hidden">
                    <div class="form-card lesson-form-card">
                        <h3>Send a Lesson Plan to a Class</h3>
                        <p class="lesson-helper">Create a lesson plan and choose the class that should receive it.</p>
                        <form id="lessonPlanForm">
                            <div class="form-grid">
                                <div class="form-group"><label for="lessonTitle">Lesson plan title</label><input id="lessonTitle" required placeholder="e.g. Introduction to Java"></div>
                                <div class="form-group"><label for="lessonSubject">Subject</label><select id="lessonSubject" required><option value="">Select subject</option><option>Mathematics</option><option>English</option><option>Science</option><option>Computer Studies</option><option>Other</option></select></div>
                                <div class="form-group"><label for="lessonClass">Send to class</label><select id="lessonClass" required><option value="">Select class</option><option>BSIT 1-A</option><option>BSIT 1-B</option><option>BSIT 2-A</option><option>BSIT 2-B</option><option>BIT2B</option><option>BIT AE3</option><option>BIT3AE</option><option>All Classes</option></select></div>
                                <div class="form-group"><label for="lessonDate">Lesson date</label><input type="date" id="lessonDate"></div>
                                <div class="form-group"><label for="lessonDueDate">Due date</label><input type="date" id="lessonDueDate"></div>
                                <div class="form-group full-width"><label for="lessonDescription">Lesson details / instructions</label><textarea id="lessonDescription" rows="4" placeholder="Write the lesson objectives, topics, and instructions..."></textarea></div>
                                <div class="form-group full-width"><label for="lessonFile">Attach lesson plan (optional)</label><input type="file" id="lessonFile" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"></div>
                            </div>
                            <div class="form-actions"><button class="primary-btn" type="submit">Send Lesson Plan</button></div>
                            <p id="lessonPlanFeedback" class="lesson-feedback" role="status"></p>
                        </form>
                    </div>
                </div>
                <div id="studentLessonNotice" class="lesson-notice">Lesson plans and materials shared by your teachers will appear here.</div>
                <div id="lessonPlansList" class="lesson-plans-list"></div>
                <div id="studentSolutionCards" class="solutions-grid">
                    <article class="solution-card"><div class="solution-card-icon" aria-hidden="true">▤</div><h2>Mathematics Solutions</h2><p>Practice solutions for algebra, geometry, and arithmetic exercises.</p><button type="button" class="secondary-btn solution-open-btn">Open Solutions</button></article>
                    <article class="solution-card"><div class="solution-card-icon" aria-hidden="true">▤</div><h2>English Solutions</h2><p>Grammar, essay, comprehension, and literature study solutions.</p><button type="button" class="secondary-btn solution-open-btn">Open Solutions</button></article>
                    <article class="solution-card"><div class="solution-card-icon" aria-hidden="true">▤</div><h2>Science Solutions</h2><p>Reference materials for science lessons and assignments.</p><button type="button" class="secondary-btn solution-open-btn">Open Solutions</button></article>
                </div>
            </section>

            <!-- NOTICES PAGE -->
            <section id="noticesPage" class="page">

                <div class="page-heading">
                    <div>
                        <h1>Notices</h1>
                        <p>Important announcements and updates.</p>
                    </div>
                    <button class="primary-btn" id="addNoticeBtn">+ Add Notice</button>
                </div>

                <div id="noticeFormCard" class="form-card hidden" style="margin-bottom:25px;">
                    <h3>Create Notice</h3>

                    <form id="noticeForm">
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Notice Title</label>
                                <input type="text" id="noticeTitle" required>
                            </div>

                            <div class="form-group">
                                <label>Date</label>
                                <input type="date" id="noticeDate" required>
                            </div>

                            <div class="form-group full-width">
                                <label>Notice Description</label>
                                <textarea id="noticeDescription" rows="4" required></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="primary-btn">Publish Notice</button>
                            <button type="button" class="secondary-btn" id="cancelNoticeBtn">Cancel</button>
                        </div>
                    </form>
                </div>

                <div id="noticesContainer"></div>
            </section>

            <!-- MESSAGES PAGE -->
            <section id="messagesPage" class="page">
                <div class="page-heading">
                    <div>
                        <h1>Messages</h1>
                        <p>Send private direct messages to registered students or teachers and reply in the same conversation.</p>
                    </div>
                </div>
                <div class="messenger-layout">
                    <aside class="teacher-list-panel">
                        <div class="messenger-panel-title">Messages</div>
                        <div class="message-search-wrap"><input id="messageSearch" type="search" placeholder="Search students or teachers..." aria-label="Search students or teachers"><small>🔒 Direct messages are private to the two participants.</small></div>
                        <div id="teacherList"></div>
                    </aside>
                    <section class="chat-panel">
                        <div class="chat-header" id="chatHeader">
                            <div class="teacher-avatar">T</div>
                            <div><h3>Select a teacher</h3><p>Choose a teacher to start a conversation.</p></div>
                        </div>
                        <div class="chat-messages" id="chatMessages"><div class="chat-empty"><div>✉</div><h3>Your conversations</h3><p>Select a teacher on the left to send a message.</p></div></div>
                        <form class="chat-composer" id="chatForm">
                            <input id="chatInput" type="text" placeholder="Write a message..." autocomplete="off" disabled required>
                            <button class="primary-btn" type="submit" id="sendChatBtn" disabled>Send</button>
                        </form>
                        <p class="chat-note">Demo mode: messages are saved in this browser only. Sign in with the other registered account in this same browser to test replies. For real privacy across devices, connect a secure server with account-based access controls.</p>
                    </section>
                </div>
            </section>

        </div>
    </main>
</section>

<div id="toast" class="toast"></div>
<script src="{{ asset('js/llcc-portal.js') }}"></script>
</body>
</html>