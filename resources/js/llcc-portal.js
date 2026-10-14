/* ===== Original inline script block 1 ===== */

/* =========================================================
   STORAGE AND DEFAULT DATA
========================================================= */

const USERS_KEY = "creative_readers_users";
const CURRENT_USER_KEY = "creative_readers_current_user";
const CUSTOM_HOMEWORK_KEY = "creative_readers_homework";
const CUSTOM_NOTICES_KEY = "creative_readers_notices";

function getUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        return Array.isArray(users) ? users : [];
    } catch (error) {
        console.warn("Saved user data could not be read.", error);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
    } catch (error) {
        console.warn("Saved session data could not be read.", error);
        return null;
    }
}

function saveCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getInitials(name) {
    if (!name) return "CR";

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join("");
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = "message " + type;
}

async function portalApi(path, options = {}) {
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || "";
    const response = await fetch(path, {
        ...options,
        credentials: "same-origin",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrf,
            ...(options.headers || {})
        }
    });
    let payload = {};
    try { payload = await response.json(); } catch (error) {}
    if (!response.ok) {
        const validationMessage = payload.errors ? Object.values(payload.errors).flat()[0] : null;
        const error = new Error(validationMessage || payload.message || "The request could not be completed.");
        error.status = response.status;
        throw error;
    }
    return payload;
}

/* Demo accounts are no longer created in browser storage. Authentication is handled by Laravel. */

/* =========================================================
   AUTHENTICATION VIEW SWITCHING
========================================================= */

const authPage = document.getElementById("authPage");
const appPage = document.getElementById("appPage");
const loginView = document.getElementById("loginView");
const signupView = document.getElementById("signupView");

document.getElementById("showSignup").addEventListener("click", function(event) {
    event.preventDefault();
    loginView.classList.add("hidden");
    signupView.classList.remove("hidden");
});

document.getElementById("showLogin").addEventListener("click", function(event) {
    event.preventDefault();
    signupView.classList.add("hidden");
    loginView.classList.remove("hidden");
});

/* =========================================================
   LOGIN
========================================================= */

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const message = document.getElementById("loginMessage");
    const role = document.getElementById("loginRole").value.trim().toLowerCase();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || "";

    try {
        const response = await fetch("/auth/login", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "X-CSRF-TOKEN": csrf },
            credentials: "same-origin",
            body: JSON.stringify({ username, password, role })
        });
        const data = await response.json();
        if (!response.ok) {
            showMessage("loginMessage", data.message || "Login failed. Check your details and try again.", "error");
            return;
        }
        saveCurrentUser(data.user);
        showApplication(data.user);
        document.getElementById("loginForm").reset();
    } catch (error) {
        showMessage("loginMessage", "Could not connect to the server. Make sure Laravel is running and try again.", "error");
    }
});

/* =========================================================
   SIGNUP
========================================================= */

document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;
    if (password !== confirmPassword) {
        showMessage("signupMessage", "Passwords do not match.", "error");
        return;
    }

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || "";
    const payload = {
        name: document.getElementById("signupName").value.trim(),
        email: document.getElementById("signupEmail").value.trim().toLowerCase(),
        phone: document.getElementById("signupPhone").value.trim(),
        password,
        password_confirmation: confirmPassword
    };

    try {
        const response = await fetch("/auth/register", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "X-CSRF-TOKEN": csrf },
            credentials: "same-origin",
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
            const firstError = data.errors ? Object.values(data.errors).flat()[0] : null;
            showMessage("signupMessage", firstError || data.message || "Could not create your account.", "error");
            return;
        }
        showMessage("signupMessage", "Student account created. You can now log in.", "success");
        document.getElementById("signupForm").reset();
        document.getElementById("loginRole").value = "student";
        document.getElementById("loginUsername").value = payload.email;
        setTimeout(() => {
            signupView.classList.add("hidden");
            loginView.classList.remove("hidden");
        }, 700);
    } catch (error) {
        showMessage("signupMessage", "Could not connect to the server. Make sure Laravel is running and try again.", "error");
    }
});

/* =========================================================
   FORGOT PASSWORD DEMO
========================================================= */

document.getElementById("forgotPassword").addEventListener("click", function(event) {
    event.preventDefault();

    // Never display or reveal a stored password. This prototype has no secure
    // server-side password reset flow, so direct users to the administrator.
    alert(
        "Password reset is not available in this demo yet.\n\n" +
        "Please contact your portal administrator for help.\n\n" +
        "Note: this prototype stores account data in this browser only and is not ready for real student accounts."
    );
});

/* =========================================================
   SHOW APPLICATION
========================================================= */

function showApplication(user) {
    if (user && user.role === "admin") {
        window.location.href = "/admin";
        return;
    }

    authPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    updateUserInterface(user);
    if (typeof window.refreshPortalMessaging === "function") window.refreshPortalMessaging();
    setupTeacherAttendance(user);
    renderTeacherDashboard(user);
    renderNotices();
    renderCustomHomework();

    document.getElementById("currentDate").textContent =
        new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}

function updateUserInterface(user) {
    const addHomeworkButton = document.getElementById("addHomeworkBtn");
    if (addHomeworkButton) addHomeworkButton.classList.toggle("hidden", !user || user.role !== "student");
    const homeworkNav = document.querySelector('.nav-item[data-page="homework"], .nav-item[data-page="schedule"]');
    if (homeworkNav) {
        homeworkNav.dataset.page = user && user.role === "teacher" ? "schedule" : "homework";
        homeworkNav.innerHTML = '<span class="nav-icon">' + (user && user.role === "teacher" ? '▦' : '▤') + '</span>' + (user && user.role === "teacher" ? 'Schedule' : 'Homework');
    }
    const initials = getInitials(user.name);
    const roleName = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    document.getElementById("topAvatar").textContent = initials;
    document.getElementById("topUserName").textContent = user.name;
    document.getElementById("topUserRole").textContent = roleName;

    document.getElementById("welcomeName").textContent = user.name.split(" ")[0];

    document.getElementById("profileAvatar").textContent = initials;
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileRole").textContent = roleName;
    document.getElementById("profileType").textContent = roleName;

    document.getElementById("profileFullName").value = user.name;
    document.getElementById("profileEmail").value = user.email;
    document.getElementById("profilePhone").value = user.phone;
    document.getElementById("profileRoleInput").value = roleName;
}

/* =========================================================
   TEACHER CLASS ATTENDANCE
========================================================= */
const teacherClasses = {
    "BSIT 1-A": ["Althea Cruz", "Joshua Garcia", "Mika Santos", "Nathan Reyes", "Sofia Flores"],
    "BSIT 1-B": ["Andrea Ramos", "Daniel Torres", "Ella Mendoza", "Gabriel Lim", "Isabelle Tan"],
    "BSIT 2-A": ["Alyssa Dizon", "Brandon Lee", "Chloe Rivera", "Dylan Bautista", "Faith Navarro"],
    "BSIT 2-B": ["Angela Villanueva", "Christian Flores", "Danica Reyes", "Ethan Mendoza", "Jasmine Cruz", "Kyle Santos", "Lance Garcia", "Mia Torres"]
};

/* =========================================================
   ROLE-SPECIFIC TEACHER DASHBOARD SUMMARY + CALENDAR
========================================================= */
let dashboardCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

function scheduleDayCodeFromLabel(label) {
    const parts = String(label || "").trim().toUpperCase().split(/\s+/);
    return parts[parts.length - 1] || "";
}

function getTeacherScheduleRowsForDay(dayCode) {
    const rows = Array.from(document.querySelectorAll("#schedulePage .teacher-schedule-table tbody tr"));
    return rows.filter(row => Array.from(row.querySelectorAll(".schedule-day")).some(day => {
        return scheduleDayCodeFromLabel(day.textContent) === dayCode;
    }));
}

function renderTeacherDashboard(user) {
    const isTeacher = Boolean(user && user.role === "teacher");
    const studentCount = Object.values(teacherClasses).reduce((total, roster) => total + roster.length, 0);
    const dayCodes = ["S", "M", "T", "W", "TH", "F", "SA"];
    const todayCode = dayCodes[new Date().getDay()];
    const studentLabel = document.getElementById("attendanceStatLabel");
    const classCountLabel = document.getElementById("classesTodayLabel");
    const studentAverageContent = document.getElementById("studentAverageResultContent");
    const calendar = document.getElementById("teacherCalendarWidget");

    if (studentLabel) studentLabel.textContent = isTeacher ? "Students Across Classes" : "Attendance Rate";
    if (classCountLabel) classCountLabel.textContent = isTeacher ? "Classes Today" : "Completed Courses";

    const studentCountValue = document.getElementById("attendanceStat");
    if (studentCountValue) studentCountValue.textContent = isTeacher ? String(studentCount) : "92%";

    const classesTodayValue = document.getElementById("classesTodayStat");
    if (classesTodayValue) {
        classesTodayValue.textContent = isTeacher ? String(getTeacherScheduleRowsForDay(todayCode).length) : "8";
    }

    if (studentAverageContent) studentAverageContent.classList.toggle("hidden", isTeacher);
    if (calendar) calendar.classList.toggle("hidden", !isTeacher);
    if (isTeacher) {
        dashboardCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        renderTeacherCalendar();
    }
}

function renderTeacherCalendar() {
    const calendar = document.getElementById("teacherCalendarWidget");
    if (!calendar) return;

    const year = dashboardCalendarMonth.getFullYear();
    const month = dashboardCalendarMonth.getMonth();
    const monthDate = new Date(year, month, 1);
    const monthName = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const firstWeekday = monthDate.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayCode = ["S", "M", "T", "W", "TH", "F", "SA"][today.getDay()];
    const weekdayCodes = ["S", "M", "T", "W", "TH", "F", "SA"];
    const classDays = new Set();

    document.querySelectorAll("#schedulePage .teacher-schedule-table .schedule-day").forEach(day => {
        const code = scheduleDayCodeFromLabel(day.textContent);
        if (weekdayCodes.includes(code)) classDays.add(code);
    });

    let grid = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(name => `<span class="teacher-calendar-weekday">${name}</span>`).join("");
    for (let blank = 0; blank < firstWeekday; blank++) grid += '<span class="teacher-calendar-blank" aria-hidden="true"></span>';
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const code = weekdayCodes[date.getDay()];
        const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
        const hasClass = classDays.has(code);
        const classes = ["teacher-calendar-date", hasClass ? "has-class" : "", isToday ? "is-today" : ""].filter(Boolean).join(" ");
        const label = `${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${hasClass ? ", scheduled class day" : ""}${isToday ? ", today" : ""}`;
        grid += `<span class="${classes}" title="${label}" aria-label="${label}">${day}</span>`;
    }
    const usedCells = firstWeekday + daysInMonth;
    const trailingBlanks = (7 - (usedCells % 7)) % 7;
    for (let blank = 0; blank < trailingBlanks; blank++) grid += '<span class="teacher-calendar-blank" aria-hidden="true"></span>';

    calendar.innerHTML = `
        <div class="teacher-calendar-head">
            <button type="button" class="teacher-calendar-nav" data-calendar-prev aria-label="Previous month">‹</button>
            <div class="teacher-calendar-title">${monthName}</div>
            <button type="button" class="teacher-calendar-nav" data-calendar-next aria-label="Next month">›</button>
        </div>
        <div class="teacher-calendar-grid">${grid}</div>
        <div class="teacher-calendar-legend"><span class="teacher-calendar-legend-dot"></span> Class days highlighted</div>`;

    calendar.querySelector("[data-calendar-prev]").addEventListener("click", () => {
        dashboardCalendarMonth = new Date(year, month - 1, 1);
        renderTeacherCalendar();
    });
    calendar.querySelector("[data-calendar-next]").addEventListener("click", () => {
        dashboardCalendarMonth = new Date(year, month + 1, 1);
        renderTeacherCalendar();
    });
}

let selectedAttendanceClass = "";
let attendanceDirty = false;
let attendanceLoadedDate = "";
let attendanceRosterByClass = {};
function localDateInputValue() {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

async function setupTeacherAttendance(user) {
    const teacherView = document.getElementById("teacherAttendanceView");
    const studentView = document.getElementById("studentAttendanceView");
    if (!teacherView || !studentView) return;
    const isTeacher = user && user.role === "teacher";
    teacherView.classList.toggle("hidden", !isTeacher);
    studentView.classList.toggle("hidden", isTeacher);
    if (!isTeacher) return;

    const list = document.getElementById("attendanceClassList");
    list.innerHTML = '<p>Loading your classes...</p>';
    try {
        const data = await portalApi("/api/attendance/classes");
        attendanceRosterByClass = Object.fromEntries(data.classes.map(item => [item.class_name, item.students]));
        list.innerHTML = data.classes.map(item => `
            <button type="button" class="contact-card attendance-class-card" data-attendance-class="${escapeHTML(item.class_name)}" style="text-align:left;cursor:pointer;color:inherit;">
                <div class="contact-icon">▦</div><h3>${escapeHTML(item.class_name)}</h3>
                <p>${item.students.length} students<br><span style="color:var(--primary);font-weight:bold;display:inline-block;margin-top:10px;">View Attendance →</span></p>
            </button>`).join("");
        list.querySelectorAll("[data-attendance-class]").forEach(button => button.addEventListener("click", () => openAttendanceRoster(button.dataset.attendanceClass)));
    } catch (error) {
        list.innerHTML = '<p role="alert">Could not load classes. Please refresh and sign in again.</p>';
    }

    document.getElementById("teacherAttendanceDate").value = localDateInputValue();
    document.getElementById("attendanceRosterPanel").classList.add("hidden");
    list.closest(".card").classList.remove("hidden");
}

async function openAttendanceRoster(className) {
    if (!attendanceRosterByClass[className]) return;
    selectedAttendanceClass = className;
    document.getElementById("attendanceRosterTitle").textContent = className + " — Student Attendance";
    document.getElementById("attendanceClassList").closest(".card").classList.add("hidden");
    document.getElementById("attendanceRosterPanel").classList.remove("hidden");
    await renderAttendanceRoster();
}

function updateAttendanceSummary() {
    const selects = [...document.querySelectorAll(".attendance-status-select")];
    const counts = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    selects.forEach(select => { if (counts[select.value] !== undefined) counts[select.value]++; });
    [["attendanceTotalStudents", selects.length], ["attendancePresentCount", counts.Present], ["attendanceAbsentCount", counts.Absent], ["attendanceLateCount", counts.Late]].forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

function renderAttendanceHistory(history) {
    const el = document.getElementById("attendanceHistoryList");
    if (!el) return;
    el.innerHTML = history.length ? history.map(item => {
        const date = String(item.date || "").slice(0, 10);
        const savedAt = item.saved_at ? new Date(item.saved_at).toLocaleString() : "Saved";
        return '<li><strong>' + escapeHTML(date) + '</strong><span>' + escapeHTML(savedAt) + '</span></li>';
    }).join("") : '<li class="attendance-history-empty">No saved attendance history yet.</li>';
}

async function renderAttendanceRoster() {
    if (!selectedAttendanceClass) return;
    const dateInput = document.getElementById("teacherAttendanceDate");
    const date = dateInput.value || localDateInputValue();
    dateInput.value = date;
    const message = document.getElementById("attendanceSaveMessage");
    message.textContent = "Loading saved attendance...";
    message.className = "contact-success";
    message.style.display = "block";

    try {
        const data = await portalApi("/api/attendance?class_name=" + encodeURIComponent(selectedAttendanceClass) + "&date=" + encodeURIComponent(date));
        document.getElementById("teacherAttendanceRoster").innerHTML = data.records.map((student, index) => {
            const status = student.status || "Present";
            return `<tr><td>${index + 1}</td><td>${escapeHTML(student.student_name)}</td><td>${escapeHTML(student.student_code)}</td><td><select class="attendance-status-select status-${status.toLowerCase()}" data-student-code="${escapeHTML(student.student_code)}" aria-label="Attendance status for ${escapeHTML(student.student_name)}"><option ${status === "Present" ? "selected" : ""}>Present</option><option ${status === "Absent" ? "selected" : ""}>Absent</option><option ${status === "Late" ? "selected" : ""}>Late</option><option ${status === "Excused" ? "selected" : ""}>Excused</option></select></td></tr>`;
        }).join("");
        document.querySelectorAll(".attendance-status-select").forEach(select => select.addEventListener("change", () => {
            select.className = "attendance-status-select status-" + select.value.toLowerCase();
            attendanceDirty = true;
            message.textContent = "Unsaved changes — click Save Attendance to save them to the database.";
            message.className = "contact-success attendance-unsaved";
            updateAttendanceSummary();
        }));
        if (data.saved_at) {
            message.textContent = "Last saved " + new Date(data.saved_at).toLocaleString() + " for " + date + ".";
            message.className = "contact-success attendance-saved";
        } else {
            message.textContent = "No saved attendance for " + date + " yet. Review the statuses and save when ready.";
            message.className = "contact-success";
        }
        message.style.display = "block";
        attendanceDirty = false;
        attendanceLoadedDate = date;
        updateAttendanceSummary();
        renderAttendanceHistory(data.history || []);
    } catch (error) {
        message.textContent = error.message || "Could not load attendance.";
        message.className = "contact-success attendance-unsaved";
        message.style.display = "block";
    }
}

document.getElementById("teacherAttendanceDate").addEventListener("change", async () => {
    const dateInput = document.getElementById("teacherAttendanceDate");
    if (attendanceDirty && !confirm("You have unsaved attendance changes. Discard them and switch dates?")) {
        dateInput.value = attendanceLoadedDate;
        return;
    }
    attendanceDirty = false;
    await renderAttendanceRoster();
});

document.getElementById("backToAttendanceClasses").addEventListener("click", () => {
    if (attendanceDirty && !confirm("Your attendance changes are not saved. Discard them and return to classes?")) return;
    document.getElementById("attendanceRosterPanel").classList.add("hidden");
    document.getElementById("attendanceClassList").closest(".card").classList.remove("hidden");
    selectedAttendanceClass = "";
    attendanceDirty = false;
});

document.getElementById("saveClassAttendance").addEventListener("click", async () => {
    if (!selectedAttendanceClass) return;
    const date = document.getElementById("teacherAttendanceDate").value;
    const records = [...document.querySelectorAll(".attendance-status-select")].map(select => ({
        student_code: select.dataset.studentCode,
        status: select.value
    }));
    const button = document.getElementById("saveClassAttendance");
    const message = document.getElementById("attendanceSaveMessage");
    button.disabled = true;
    try {
        const result = await portalApi("/api/attendance", {
            method: "PUT",
            body: JSON.stringify({ class_name: selectedAttendanceClass, date, records })
        });
        attendanceDirty = false;
        message.textContent = "✓ " + result.message + " for " + selectedAttendanceClass + " on " + date + ".";
        message.className = "contact-success attendance-saved";
        await renderAttendanceRoster();
        showToast("Attendance saved to the database.");
    } catch (error) {
        message.textContent = error.message || "Could not save attendance.";
        message.className = "contact-success attendance-unsaved";
    } finally {
        button.disabled = false;
        message.style.display = "block";
    }
});

window.addEventListener("beforeunload", event => {
    if (attendanceDirty) {
        event.preventDefault();
        event.returnValue = "";
    }
});

/* =========================================================
   NAVIGATION
========================================================= */

const navItems = document.querySelectorAll(".nav-item[data-page]");
const pages = document.querySelectorAll(".page");

function openPage(pageName) {
    const signedInUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (pageName === "schedule" && (!signedInUser || signedInUser.role !== "teacher")) {
        pageName = "homework";
    }
    navItems.forEach(item => {
        item.classList.toggle("active", item.dataset.page === pageName);
    });

    pages.forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageName + "Page");

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    const title = pageName === "solutions" ? "Solutions" : pageName === "messages" ? "Messages" : pageName === "schedule" ? "Teacher Schedules" : pageName
        .replace("-", " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

    document.getElementById("topbarTitle").textContent = title;
}

navItems.forEach(item => {
    item.addEventListener("click", function() {
        openPage(item.dataset.page);
    });
});

// To-dos filters: switch Assigned/Missing/Done and filter by subject.
(function initTodos(){
    const tabs = document.querySelectorAll('.todo-tab');
    const subjectFilter = document.getElementById('todoClassFilter');
    const empty = document.getElementById('todoEmptyState');
    if (!tabs.length || !subjectFilter) return;
    let currentStatus = 'Assigned';
    function refreshTodos(){
        let visible = 0;
        document.querySelectorAll('.todo-item').forEach(item => {
            const show = item.dataset.status === currentStatus && (subjectFilter.value === 'all' || item.dataset.subject === subjectFilter.value);
            item.classList.toggle('hidden', !show);
            if(show) visible++;
        });
        document.querySelectorAll('.todo-group').forEach(group => {
            const items = [...group.querySelectorAll('.todo-item')];
            const count = items.filter(item => !item.classList.contains('hidden')).length;
            group.classList.remove('hidden');
            const counter = group.querySelector('.todo-group-heading b');
            if(counter) counter.textContent = count;
            const groupEmpty = group.querySelector('.group-empty');
            if(groupEmpty) groupEmpty.classList.toggle('hidden', count !== 0);
        });
        empty.classList.toggle('hidden', visible !== 0);
    }
    tabs.forEach(tab => tab.addEventListener('click', () => {
        currentStatus = tab.dataset.todoStatus;
        tabs.forEach(button => { const active = button === tab; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
        refreshTodos();
    }));
    subjectFilter.addEventListener('change', refreshTodos);
    document.querySelectorAll('[data-toggle-group]').forEach(button => button.addEventListener('click', () => {
        const group = document.getElementById(button.dataset.toggleGroup);
        const collapsed = !group.classList.contains('hidden');
        group.classList.toggle('hidden', collapsed);
        const indicator = button.querySelector('span:last-child');
        if(indicator) indicator.lastChild.textContent = collapsed ? '　⌄' : '　⌃';
    }));
    refreshTodos();
})();

// The top-right avatar/name is the shortcut to My Profile.
const openProfileBtn = document.getElementById("openProfileBtn");
if (openProfileBtn) {
    openProfileBtn.addEventListener("click", function() {
        openPage("profile");
    });
}

document.querySelectorAll("[data-open-page]").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        openPage(link.dataset.openPage);
    });
});

/* =========================================================
   PROFILE UPDATE
========================================================= */

document.getElementById("profileForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const currentUser = getCurrentUser();

    const updatedUser = {
        ...currentUser,
        name: document.getElementById("profileFullName").value.trim(),
        email: document.getElementById("profileEmail").value.trim().toLowerCase(),
        phone: document.getElementById("profilePhone").value.trim()
    };

    const users = getUsers();
    const index = users.findIndex(user => user.id === currentUser.id);

    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
        saveCurrentUser(updatedUser);
        updateUserInterface(updatedUser);
        showToast("Profile updated successfully.");
    }
});

/* =========================================================
   HOMEWORK SUBMISSIONS (SAVED BY LARAVEL)
========================================================= */

document.getElementById("addHomeworkBtn").addEventListener("click", function() {
    document.getElementById("homeworkFormCard").classList.remove("hidden");
});

document.getElementById("cancelHomeworkBtn").addEventListener("click", function() {
    document.getElementById("homeworkFormCard").classList.add("hidden");
});

document.getElementById("homeworkForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const submittingUser = getCurrentUser();
    if (!submittingUser || submittingUser.role !== "student") {
        showToast("Only student accounts can submit homework.");
        return;
    }

    const payload = {
        subject: document.getElementById("homeworkSubject").value,
        title: document.getElementById("homeworkTitle").value.trim(),
        description: document.getElementById("homeworkDescription").value.trim()
    };
    button.disabled = true;
    try {
        await portalApi("/api/homework/submissions", { method: "POST", body: JSON.stringify(payload) });
        form.reset();
        document.getElementById("homeworkFormCard").classList.add("hidden");
        await renderCustomHomework();
        showToast("Homework submitted successfully.");
    } catch (error) {
        showToast(error.message || "Could not submit homework.");
    } finally {
        button.disabled = false;
    }
});

function renderStudentHomeworkResults(submissions = window.portalHomeworkSubmissions || []) {
    const body = document.getElementById("studentHomeworkResultsBody");
    if (!body) return;
    body.replaceChildren();
    if (!submissions.length) {
        body.innerHTML = '<tr><td colspan="6">No homework submissions yet.</td></tr>';
        return;
    }
    submissions.forEach(homework => {
        const row = document.createElement("tr");
        const values = [
            homework.subject || "—",
            homework.title || "—",
            homework.submitted_at ? new Date(homework.submitted_at).toLocaleString() : "—",
            homework.status || "Submitted",
            homework.section || "Not specified"
        ];
        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        const action = document.createElement("td");
        const view = document.createElement("button");
        view.type = "button";
        view.className = "secondary-btn";
        view.textContent = "View";
        view.addEventListener("click", () => window.viewHomework?.(homework.id, row));
        action.appendChild(view);
        row.appendChild(action);
        body.appendChild(row);
    });
}

async function renderCustomHomework() {
    const tableBody = document.getElementById("homeworkTableBody");
    if (!tableBody) return;
    const currentUser = getCurrentUser();
    const isTeacher = currentUser?.role === "teacher";
    document.getElementById("studentHomeworkResultsCard")?.classList.toggle("hidden", isTeacher);
    document.getElementById("teacherHomeworkSubmissionsCard")?.classList.toggle("hidden", !isTeacher);
    tableBody.innerHTML = '<tr><td colspan="5">Loading submissions...</td></tr>';
    try {
        const data = await portalApi("/api/homework/submissions");
        window.portalHomeworkSubmissions = data.submissions || [];
        const teacherTable = document.getElementById("teacherHomeworkSubmissionsTableBody");
        if (teacherTable) {
            teacherTable.innerHTML = "";
            if (!window.portalHomeworkSubmissions.length) {
                teacherTable.innerHTML = '<tr><td colspan="6">No student submissions yet.</td></tr>';
            } else {
                window.portalHomeworkSubmissions.forEach(homework => {
                    const row = document.createElement("tr");
                    const student = document.createElement("td");
                    student.textContent = homework.student?.name || "Student";
                    const subject = document.createElement("td");
                    subject.textContent = homework.subject;
                    const title = document.createElement("td");
                    title.textContent = homework.title;
                    const submitted = document.createElement("td");
                    submitted.textContent = homework.submitted_at ? new Date(homework.submitted_at).toLocaleString() : "—";
                    const status = document.createElement("td");
                    status.textContent = homework.status || "Submitted";
                    const action = document.createElement("td");
                    const statusSelect = document.createElement("select");
                    statusSelect.setAttribute("aria-label", "Homework completion status");
                    [["Submitted", "Submitted"], ["Done", "Done"], ["Not Done", "Not Done"]].forEach(([value, label]) => {
                        const option = document.createElement("option");
                        option.value = value;
                        option.textContent = label;
                        statusSelect.appendChild(option);
                    });
                    statusSelect.value = ["Submitted", "Done", "Not Done"].includes(homework.status) ? homework.status : "Submitted";
                    statusSelect.addEventListener("change", async () => {
                        statusSelect.disabled = true;
                        try {
                            await portalApi("/api/homework/submissions/" + homework.id + "/status", {
                                method: "PATCH",
                                body: JSON.stringify({ status: statusSelect.value })
                            });
                            homework.status = statusSelect.value;
                            status.textContent = homework.status;
                            showToast("Homework marked " + homework.status + ".");
                            renderStudentHomeworkResults(window.portalHomeworkSubmissions);
                        } catch (error) {
                            showToast(error.message || "Could not update homework status.");
                            statusSelect.value = homework.status || "Submitted";
                        } finally {
                            statusSelect.disabled = false;
                        }
                    });
                    action.appendChild(statusSelect);
                    const view = document.createElement("button");
                    view.type = "button";
                    view.className = "secondary-btn";
                    view.textContent = "View";
                    view.addEventListener("click", () => window.viewHomework?.(homework.id, row));
                    action.appendChild(view);
                    action.appendChild(statusSelect);
                    row.append(student, subject, title, submitted, status, action);
                    teacherTable.appendChild(row);
                });
            }
        }
        renderStudentHomeworkResults(window.portalHomeworkSubmissions);
        tableBody.innerHTML = "";
        if (!window.portalHomeworkSubmissions.length) {
            tableBody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><h3>No submissions yet</h3><p>Your database-backed homework submissions will appear here.</p></div></td></tr>';
            return;
        }
        const isTeacher = getCurrentUser()?.role === "teacher";
        window.portalHomeworkSubmissions.forEach(homework => {
            const row = document.createElement("tr");
            row.dataset.customHomework = "true";
            row.dataset.homeworkId = String(homework.id);
            const subjectCell = document.createElement("td");
            subjectCell.textContent = isTeacher && homework.student ? homework.subject + " — " + homework.student.name : homework.subject;
            const titleCell = document.createElement("td");
            titleCell.textContent = homework.title;
            const dateCell = document.createElement("td");
            dateCell.textContent = homework.submitted_at ? new Date(homework.submitted_at).toLocaleString() : "—";
            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = "badge success";
            badge.textContent = homework.status || "Submitted";
            statusCell.appendChild(badge);
            const actionCell = document.createElement("td");
            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.className = "secondary-btn homework-view-btn";
            viewButton.dataset.homeworkId = String(homework.id);
            viewButton.textContent = "View";
            actionCell.appendChild(viewButton);
            row.append(subjectCell, titleCell, dateCell, statusCell, actionCell);
            tableBody.appendChild(row);
        });
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="5">Could not load submissions. Please refresh and sign in again.</td></tr>';
    }
}

/* =========================================================
   NOTICES
========================================================= */

const defaultNotices = [
    {
        title: "Monthly examination schedule",
        description: "The examination routine has been updated.",
        date: "September 12, 2026"
    },
    {
        title: "Assignment submission reminder",
        description: "Please submit all pending assignments.",
        date: "September 10, 2026"
    },
    {
        title: "Publication holiday notice",
        description: "The office will remain closed on Friday.",
        date: "September 8, 2026"
    }
];

document.getElementById("addNoticeBtn").addEventListener("click", function() {
    document.getElementById("noticeFormCard").classList.remove("hidden");
});

document.getElementById("cancelNoticeBtn").addEventListener("click", function() {
    document.getElementById("noticeFormCard").classList.add("hidden");
});

document.getElementById("noticeForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const notice = {
        id: Date.now(),
        title: document.getElementById("noticeTitle").value,
        description: document.getElementById("noticeDescription").value,
        date: document.getElementById("noticeDate").value
    };

    const notices = JSON.parse(
        localStorage.getItem(CUSTOM_NOTICES_KEY) || "[]"
    );

    notices.unshift(notice);
    localStorage.setItem(CUSTOM_NOTICES_KEY, JSON.stringify(notices));

    renderNotices();

    document.getElementById("noticeForm").reset();
    document.getElementById("noticeFormCard").classList.add("hidden");

    showToast("Notice published successfully.");
});

function renderNotices() {
    const customNotices = JSON.parse(
        localStorage.getItem(CUSTOM_NOTICES_KEY) || "[]"
    );

    const allNotices = [...customNotices, ...defaultNotices];
    const container = document.getElementById("noticesContainer");

    container.innerHTML = "";

    allNotices.forEach(notice => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.marginBottom = "17px";

        card.innerHTML = `
            <div class="card-header" style="margin-bottom:10px;">
                <h3>${escapeHTML(notice.title)}</h3>
                <span class="badge info">${escapeHTML(notice.date)}</span>
            </div>
            <p style="font-size:13px;color:#737b8c;line-height:1.7;">
                ${escapeHTML(notice.description)}
            </p>
        `;

        container.appendChild(card);
    });
}

/* =========================================================
   CONTACT FORM
========================================================= */

const legacyContactForm = document.getElementById("contactForm");
if (legacyContactForm) {
    legacyContactForm.addEventListener("submit", function(event) {
        event.preventDefault();
        legacyContactForm.reset();
        showToast("Your message has been sent successfully.");
    });
}

/* =========================================================
   LOGOUT
========================================================= */

document.getElementById("logoutBtn").addEventListener("click", async function() {
    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || "";
    try {
        await fetch("/auth/logout", {
            method: "POST",
            headers: { "Accept": "application/json", "X-CSRF-TOKEN": csrf },
            credentials: "same-origin"
        });
    } finally {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(USERS_KEY);
        appPage.classList.add("hidden");
        authPage.classList.remove("hidden");
        document.getElementById("loginForm").reset();
        document.getElementById("loginMessage").className = "message";
        document.getElementById("loginMessage").textContent = "";
        openPage("dashboard");
    }
});

/* =========================================================
   RESTORE SESSION FROM LARAVEL (NOT FROM LOCAL STORAGE)
========================================================= */

(async function restoreServerSession() {
    // Remove browser-only demo accounts and never trust a cached local user as authentication.
    localStorage.removeItem(USERS_KEY);
    try {
        const response = await fetch("/auth/user", {
            headers: { "Accept": "application/json" },
            credentials: "same-origin"
        });
        if (!response.ok) {
            localStorage.removeItem(CURRENT_USER_KEY);
            appPage.classList.add("hidden");
            authPage.classList.remove("hidden");
            return;
        }
        const data = await response.json();
        saveCurrentUser(data.user);
        showApplication(data.user);
    } catch (error) {
        localStorage.removeItem(CURRENT_USER_KEY);
        appPage.classList.add("hidden");
        authPage.classList.remove("hidden");
        showMessage("loginMessage", "Unable to verify your session. Check that Laravel is running.", "error");
    }
})();
/* ===== Original inline script block 2 ===== */

(function(){
  const initialsOf = n => (n||'CR').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
  function current(){return typeof getCurrentUser==='function'?getCurrentUser():JSON.parse(localStorage.getItem('currentUser')||'null')}
  function persistUser(u){if(typeof getUsers==='function'&&typeof saveUsers==='function'){const users=getUsers();const i=users.findIndex(x=>x.email===u.email||x.id===u.id);if(i>=0)users[i]=u;else users.push(u);saveUsers(users)}if(typeof saveCurrentUser==='function')saveCurrentUser(u);else localStorage.setItem('currentUser',JSON.stringify(u));if(typeof updateUserInterface==='function')updateUserInterface(u)}
  const PROFILE_PICTURE_KEY='llcc_profile_picture_by_user';
  function pictureStore(){try{return JSON.parse(localStorage.getItem(PROFILE_PICTURE_KEY)||'{}')}catch(e){return {}}}
  function pictureIdentity(u){return String((u&&u.id)||((u&&u.email)||'').toLowerCase())}
  function storePicture(u,pic){const store=pictureStore(),key=pictureIdentity(u);if(!key)return;if(pic)store[key]=pic;else delete store[key];localStorage.setItem(PROFILE_PICTURE_KEY,JSON.stringify(store))}
  function setAvatar(el,u){if(!el)return;const pic=u&&u.profilePicture;el.replaceChildren();if(pic){const img=document.createElement('img');img.src=pic;img.alt='Profile picture';el.appendChild(img)}else{el.textContent=initialsOf(u&&u.name)}}
  function readCompressedImage(file,maxDimension,quality){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read this image.'));reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('This image could not be opened.'));image.onload=()=>{const scale=Math.min(1,maxDimension/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',quality))};image.src=reader.result};reader.readAsDataURL(file)})}
  function addProfileControls(){const avatar=document.getElementById('profileAvatar'),input=document.getElementById('profilePictureInput'),remove=document.getElementById('removeProfilePictureBtn');if(!avatar||!input)return;
    if(!input.dataset.bound){input.dataset.bound='1';input.addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)){alert('Choose a JPG, PNG, or WEBP image.');e.target.value='';return}if(f.size>5*1024*1024){alert('Please choose an image smaller than 5 MB.');e.target.value='';return}try{const u=current()||{};u.profilePicture=await readCompressedImage(f,480,.82);storePicture(u,u.profilePicture);persistUser(u);setAvatar(document.getElementById('profileAvatar'),u);setAvatar(document.getElementById('topAvatar'),u);if(typeof showToast==='function')showToast('Profile picture saved on this browser.')}catch(err){alert(err.message||'Could not save this image.')}finally{e.target.value=''}})}
    if(remove&&!remove.dataset.bound){remove.dataset.bound='1';remove.addEventListener('click',()=>{const u=current()||{};delete u.profilePicture;storePicture(u,null);persistUser(u);setAvatar(document.getElementById('profileAvatar'),u);setAvatar(document.getElementById('topAvatar'),u);if(typeof showToast==='function')showToast('Profile picture removed.')})}
  }
  const oldUpdate=window.updateUserInterface;
  window.updateUserInterface=function(u){if(u){const store=pictureStore(),key=pictureIdentity(u);if(!u.profilePicture&&key&&store[key])u={...u,profilePicture:store[key]};if(u.profilePicture&&key&&!store[key])storePicture(u,u.profilePicture)}if(oldUpdate)oldUpdate(u);setAvatar(document.getElementById('profileAvatar'),u);setAvatar(document.getElementById('topAvatar'),u);addProfileControls()};
  
function addHomeworkDetails() {
    const existingBox = document.getElementById('homeworkDetailsBox');

    // If the box already exists, ensure it is in the correct location.
    const submissionsBody = document.getElementById(
        'teacherHomeworkSubmissionsTableBody'
    );

    const submissionsCard = submissionsBody?.closest('.table-card');

    if (existingBox) {
        if (submissionsCard && existingBox.parentElement !== submissionsCard.parentElement) {
            submissionsCard.insertAdjacentElement('afterend', existingBox);
        }
        return;
    }

    const box = document.createElement('div');

    box.id = 'homeworkDetailsBox';
    box.className = 'details-box hidden';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');

    box.innerHTML = `
        <div class="homework-details-content">
            <h3 id="homeworkDetailsTitle">Homework Details</h3>

            <p><b>Subject:</b> <span id="hdSubject"></span></p>
            <p><b>Due date / submitted:</b> <span id="hdDate"></span></p>
            <p><b>Status:</b> <span id="hdStatus"></span></p>

            <p><b>Description:</b></p>
            <p id="hdDescription" style="white-space:pre-wrap;overflow-wrap:anywhere"></p>

            <p id="hdStudentRow" class="hidden">
                <b>Submitted by:</b> <span id="hdStudent"></span>
            </p>

            <div class="form-actions">
                <button type="button" class="secondary-btn" id="closeHd">
                    Close
                </button>

                <button type="button" class="danger-btn hidden" id="deleteHd">
                    Delete Submission
                </button>
            </div>
        </div>
    `;

    // Place the details box immediately after the submissions card.
    if (submissionsCard) {
        submissionsCard.insertAdjacentElement('afterend', box);
    } else {
        // Fallback if the submissions card is not available yet.
        document.body.appendChild(box);
    }

    document.getElementById('closeHd').addEventListener('click', () => {
        box.classList.add('hidden');
    });

    box.addEventListener('click', event => {
        if (event.target === box) {
            box.classList.add('hidden');
        }
    });
}

    
function addHomeworkDetails() {
    const container = document.getElementById('homeworkDetailsContainer');
    const submissionsBody = document.getElementById(
        'teacherHomeworkSubmissionsTableBody'
    );

    // Find the correct location for the homework details.
    const submissionsCard = submissionsBody?.closest('.table-card');

    if (!container) {
        console.error(
            'homeworkDetailsContainer was not found. Add it to your HTML first.'
        );
        return;
    }

    // Ensure the container is placed directly after the submissions card.
    if (
        submissionsCard &&
        container.previousElementSibling !== submissionsCard
    ) {
        submissionsCard.insertAdjacentElement('afterend', container);
    }

    // Reuse the existing details box if it has already been created.
    let box = document.getElementById('homeworkDetailsBox');

    if (box) {
        if (box.parentElement !== container) {
            container.appendChild(box);
        }
        return;
    }

    // Create the details box.
    box = document.createElement('div');
    box.id = 'homeworkDetailsBox';
    box.className = 'details-box hidden';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'homeworkDetailsTitle');

    box.innerHTML = `
        <div class="homework-details-content">
            <h3 id="homeworkDetailsTitle">Homework Details</h3>

            <p>
                <b>Subject:</b>
                <span id="hdSubject"></span>
            </p>

            <p>
                <b>Due date / submitted:</b>
                <span id="hdDate"></span>
            </p>

            <p>
                <b>Status:</b>
                <span id="hdStatus"></span>
            </p>

            <p><b>Description:</b></p>

            <p
                id="hdDescription"
                style="white-space:pre-wrap;overflow-wrap:anywhere"
            ></p>

            <p id="hdStudentRow" class="hidden">
                <b>Submitted by:</b>
                <span id="hdStudent"></span>
            </p>

            <div class="form-actions">
                <button
                    type="button"
                    class="secondary-btn"
                    id="closeHd"
                >
                    Close
                </button>

                <button
                    type="button"
                    class="danger-btn hidden"
                    id="deleteHd"
                >
                    Delete Submission
                </button>
            </div>
        </div>
    `;

    // Put the details box inside the dedicated HTML container.
    container.appendChild(box);

    // Close button.
    document.getElementById('closeHd').addEventListener('click', () => {
        box.classList.add('hidden');
    });

    // Close when clicking the backdrop.
    box.addEventListener('click', event => {
        if (event.target === box) {
            box.classList.add('hidden');
        }
    });

    console.log('Homework details box initialized successfully.');
}


  window.viewHomework=function(id,row){
    const list=Array.isArray(window.portalHomeworkSubmissions)?window.portalHomeworkSubmissions:[];
    const h=list.find(x=>String(x.id)===String(id));
    const cells=row?row.querySelectorAll('td'):[];
    const value=(index)=>cells[index]?.innerText?.trim()||'';
    const title=h?.title||value(1)||'Homework Details';
    const subject=h?.subject||value(0);
    const date=h?.submitted_at?new Date(h.submitted_at).toLocaleString():value(2);
    const status=h?.status||value(3);
    const description=h?.description||'No additional description was saved for this sample assignment.';
    addHomeworkDetails();
    const box=document.getElementById('homeworkDetailsBox');
    if(!box)return;
    document.getElementById('homeworkDetailsTitle').textContent=title;
    document.getElementById('hdSubject').textContent=subject||'—';
    document.getElementById('hdDate').textContent=date||'—';
    document.getElementById('hdStatus').textContent=status||'—';
    document.getElementById('hdDescription').textContent=description;
    const studentRow=document.getElementById('hdStudentRow');
    studentRow.classList.toggle('hidden',!h?.student);
    document.getElementById('hdStudent').textContent=h?.student?.name||'';
    const del=document.getElementById('deleteHd');
    del.classList.add('hidden');
    del.onclick=null;
    box.classList.remove('hidden');
  };
  function makeHomeworkButtons(){
    const tableBody=document.getElementById('homeworkTableBody');
    if(!tableBody||tableBody.dataset.viewHandler==='ready')return;
    tableBody.dataset.viewHandler='ready';
    // Use the existing Action column; don't append a duplicate column.
    tableBody.querySelectorAll('tr').forEach(tr=>{
      const button=tr.querySelector('td:last-child button');
      if(button){button.type='button';button.classList.add('homework-view-btn');button.removeAttribute('onclick')}
    });
    tableBody.addEventListener('click',event=>{
      const button=event.target.closest('.homework-view-btn, td:last-child button');
      if(!button)return;
      const row=button.closest('tr');
      if(!row)return;
      event.preventDefault();
      window.viewHomework(button.dataset.homeworkId||row.dataset.homeworkId||'',row);
    });
  }
  function addSolutions(){
    const page=[...document.querySelectorAll('.page')].find(x=>/solutions/i.test(x.innerText));if(!page||page.querySelector('.solution-modal'))return;
    const modal=document.createElement('div');modal.className='solution-modal hidden';modal.innerHTML='<div class="modal-card"><h2 id="solutionTitle"></h2><div id="solutionBody"></div><button class="secondary-btn" id="closeSolution">Close</button></div>';page.appendChild(modal);const data={Mathematics:['Review the lesson examples, practice the assigned equations, and check each answer carefully.','1. Write the problem. 2. Show your solution. 3. Simplify the final answer.'],English:['Identify the main idea, supporting details, vocabulary, and grammar patterns in the passage.','Use complete sentences and quote details from the text when explaining your answer.'],Science:['Review the key concepts, definitions, processes, and real-world examples from the lesson.','Explain the process in your own words and include labeled diagrams when needed.']};window.openSolution=function(subject){document.getElementById('solutionTitle').textContent=subject+' Solutions';document.getElementById('solutionBody').innerHTML='<p>'+data[subject][0]+'</p><p><b>Suggested solution guide:</b> '+data[subject][1]+'</p>';modal.classList.remove('hidden')};document.getElementById('closeSolution').onclick=()=>modal.classList.add('hidden');page.querySelectorAll('.solution-open-btn').forEach(b=>{const subject=b.closest('.solution-card')?.querySelector('h2')?.textContent.replace(' Solutions','')||'Mathematics';b.onclick=()=>openSolution(subject)})
  }

function initTeacherMessages() {
    const list = document.getElementById('teacherList');
    const header = document.getElementById('chatHeader');
    const messages = document.getElementById('chatMessages');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('sendChatBtn');
    const search = document.getElementById('messageSearch');

    if (!list || !header || !messages || !form || !input || !send) return;

    const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';

    const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));

    const getId = user => String(user?.id ?? '');

    function getInitialsSafe(name) {
        if (typeof getInitials === 'function') {
            return getInitials(name || 'User');
        }

        return String(name || 'User')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0])
            .join('')
            .toUpperCase();
    }

    let current = typeof getCurrentUser === 'function'
        ? getCurrentUser()
        : null;

    let currentId = getId(current);
    let people = [];
    let selected = null;
    let lastMessages = {};
    let loadingThread = false;
    let sending = false;
    let threadRequestId = 0;

    async function api(url, options = {}) {
        const headers = {
            'Accept': 'application/json',
            ...(options.body ? {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf
            } : {}),
            ...(options.headers || {})
        };

        const response = await fetch(url, {
            credentials: 'same-origin',
            ...options,
            headers
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Your session has expired. Please sign in again.');
            }

            if (response.status === 419) {
                throw new Error('Your security token expired. Refresh the page and sign in again.');
            }

            throw new Error(data.message || 'The messaging request failed.');
        }

        return data;
    }

    function formatTime(value) {
        if (!value) return '';

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return '';

        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function showError(message) {
        messages.innerHTML =
            '<div class="chat-empty">' +
                '<div>✉</div>' +
                '<h3>Unable to load messages</h3>' +
                '<p>' + esc(message) + '</p>' +
            '</div>';
    }

    function renderMessages(items = []) {
        if (!selected) {
            messages.innerHTML =
                '<div class="chat-empty">' +
                    '<div>✉</div>' +
                    '<h3>Your conversations</h3>' +
                    '<p>Choose a student or teacher to start a private conversation.</p>' +
                '</div>';
            return;
        }

        if (!items.length) {
            messages.innerHTML =
                '<div class="chat-empty">' +
                    '<div>✉</div>' +
                    '<h3>Start a private conversation</h3>' +
                    '<p>Send a message to ' + esc(selected.name) + '.</p>' +
                '</div>';
            return;
        }

        messages.innerHTML = items.map(message => {
            const mine = String(message.sender_id) === currentId;
            const senderName = mine
                ? 'You'
                : (message.sender_name || selected.name);

            return (
                '<div class="chat-bubble ' +
                    (mine ? 'sent' : 'received') + '">' +
                    esc(message.message) +
                    '<span class="chat-time">' +
                        esc(senderName) + ' · ' +
                        esc(formatTime(message.created_at)) +
                    '</span>' +
                '</div>'
            );
        }).join('');

        messages.scrollTop = messages.scrollHeight;
    }

    function renderList() {
        const query = (search?.value || '').trim().toLowerCase();

        const visible = people.filter(person => {
            const last = lastMessages[String(person.id)] || '';

            return (
                person.name + ' ' +
                person.role + ' ' +
                person.email + ' ' +
                last
            ).toLowerCase().includes(query);
        });

        list.innerHTML = visible.length
            ? visible.map(person => {
                const id = String(person.id);
                const last = lastMessages[id] || 'Private message';
                const roleLabel = person.role === 'teacher'
                    ? 'Teacher'
                    : 'Student';

                return (
                    '<button type="button" class="teacher-option ' +
                        (selected && String(selected.id) === id ? 'active' : '') +
                        '" data-person="' + esc(id) + '">' +
                        '<span class="teacher-avatar">' +
                            esc(getInitialsSafe(person.name)) +
                        '</span>' +
                        '<span>' +
                            '<strong>' + esc(person.name) + '</strong>' +
                            '<small>' + roleLabel + ' · ' +
                                esc(last) +
                            '</small>' +
                        '</span>' +
                    '</button>'
                );
            }).join('')
            : '<div class="empty-state" style="padding:22px">' +
                'No other registered students or teachers found.' +
              '</div>';

        list.querySelectorAll('[data-person]').forEach(button => {
            button.addEventListener('click', () => {
                const person = people.find(
                    item => String(item.id) === button.dataset.person
                );

                if (person) choosePerson(person);
            });
        });
    }

    function renderHeader(person) {
        if (!person) {
            header.innerHTML =
                '<div class="teacher-avatar">✉</div>' +
                '<div><h3>New conversation</h3>' +
                '<p>Select a registered student or teacher.</p></div>';
            return;
        }

        const roleLabel = person.role === 'teacher'
            ? 'Teacher'
            : 'Student';

        header.innerHTML =
            '<div class="teacher-avatar">' +
                esc(getInitialsSafe(person.name)) +
            '</div>' +
            '<div><h3>' + esc(person.name) + '</h3>' +
            '<p>' + roleLabel +
                ' · <span style="color:#16804a">🔒 Private direct message</span>' +
            '</p></div>';
    }

    async function loadContacts() {
        const data = await api('/api/messages/contacts');

        people = (data.contacts || []).map(person => ({
            ...person,
            id: String(person.id),
            name: person.name || person.email || 'User',
            email: person.email || '',
            role: String(person.role || '').toLowerCase()
        }));

        if (selected) {
            selected = people.find(
                person => String(person.id) === String(selected.id)
            ) || null;
        }

        renderList();

        if (selected) {
            renderHeader(selected);
        } else if (people.length) {
            await choosePerson(people[0]);
        } else {
            renderHeader(null);
            renderMessages();
        }
    }

    async function loadThread() {
        if (!selected || !currentId || loadingThread) return;

        const selectedId = String(selected.id);
        const requestId = ++threadRequestId;

        loadingThread = true;

        try {
            const data = await api(
                '/api/messages/' + encodeURIComponent(selectedId)
            );

            if (
                requestId !== threadRequestId ||
                !selected ||
                String(selected.id) !== selectedId
            ) {
                return;
            }

            const items = data.messages || [];

            lastMessages[selectedId] = items.length
                ? String(items[items.length - 1].message).slice(0, 60)
                : '';

            renderMessages(items);
            renderList();
        } catch (error) {
            if (requestId === threadRequestId) {
                showError(error.message);
            }
        } finally {
            if (requestId === threadRequestId) {
                loadingThread = false;
            }
        }
    }

    async function choosePerson(person) {
        if (!person) return;

        selected = person;
        threadRequestId++;
        loadingThread = false;

        renderHeader(person);
        renderList();

        input.placeholder = 'Message ' + person.name + '...';
        input.disabled = false;
        send.disabled = false;

        renderMessages([]);
        await loadThread();
    }

    async function refreshForCurrentUser() {
        current = typeof getCurrentUser === 'function'
            ? getCurrentUser()
            : null;

        const newId = getId(current);

        if (!current || !newId) {
            currentId = '';
            people = [];
            selected = null;
            lastMessages = {};
            threadRequestId++;

            input.value = '';
            input.disabled = true;
            send.disabled = true;
            list.innerHTML = '';

            renderHeader(null);
            renderMessages([]);
            return;
        }

        const accountChanged = newId !== currentId;
        currentId = newId;

        if (accountChanged) {
            selected = null;
            lastMessages = {};
        }

        try {
            await loadContacts();
        } catch (error) {
            showError(error.message);
        }
    }

    window.refreshPortalMessaging = refreshForCurrentUser;

    if (search) {
        search.addEventListener('input', renderList);
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const text = input.value.trim();

        if (!text || !selected || sending || !currentId) return;

        const recipientId = String(selected.id);

        sending = true;
        send.disabled = true;

        try {
            await api(
                '/api/messages/' + encodeURIComponent(recipientId),
                {
                    method: 'POST',
                    body: JSON.stringify({ message: text })
                }
            );

            input.value = '';

            await loadThread();
            await loadContacts();

            input.focus();
        } catch (error) {
            showError(error.message);
        } finally {
            sending = false;
            send.disabled = !currentId || !selected;
        }
    });

    // Refresh the open conversation to receive messages from another account.
    setInterval(() => {
        const latestUser = typeof getCurrentUser === 'function'
            ? getCurrentUser()
            : null;

        if (getId(latestUser) !== currentId) {
            refreshForCurrentUser();
        } else if (currentId && selected && !document.hidden) {
            loadThread();
        }
    }, 4000);

    refreshForCurrentUser();
}

document.addEventListener('DOMContentLoaded', () => {
    addProfileControls();
    addHomeworkDetails();
    makeHomeworkButtons();
    renderCustomHomework();
    addSolutions();
    initTeacherMessages();
});

(function initClassLessonPlans(){
  const storageKey='llcc_class_lesson_plans_v1';
  const form=document.getElementById('lessonPlanForm');
  const teacherTools=document.getElementById('teacherLessonTools');
  const cards=document.getElementById('studentSolutionCards');
  const notice=document.getElementById('studentLessonNotice');
  const list=document.getElementById('lessonPlansList');
  if(!form||!list)return;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const getPlans=()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'[]')}catch(e){return []}};
  const readKey='llcc_read_activity_notifications_v1';
  const getRead=()=>{try{return JSON.parse(localStorage.getItem(readKey)||'[]')}catch(e){return []}};
  const saveRead=items=>localStorage.setItem(readKey,JSON.stringify(items));
  const bell=document.getElementById('notificationToggle'), panel=document.getElementById('notificationPanel'), count=document.getElementById('notificationCount'), itemsBox=document.getElementById('notificationItems');
  function renderNotifications(){
    const user=activeUser();
    if(!user||user.role!=='student'){count.style.display='none';itemsBox.innerHTML='<p style="font-size:13px;color:#737b8c;padding:12px 0;">Notifications are available in the student account.</p>';return;}
    const relevant=getPlans().filter(p=>p.targetClass==='All Classes'||!user.className||p.targetClass===user.className).slice().reverse();
    const read=getRead(); const unread=relevant.filter(p=>!read.includes(String(p.id)));
    count.textContent=unread.length>99?'99+':String(unread.length);count.style.display=unread.length?'block':'none';
    itemsBox.innerHTML=relevant.length?relevant.map(p=>'<div class="notification-entry '+(read.includes(String(p.id))?'':'unread')+'" data-notification-id="'+esc(p.id)+'"><strong>New activity uploaded: '+esc(p.title)+'</strong><p>'+esc(p.subject)+' · '+esc(p.targetClass)+(p.description?' — '+esc(p.description):'')+'</p><small>From '+esc(p.teacherName||'Teacher')+' · '+esc(p.sentAt||'')+'</small></div>').join(''):'<p style="font-size:13px;color:#737b8c;padding:12px 0;">No activity notifications yet.</p>';
    itemsBox.querySelectorAll('[data-notification-id]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.notificationId;const updated=getRead();if(!updated.includes(id))updated.push(id);saveRead(updated);renderNotifications();if(typeof window.showPage==='function')window.showPage('solutions');const nav=document.querySelector('.nav-item[data-page="solutions"]');if(nav)nav.click();}));
  }
  if(bell&&panel){bell.addEventListener('click',e=>{e.stopPropagation();const opening=panel.classList.contains('hidden');panel.classList.toggle('hidden');bell.setAttribute('aria-expanded',String(opening));if(opening)renderNotifications();});document.addEventListener('click',e=>{if(!document.getElementById('notificationBell').contains(e.target)){panel.classList.add('hidden');bell.setAttribute('aria-expanded','false');}});}
  const markRead=document.getElementById('markNotificationsRead');if(markRead)markRead.addEventListener('click',e=>{e.stopPropagation();const user=activeUser();if(!user||user.role!=='student')return;const ids=getPlans().filter(p=>p.targetClass==='All Classes'||!user.className||p.targetClass===user.className).map(p=>String(p.id));saveRead([...new Set([...getRead(),...ids])]);renderNotifications();});
  window.addEventListener('storage',e=>{if(e.key===storageKey||e.key===readKey){render();renderNotifications();}});
  function activeUser(){return typeof getCurrentUser==='function'?getCurrentUser():null}
  function render(){
    const user=activeUser(); const isTeacher=!!user&&user.role==='teacher';
    renderNotifications();
    teacherTools.classList.toggle('hidden',!isTeacher); cards.classList.toggle('hidden',isTeacher); notice.classList.toggle('hidden',isTeacher);
    const plans=getPlans().filter(p=>isTeacher ? p.teacherEmail===(user.email||'') : (p.targetClass==='All Classes'||!user||!user.className||p.targetClass===user.className));
    if(!plans.length){list.innerHTML=isTeacher?'<div class="empty-state"><div class="empty-icon">▤</div><h3>No lesson plans sent yet</h3><p>Use the form above to send a lesson plan to one of your classes.</p></div>':'';return;}
    list.innerHTML=plans.slice().reverse().map(p=>'<article class="lesson-plan-card"><span class="lesson-plan-tag">'+esc(p.subject)+'</span><h3>'+esc(p.title)+'</h3><div class="lesson-plan-meta"><span class="lesson-plan-tag">'+esc(p.targetClass)+'</span>'+(p.lessonDate?'<span class="lesson-plan-tag">Lesson: '+esc(p.lessonDate)+'</span>':'')+(p.dueDate?'<span class="lesson-plan-tag">Due: '+esc(p.dueDate)+'</span>':'')+'</div><p>'+esc(p.description||'No additional instructions provided.')+'</p>'+(p.fileName&&p.fileData?'<a class="lesson-file-link" download="'+esc(p.fileName)+'" href="'+p.fileData+'">Download attachment: '+esc(p.fileName)+'</a>':'')+'<div class="lesson-by">Sent by '+esc(p.teacherName||'Teacher')+' · '+esc(p.sentAt)+'</div></article>').join('');
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault(); const user=activeUser(); if(!user||user.role!=='teacher'){return;}
    const fileInput=document.getElementById('lessonFile'); const file=fileInput.files[0]; let fileData='';
    if(file){if(file.size>1500000){document.getElementById('lessonPlanFeedback').textContent='Please attach a file smaller than 1.5 MB.';return;}fileData=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);});}
    const plans=getPlans(); plans.push({id:Date.now(),title:document.getElementById('lessonTitle').value.trim(),subject:document.getElementById('lessonSubject').value,targetClass:document.getElementById('lessonClass').value,lessonDate:document.getElementById('lessonDate').value,dueDate:document.getElementById('lessonDueDate').value,dueTime:document.getElementById('lessonDueTime').value,description:document.getElementById('lessonDescription').value.trim(),fileName:file?file.name:'',fileData,teacherEmail:user.email||'',teacherName:user.name||'Teacher',sentAt:new Date().toLocaleString()});
    try{localStorage.setItem(storageKey,JSON.stringify(plans));form.reset();document.getElementById('lessonPlanFeedback').textContent='Lesson plan sent to the selected class. Students in that class will see a notification.';render();renderNotifications();}catch(err){document.getElementById('lessonPlanFeedback').textContent='Could not save this lesson plan. Try a smaller attachment.';}
  });
  const oldShow=window.showApplication;
  if(typeof oldShow==='function'){window.showApplication=function(user){oldShow(user);render();};}
  document.querySelectorAll('.nav-item[data-page="solutions"]').forEach(b=>b.addEventListener('click',render));
  render();
})();

})();

;

/* ===== Original inline script block 3 ===== */

/* Teacher Results: render activities created in Solutions and count unique student submissions. */

/* Teacher Results: count database-backed homework submissions. */
(function initTeacherActivityResults() {
    const plansKey = 'llcc_class_lesson_plans_v1';
    const studentCard = document.getElementById('studentResultsCard');
    const teacherCard = document.getElementById('teacherResultsCard');
    const body = document.getElementById('teacherResultsTableBody');
    const description = document.getElementById('resultsPageDescription');

    if (!studentCard || !teacherCard || !body) return;

    const safeParse = key => {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (_) {
            return [];
        }
    };

    const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));

    const fmtDate = value => {
        if (!value) return 'Not set';

        const parts = String(value).split('-');

        if (parts.length === 3) {
            const date = new Date(
                Number(parts[0]),
                Number(parts[1]) - 1,
                Number(parts[2])
            );

            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                });
            }
        }

        return String(value);
    };

    async function render(user = null) {
        user = user || (
            typeof getCurrentUser === 'function'
                ? getCurrentUser()
                : null
        );

        const isTeacher = !!user && user.role === 'teacher';

        studentCard.classList.toggle('hidden', isTeacher);
        teacherCard.classList.toggle('hidden', !isTeacher);

        if (description) {
            description.textContent = isTeacher
                ? 'Review activities sent to your classes and track student submissions.'
                : 'Check your examination results and grades.';
        }

        if (!isTeacher) return;

        const plans = safeParse(plansKey).filter(plan =>
            String(plan.teacherEmail || '').toLowerCase() ===
            String(user.email || '').toLowerCase()
        );

        if (!plans.length) {
            body.innerHTML =
                '<tr><td colspan="5">' +
                '<div class="empty-state">' +
                '<h3>No activities sent yet</h3>' +
                '<p>Activities you send from Solutions will appear here with their due dates and submission counts.</p>' +
                '</div></td></tr>';
            return;
        }

        body.innerHTML =
            '<tr><td colspan="5">Loading database submissions...</td></tr>';

        try {
            const data = await portalApi('/api/homework/submissions');
            const submissions = data.submissions || [];

            body.innerHTML = plans.slice().reverse().map(plan => {
                const planTitle = String(plan.title || '')
                    .trim()
                    .toLowerCase();

                const planSubject = String(plan.subject || '')
                    .trim()
                    .toLowerCase();

                const matching = submissions.filter(submission => {
                    const sameTitle = String(submission.title || '')
                        .trim()
                        .toLowerCase() === planTitle;

                    const sameSubject = String(submission.subject || '')
                        .trim()
                        .toLowerCase() === planSubject;

                    const studentClass = submission.student?.class_name;
                    const targetClass = plan.targetClass || '';

                    const sameClass =
                        targetClass === 'All Classes' ||
                        studentClass === targetClass;

                    return sameTitle && sameSubject && sameClass;
                });

                const uniqueStudents = new Set(
                    matching.map(submission =>
                        String(submission.student?.id ?? submission.id)
                    )
                );

                const count = uniqueStudents.size;

                return '<tr>' +
                    '<td>' + esc(plan.subject || '—') + '</td>' +
                    '<td>' + esc(plan.title || 'Untitled activity') + '</td>' +
                    '<td>' + esc(fmtDate(plan.dueDate || '') + (plan.dueTime ? ' at ' + new Date('2000-01-01T' + plan.dueTime).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}) : ' (time not set)')) + '</td>' +
                    '<td><span class="badge info">' +
                        esc(plan.targetClass || '—') +
                    '</span></td>' +
                    '<td><span class="badge ' +
                        (count ? 'success' : 'warning') + '">' +
                        count +
                        (count === 1 ? ' student' : ' students') +
                        ' turned in</span></td>' +
                    '</tr>';
            }).join('');
        } catch (error) {
            body.innerHTML =
                '<tr><td colspan="5">' +
                '<p>Could not load submission results. Please refresh and sign in again.</p>' +
                '</td></tr>';

            console.error('Could not load teacher results:', error);
        }
    }

    const originalUpdateUserInterface = window.updateUserInterface;

    if (
        typeof originalUpdateUserInterface === 'function' &&
        !originalUpdateUserInterface.__resultsWrapped
    ) {
        const wrapped = function(user) {
            originalUpdateUserInterface(user);
            render(user);
        };

        wrapped.__resultsWrapped = true;
        window.updateUserInterface = wrapped;
    }

    window.addEventListener('storage', event => {
        if (!event.key || event.key === plansKey) {
            render();
        }
    });

    document.querySelectorAll('.nav-item[data-page="results"]')
        .forEach(button => {
            button.addEventListener('click', () => render());
        });

    render();
})();
