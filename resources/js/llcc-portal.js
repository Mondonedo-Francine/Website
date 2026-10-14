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
    refreshStudentRecentActivity();
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
    const addNoticeButton = document.getElementById("addNoticeBtn");
    const noticeFormCard = document.getElementById("noticeFormCard");
    const isTeacher = !!user && user.role === "teacher";
    if (addNoticeButton) addNoticeButton.classList.toggle("hidden", !isTeacher);
    if (noticeFormCard && !isTeacher) noticeFormCard.classList.add("hidden");
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

    const yearGroup = document.getElementById("studentYearLevelGroup");
    const classGroup = document.getElementById("studentClassNameGroup");
    const yearSelect = document.getElementById("profileYearLevel");
    const classSelect = document.getElementById("profileClassName");
    if (yearGroup) yearGroup.classList.toggle("hidden", user.role !== "student");
    if (classGroup) classGroup.classList.toggle("hidden", user.role !== "student");
    if (yearSelect) yearSelect.value = user.year_level || "";
    if (classSelect) classSelect.value = user.class_name || user.className || "";

    // Render the profile picture URL returned by Laravel after login.
    ["profileAvatar", "topAvatar"].forEach(id => {
        const avatar = document.getElementById(id);
        if (!avatar) return;
        const pictureUrl = user.profile_picture_url;
        avatar.replaceChildren();
        if (pictureUrl) {
            const image = document.createElement("img");
            image.src = pictureUrl;
            image.alt = "Profile picture";
            image.onerror = () => {
                avatar.replaceChildren();
                avatar.textContent = getInitials(user.name);
            };
            avatar.appendChild(image);
        } else {
            avatar.textContent = getInitials(user.name);
        }
    });
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

document.getElementById("profileForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const updatedUser = {
        ...currentUser,
        name: document.getElementById("profileFullName").value.trim(),
        email: document.getElementById("profileEmail").value.trim().toLowerCase(),
        phone: document.getElementById("profilePhone").value.trim()
    };

    if (currentUser.role === "student") {
        const className = document.getElementById("profileClassName")?.value || "";
        const yearLevel = document.getElementById("profileYearLevel")?.value || "";
        if (!className || !yearLevel) {
            showToast("Please select your year level and section.");
            return;
        }

        try {
            const result = await portalApi("/api/student/academic-details", {
                method: "PUT",
                body: JSON.stringify({ class_name: className, year_level: yearLevel })
            });
            updatedUser.class_name = result.user.class_name;
            updatedUser.year_level = result.user.year_level;
        } catch (error) {
            showToast(error.message || "Could not save your year and section.");
            return;
        }
    }

    // Keep the current browser session in sync with Laravel's saved academic details.
    saveCurrentUser(updatedUser);
    const users = getUsers();
    const index = users.findIndex(user => String(user.id) === String(currentUser.id));
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
        saveUsers(users);
    }
    updateUserInterface(updatedUser);
    showToast(currentUser.role === "student" ? "Profile and class details saved successfully." : "Profile updated successfully.");
});

/* =========================================================
   HOMEWORK SUBMISSIONS (SAVED BY LARAVEL)
========================================================= */

document.getElementById("addHomeworkBtn").addEventListener("click", function() {
    refreshHomeworkAssignmentOptions();
    document.getElementById("homeworkFormCard").classList.remove("hidden");
});

document.getElementById("cancelHomeworkBtn").addEventListener("click", function() {
    document.getElementById("homeworkFormCard").classList.add("hidden");
});
// Populate the student assignment dropdown from activities sent in Solutions.
function refreshHomeworkAssignmentOptions() {
    const select = document.getElementById("homeworkTitle");
    if (!select) return;
    const user = getCurrentUser();
    let plans = [];
    try { plans = JSON.parse(localStorage.getItem("llcc_class_lesson_plans_v1") || "[]"); } catch (_) {}
    const relevant = plans.filter(plan => {
        if (user?.role !== "student") return false;
        const target = String(plan.targetClass || "");
        return target === "All Classes" || !(user.class_name || user.className) || target === (user.class_name || user.className);
    });
    const current = select.value;
    select.replaceChildren(new Option("Choose an activity sent by your teacher", ""));
    // Subject labels can differ slightly between the Homework and Solutions pages
    // (for example, "Computer" vs "Computer Studies"). Normalize them before filtering.
    const normalizeSubject = value => {
        const normalized = String(value || "").trim().toLowerCase().replace(/\\s+/g, " ");
        if (normalized === "computer" || normalized === "computer studies" || normalized === "computing") return "computer studies";
        if (normalized === "math" || normalized === "maths" || normalized === "mathematics") return "mathematics";
        return normalized;
    };
    const selectedSubject = normalizeSubject(document.getElementById("homeworkSubject")?.value);
    const matchingPlans = relevant.filter(plan => normalizeSubject(plan.subject) === selectedSubject);
    matchingPlans.forEach(plan => {
        const option = new Option(plan.title + " — " + plan.subject, plan.title);
        select.add(option);
    });
    if ([...select.options].some(option => option.value === current)) select.value = current;
    if (matchingPlans.length === 0) {
        select.add(new Option(relevant.length ? "No activities for this subject" : "No activities found — check Solutions", ""));
    }
}
document.getElementById("homeworkSubject")?.addEventListener("change", refreshHomeworkAssignmentOptions);
document.getElementById("homeworkAttachmentType")?.addEventListener("change", event => {
    const value = event.target.value;
    document.getElementById("homeworkFileGroup")?.classList.toggle("hidden", value !== "file");
    document.getElementById("homeworkLinkGroup")?.classList.toggle("hidden", value !== "link" && value !== "drive");
});
window.addEventListener("storage", event => {
    if (!event.key || event.key === "llcc_class_lesson_plans_v1") refreshHomeworkAssignmentOptions();
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

    const selectedTitle = document.getElementById("homeworkTitle").value;
    const attachmentType = document.getElementById("homeworkAttachmentType")?.value || "";
    const attachmentUrl = document.getElementById("homeworkAttachmentUrl")?.value.trim() || "";
    const attachmentFile = document.getElementById("homeworkAttachmentFile")?.files?.[0] || null;
    const payload = {
        subject: document.getElementById("homeworkSubject").value,
        title: selectedTitle,
        description: document.getElementById("homeworkDescription").value.trim()
    };
    if (!selectedTitle) {
        showToast("Choose an activity sent by your teacher first.");
        return;
    }
    if (attachmentType === "link" || attachmentType === "drive") {
        if (!attachmentUrl) {
            showToast("Paste the attachment link or Google Drive link, or choose No attachment.");
            return;
        }
        payload.description += "\\n\\n" + (attachmentType === "drive" ? "Google Drive: " : "Attachment link: ") + attachmentUrl;
    }
    if (attachmentType === "file" && attachmentFile) {
        if (attachmentFile.size > 5 * 1024 * 1024) {
            showToast("Please choose a file smaller than 5 MB.");
            return;
        }
        payload.description += "\\n\\nAttached file selected: " + attachmentFile.name + ". For this demo, please use a shareable file/Drive link so your teacher can open it.";
    }
    button.disabled = true;
    try {
        await portalApi("/api/homework/submissions", { method: "POST", body: JSON.stringify(payload) });
        form.reset();
        document.getElementById("homeworkFileGroup")?.classList.add("hidden");
        document.getElementById("homeworkLinkGroup")?.classList.add("hidden");
        document.getElementById("homeworkFormCard").classList.add("hidden");
        await renderCustomHomework();
        showToast("Turned in successfully.");
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
            homework.status === "Submitted" ? "Turned in" : (homework.status || "Turned in"),
            homework.section || "Not specified"
        ];
        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
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
                    status.textContent = homework.status === "Submitted" ? "Turned in" : (homework.status || "Turned in");
                    const action = document.createElement("td");
                    action.className = "homework-action-cell";
                    const view = document.createElement("button");
                    view.type = "button";
                    view.className = "secondary-btn homework-view-btn";
                    view.textContent = "View submission";
                    view.addEventListener("click", () => window.viewHomework?.(homework.id, row));
                    const statusWrap = document.createElement("div");
                    statusWrap.className = "homework-status-control";
                    const statusLabel = document.createElement("label");
                    statusLabel.textContent = "Review status";
                    statusLabel.className = "homework-status-label";
                    const statusSelect = document.createElement("select");
                    statusSelect.className = "homework-status-select";
                    statusSelect.setAttribute("aria-label", "Homework review status");
                    [["Submitted", "Turned in"], ["Done", "Done"], ["Not Done", "Incomplete"]].forEach(([value, label]) => {
                        const option = document.createElement("option");
                        option.value = value;
                        option.textContent = label;
                        statusSelect.appendChild(option);
                    });
                    statusSelect.value = ["Submitted", "Done", "Not Done"].includes(homework.status) ? homework.status : "Submitted";
                    const syncStatusStyle = () => {
                        statusSelect.dataset.status = statusSelect.value === "Done" ? "done" : statusSelect.value === "Not Done" ? "incomplete" : "turned-in";
                    };
                    syncStatusStyle();
                    statusSelect.addEventListener("change", async () => {
                        const previousStatus = homework.status || "Submitted";
                        statusSelect.disabled = true;
                        try {
                            await portalApi("/api/homework/submissions/" + homework.id + "/status", {
                                method: "PATCH",
                                body: JSON.stringify({ status: statusSelect.value })
                            });
                            homework.status = statusSelect.value;
                            status.textContent = homework.status === "Submitted" ? "Turned in" : homework.status;
                            syncStatusStyle();
                            showToast("Review status saved: " + (homework.status === "Not Done" ? "Incomplete" : homework.status === "Submitted" ? "Turned in" : homework.status) + ".");
                            renderStudentHomeworkResults(window.portalHomeworkSubmissions);
                        } catch (error) {
                            statusSelect.value = previousStatus;
                            syncStatusStyle();
                            showToast(error.message || "Could not update homework status.");
                        } finally {
                            statusSelect.disabled = false;
                        }
                    });
                    statusWrap.append(statusLabel, statusSelect);
                    action.append(view, statusWrap);
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

document.getElementById("addNoticeBtn")?.addEventListener("click", function() {
    if (getCurrentUser()?.role !== "teacher") return;
    document.getElementById("noticeFormCard")?.classList.remove("hidden");
});

document.getElementById("cancelNoticeBtn").addEventListener("click", function() {
    document.getElementById("noticeFormCard").classList.add("hidden");
});

document.getElementById("noticeForm")?.addEventListener("submit", function(event) {
    event.preventDefault();
    if (getCurrentUser()?.role !== "teacher") {
        document.getElementById("noticeFormCard")?.classList.add("hidden");
        return;
    }

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
    const currentUser = getCurrentUser();
    const addNoticeButton = document.getElementById("addNoticeBtn");
    if (addNoticeButton) addNoticeButton.classList.toggle("hidden", currentUser?.role !== "teacher");
    const formCard = document.getElementById("noticeFormCard");
    if (formCard && currentUser?.role !== "teacher") formCard.classList.add("hidden");
    const customNotices = JSON.parse(
        localStorage.getItem(CUSTOM_NOTICES_KEY) || "[]"
    );

    const allNotices = [...customNotices, ...defaultNotices];
    const container = document.getElementById("noticesContainer");
    if (!container) return;

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

/* Refresh dashboard recent activity when notices or notifications change. */
function refreshStudentRecentActivity() {
    const user = getCurrentUser();
    if (user?.role !== "student") return;
    const heading = Array.from(document.querySelectorAll("h3")).find(node => node.textContent.trim() === "Recent Activity");
    const card = heading?.closest(".card");
    if (!card) return;
    card.querySelectorAll(".activity-item, .student-recent-activity-empty").forEach(node => node.remove());
    let notices = [];
    try { notices = JSON.parse(localStorage.getItem(CUSTOM_NOTICES_KEY) || "[]"); } catch (_) {}
    const notifications = Array.from(document.querySelectorAll(".notification-entry")).map(node => ({ title: node.querySelector("strong")?.textContent || "New notification", date: node.querySelector("small")?.textContent || "Recently", icon: "•" }));
    const items = notices.map(notice => ({ title: "New notice: " + (notice.title || "Announcement"), date: notice.date || "Recently", icon: "◌" })).concat(notifications).slice(-5).reverse();
    if (!items.length) { const empty = document.createElement("p"); empty.className = "student-recent-activity-empty"; empty.textContent = "No new activity yet."; card.appendChild(empty); return; }
    items.forEach(item => { const row = document.createElement("div"); row.className = "activity-item"; const icon = document.createElement("div"); icon.className = "activity-icon"; icon.textContent = item.icon; const content = document.createElement("div"); const title = document.createElement("strong"); title.textContent = item.title; const date = document.createElement("span"); date.textContent = item.date; content.append(title, date); row.append(icon, content); card.appendChild(row); });
}
window.addEventListener("storage", event => { if (!event.key || event.key === CUSTOM_NOTICES_KEY || event.key.includes("notification")) { renderNotices(); refreshStudentRecentActivity(); } });
setInterval(() => { if (!document.hidden) { renderNotices(); refreshStudentRecentActivity(); } }, 5000);
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

/* Month/day filtering for the student attendance table. */
(function initStudentAttendanceFilters() {
    const month = document.getElementById("attendanceMonth");
    const day = document.getElementById("attendanceDay");
    const body = month?.closest(".table-card")?.querySelector("tbody");
    if (!month || !day || !body) return;
    const rows = () => Array.from(body.querySelectorAll("tr")).filter(row => row.cells.length >= 4);
    const dateOf = row => { const d = new Date(row.cells[0]?.textContent.trim() || ""); return Number.isNaN(d.getTime()) ? null : d; };
    const monthOf = d => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0");
    function updateDays() {
        const dates = rows().map(dateOf).filter(Boolean).filter(d => month.value === "all" || monthOf(d) === month.value);
        const selected = day.value;
        day.replaceChildren(new Option("All days", "all"));
        [...new Set(dates.map(d => d.getDate()))].sort((a,b) => a-b).forEach(d => day.add(new Option(String(d), String(d))));
        day.disabled = month.value === "all" || dates.length === 0;
        if (![...day.options].some(o => o.value === selected)) day.value = "all";
    }
    function apply() { rows().forEach(row => { const d = dateOf(row); row.hidden = !(d && (month.value === "all" || monthOf(d) === month.value) && (day.value === "all" || d.getDate() === Number(day.value))); }); }
    month.addEventListener("change", () => { updateDays(); apply(); });
    day.addEventListener("change", apply);
    updateDays(); apply();
})();
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

/* ===== Profile picture controls ===== */
(function () {
    function current() {
        if (typeof getCurrentUser === "function") {
            return getCurrentUser();
        }

        try {
            return JSON.parse(localStorage.getItem("currentUser") || "null");
        } catch (error) {
            return null;
        }
    }

    function persistUser(user) {
        if (typeof saveCurrentUser === "function") {
            saveCurrentUser(user);
        } else {
            localStorage.setItem("currentUser", JSON.stringify(user));
        }
    }

    function initialsOf(name) {
        return (name || "CR")
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word[0].toUpperCase())
            .join("");
    }

    function setAvatar(element, user) {
        if (!element) return;

        element.replaceChildren();

        if (user && user.profile_picture_url) {
            const img = document.createElement("img");
            img.src = user.profile_picture_url;
            img.alt = "Profile picture";
            img.onerror = () => {
                element.replaceChildren();
                element.textContent = initialsOf(user.name);
            };
            element.appendChild(img);
        } else {
            element.textContent = initialsOf(user && user.name);
        }
    }

    function updateAvatars(user) {
        setAvatar(document.getElementById("profileAvatar"), user);
        setAvatar(document.getElementById("topAvatar"), user);
    }

    async function pictureRequest(method, file) {
        const csrf =
            document.querySelector('meta[name="csrf-token"]')?.content || "";

        const options = {
            method,
            credentials: "same-origin",
            headers: {
                Accept: "application/json",
                "X-CSRF-TOKEN": csrf
            }
        };

        if (file) {
            const body = new FormData();
            body.append("picture", file);
            options.body = body;
        }

        const response = await fetch("/api/profile/picture", options);
        let data = {};

        try {
            data = await response.json();
        } catch (error) {}

        if (!response.ok) {
            const validationError = data.errors
                ? Object.values(data.errors).flat()[0]
                : null;

            throw new Error(
                validationError ||
                data.message ||
                "The profile picture request failed."
            );
        }

        return data;
    }

    async function addProfileControls() {
        const input = document.getElementById("profilePictureInput");
        const remove = document.getElementById("removeProfilePictureBtn");

        if (input && !input.dataset.bound) {
            input.dataset.bound = "true";

            input.addEventListener("change", async event => {
                const file = event.target.files && event.target.files[0];
                if (!file) return;

                if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                    alert("Choose a JPG, PNG, or WEBP image.");
                    event.target.value = "";
                    return;
                }

                if (file.size > 5 * 1024 * 1024) {
                    alert("Please choose an image smaller than 5 MB.");
                    event.target.value = "";
                    return;
                }

                try {
                    const data = await pictureRequest("POST", file);
                    const user = current();

                    if (user) {
                        user.profile_picture_url = data.profile_picture_url;
                        persistUser(user);
                        updateAvatars(user);

                        if (typeof updateUserInterface === "function") {
                            updateUserInterface(user);
                        }
                    }

                    if (typeof showToast === "function") {
                        showToast("Profile picture saved successfully.");
                    }
                } catch (error) {
                    alert(error.message || "Could not save the profile picture.");
                } finally {
                    event.target.value = "";
                }
            });
        }

        if (remove && !remove.dataset.bound) {
            remove.dataset.bound = "true";

            remove.addEventListener("click", async () => {
                try {
                    await pictureRequest("DELETE");
                    const user = current();

                    if (user) {
                        delete user.profile_picture_url;
                        delete user.profilePicture;
                        persistUser(user);
                        updateAvatars(user);

                        if (typeof updateUserInterface === "function") {
                            updateUserInterface(user);
                        }
                    }

                    if (typeof showToast === "function") {
                        showToast("Profile picture removed.");
                    }
                } catch (error) {
                    alert(error.message || "Could not remove the profile picture.");
                }
            });
        }

        const user = current();
        if (user) updateAvatars(user);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addProfileControls);
    } else {
        addProfileControls();
    }
})();

/* ===== Teacher homework details ===== */
function addHomeworkDetails() {
    if (!document.getElementById("homeworkReviewPolishStyles")) {
        const style = document.createElement("style");
        style.id = "homeworkReviewPolishStyles";
        style.textContent = `
            .homework-action-cell { min-width: 330px; }
            .homework-action-cell > .homework-view-btn { display:inline-flex; align-items:center; justify-content:center; margin:0 10px 0 0; white-space:nowrap; }
            .homework-status-control { display:inline-flex; align-items:center; gap:9px; flex-wrap:wrap; vertical-align:middle; }
            .homework-status-label { color:var(--muted,#64748b); font-size:12px; font-weight:700; }
            .homework-status-select { min-width:145px; max-width:100%; border:1px solid #cbd5e1; border-radius:999px; padding:10px 32px 10px 14px; font:inherit; font-size:13px; font-weight:700; cursor:pointer; background:#f8fafc; color:#334155; box-shadow:0 1px 2px rgba(15,23,42,.05); }
            .homework-status-select[data-status="turned-in"] { background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
            .homework-status-select[data-status="done"] { background:#ecfdf5; border-color:#a7f3d0; color:#047857; }
            .homework-status-select[data-status="incomplete"] { background:#fff7ed; border-color:#fed7aa; color:#c2410c; }
            .homework-status-select:disabled { opacity:.6; cursor:wait; }
            #homeworkDetailsBox:not(.hidden) { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:22px; background:rgba(15,23,42,.55); overflow-y:auto; }
            #homeworkDetailsBox .homework-details-content { width:min(680px,100%); max-height:calc(100vh - 44px); overflow-y:auto; margin:auto; padding:28px; border:1px solid #e2e8f0; border-radius:18px; background:#fff; color:#1e293b; box-shadow:0 24px 70px rgba(15,23,42,.25); }
            #homeworkDetailsBox #homeworkDetailsTitle { margin:0 0 18px; font-size:23px; }
            #homeworkDetailsBox .form-actions { display:flex; justify-content:flex-end; margin-top:22px; }
            @media(max-width:900px) { .homework-action-cell { min-width:280px; } .homework-action-cell > .homework-view-btn { margin-bottom:8px; } .homework-status-control { display:flex; } }
            @media(max-width:640px) { #homeworkDetailsBox .homework-details-content { padding:20px; } .homework-action-cell { min-width:240px; } }
        `;
        document.head.appendChild(style);
    }
    const submissionsBody = document.getElementById(
        "teacherHomeworkSubmissionsTableBody"
    );
    const submissionsCard = submissionsBody?.closest(".table-card");
    let box = document.getElementById("homeworkDetailsBox");

    if (box) {
        if (
            submissionsCard &&
            box.previousElementSibling !== submissionsCard
        ) {
            submissionsCard.insertAdjacentElement("afterend", box);
        }
        return;
    }

    box = document.createElement("div");
    box.id = "homeworkDetailsBox";
    box.className = "details-box hidden";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-labelledby", "homeworkDetailsTitle");

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

    if (submissionsCard) {
        submissionsCard.insertAdjacentElement("afterend", box);
    } else {
        document.body.appendChild(box);
    }

    document.getElementById("closeHd").addEventListener("click", () => {
        box.classList.add("hidden");
    });

    box.addEventListener("click", event => {
        if (event.target === box) {
            box.classList.add("hidden");
        }
    });
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
                'No other student or teacher accounts are registered in this database yet. Register a second account with the Student or Teacher role, then refresh this page.' +
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

    // Normalize legacy labels so "Computer" submissions match "Computer Studies" activities.
    const normalizeSubject = value => {
        const subject = String(value || '').trim().toLowerCase().replace(/\\s+/g, ' ');
        if (subject === 'computer' || subject === 'computer studies') return 'computer studies';
        return subject.replace(/[^a-z0-9]/g, '');
    };

    // Ignore spaces and hyphens in section labels, e.g. "BSIT 2-B" and "BSIT2B".
    const normalizeClass = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

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

        const sections = ['BSIT 1-A', 'BSIT 1-B', 'BSIT 2-A', 'BSIT 2-B', 'BIT2B', 'BIT AE3', 'BIT3AE'];
        const plans = safeParse(plansKey).filter(plan =>
            String(plan.teacherEmail || '').toLowerCase() ===
            String(user.email || '').toLowerCase()
        ).flatMap(plan => String(plan.targetClass || '') === 'All Classes'
            ? sections.map(section => ({ ...plan, targetClass: section, resultPlanId: plan.id }))
            : [plan]);

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

            const unassignedCounted = new Set();
            body.innerHTML = plans.slice().reverse().map(plan => {
                const planTitle = String(plan.title || '')
                    .trim()
                    .toLowerCase();

                const planSubject = normalizeSubject(plan.subject);

                const matching = submissions.filter(submission => {
                    const sameTitle = String(submission.title || '')
                        .trim()
                        .toLowerCase() === planTitle;

                    const sameSubject = normalizeSubject(submission.subject) === planSubject;

                    const studentClass = String(
                        submission.student?.class_name ||
                        submission.student?.className ||
                        submission.student?.section ||
                        submission.student?.class ||
                        submission.class_name ||
                        submission.className ||
                        submission.section ||
                        ''
                    );
                    const normalizedStudentClass = normalizeClass(studentClass);
                    const targetClass = normalizeClass(plan.targetClass);

                    // Some older student accounts/submissions do not include a section.
                    // Count those against the activity so they are not silently lost;
                    // section-specific matching is used whenever the section is available.
                    const studentKey = String(submission.student?.id ?? submission.id);
                    const activityKey = String(plan.resultPlanId || plan.id || planTitle) + '|' + planSubject;
                    const unknownSectionCanCount = !studentClass && !unassignedCounted.has(activityKey);
                    const sameClass =
                        targetClass === 'all classes' ||
                        normalizedStudentClass === targetClass ||
                        unknownSectionCanCount;

                    return sameTitle && sameSubject && sameClass;
                });

                // If legacy records have no section, count them once for this activity
                // instead of duplicating the same student across every expanded section.
                matching.forEach(submission => {
                    const hasSection = String(submission.student?.class_name || submission.student?.className || submission.student?.section || submission.student?.class || submission.class_name || submission.className || submission.section || '').trim();
                    if (!hasSection) unassignedCounted.add(String(plan.resultPlanId || plan.id || planTitle) + '|' + planSubject);
                });

                const uniqueStudents = new Set(
                    matching.map(submission =>
                        String(submission.student?.id ?? submission.id)
                    )
                );

                const count = uniqueStudents.size;

                const resultKey = 'result-' + String(plan.resultPlanId || plan.id || plan.title) + '-' + normalizeClass(plan.targetClass);
                window.__llccResultRows = window.__llccResultRows || {};
                window.__llccResultRows[resultKey] = matching;
                return '<tr>' +
                    '<td>' + esc(plan.subject || '—') + '</td>' +
                    '<td>' + esc(plan.title || 'Untitled activity') + '</td>' +
                    '<td>' + esc(fmtDate(plan.dueDate || '') + (plan.dueTime ? ' at ' + new Date('2000-01-01T' + plan.dueTime).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}) : ' (time not set)')) + '</td>' +
                    '<td><span class="badge info">' + esc(plan.targetClass || '—') + '</span></td>' +
                    '<td><span class="badge ' + (count ? 'success' : 'warning') + '">' +
                    count + (count === 1 ? ' student' : ' students') + ' turned in</span> ' +
                    '<button type="button" class="secondary-btn" data-view-results="' + esc(resultKey) + '">View</button></td>' +
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

    body.addEventListener('click', event => {
        const button = event.target.closest('[data-view-results]');
        if (!button) return;

        // Take the teacher directly to the detailed submissions table.
        const submissionsCard = document.getElementById('teacherHomeworkSubmissionsCard');
        if (submissionsCard) {
            submissionsCard.classList.remove('hidden');
            submissionsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            submissionsCard.style.transition = 'outline-color .25s ease, box-shadow .25s ease';
            submissionsCard.style.outline = '3px solid #c4b5fd';
            submissionsCard.style.outlineOffset = '3px';
            window.setTimeout(() => {
                submissionsCard.style.outline = '';
                submissionsCard.style.outlineOffset = '';
            }, 1800);
        }

        const items = window.__llccResultRows?.[button.dataset.viewResults] || [];
        const oldDialog = document.getElementById('turnInStudentsDialog');
        if (oldDialog) oldDialog.remove();
        const dialog = document.createElement('div');
        dialog.id = 'turnInStudentsDialog';
        dialog.className = 'details-box';
        Object.assign(dialog.style, {
            position: 'fixed', inset: '0', zIndex: '99999',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', background: 'rgba(15, 23, 42, .55)',
            overflowY: 'auto'
        });
        dialog.addEventListener('click', event => {
            if (event.target === dialog) dialog.remove();
        });
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        const content = document.createElement('div');
        content.className = 'homework-details-content';
        Object.assign(content.style, {
            width: 'min(560px, 100%)', maxHeight: 'min(80vh, 720px)',
            overflowY: 'auto', margin: '0', background: 'var(--card, #fff)',
            borderRadius: '16px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,.25)'
        });
        const heading = document.createElement('h3');
        heading.textContent = 'Students who turned in';
        content.appendChild(heading);
        if (!items.length) {
            const empty = document.createElement('p');
            empty.textContent = 'No students have turned in this activity yet.';
            content.appendChild(empty);
        }
        items.forEach(item => {
            const studentButton = document.createElement('button');
            studentButton.type = 'button';
            studentButton.className = 'secondary-btn';
            studentButton.textContent = (item.student?.name || 'Student') + ' · ' + (item.status === 'Submitted' ? 'Turned in' : (item.status || 'Turned in'));
            studentButton.style.display = 'block';
            studentButton.style.margin = '8px 0';
            studentButton.addEventListener('click', () => {
                dialog.remove();
                window.viewHomework?.(item.id, null);
            });
            content.appendChild(studentButton);
        });
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'secondary-btn';
        close.textContent = 'Close';
        close.addEventListener('click', () => dialog.remove());
        content.appendChild(close);
        dialog.appendChild(content);
        document.body.appendChild(dialog);
    });

    render();
    setInterval(() => {
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        if (user?.role === 'teacher' && !document.hidden) render(user);
    }, 5000);
})();
