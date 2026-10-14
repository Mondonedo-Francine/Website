/* ===== Original inline script block 1 ===== */

/* =========================================================
   STORAGE AND DEFAULT DATA
========================================================= */

const USERS_KEY = "creative_readers_users";
const CURRENT_USER_KEY = "creative_readers_current_user";
const CUSTOM_HOMEWORK_KEY = "creative_readers_homework";
const CUSTOM_NOTICES_KEY = "creative_readers_notices";

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
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

/* =========================================================
   CREATE DEFAULT DEMO ACCOUNTS
========================================================= */

function seedDemoUsers() {
    const users = getUsers();

    if (users.length === 0) {
        users.push(
            {
                id: Date.now(),
                name: "Demo Student",
                email: "student@example.com",
                phone: "01700000000",
                password: "12345",
                role: "student"
            },
            {
                id: Date.now() + 1,
                name: "Demo Teacher",
                email: "teacher@example.com",
                phone: "01800000000",
                password: "12345",
                role: "teacher"
            },
            {
                id: Date.now() + 2,
                name: "Demo Guest",
                email: "guest@example.com",
                phone: "01900000000",
                password: "12345",
                role: "guest"
            }
        );

        saveUsers(users);
    }
}

seedDemoUsers();

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

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const role = document.getElementById("loginRole").value.trim().toLowerCase();
    const username = document.getElementById("loginUsername").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    const users = getUsers();

    const user = users.find(account => {
        const emailMatches = account.email.toLowerCase() === username;
        const phoneMatches = account.phone.toLowerCase() === username;

        return (
            (emailMatches || phoneMatches) &&
            account.password === password &&
            account.role === role
        );
    });

    if (!user) {
        showMessage(
            "loginMessage",
            "Invalid login details. Use the correct role, email/phone, and password.",
            "error"
        );
        return;
    }

    saveCurrentUser(user);
    showApplication(user);
});

/* =========================================================
   SIGNUP
========================================================= */

document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const phone = document.getElementById("signupPhone").value.trim();
    const role = document.getElementById("signupRole").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;

    if (password !== confirmPassword) {
        showMessage("signupMessage", "Passwords do not match.", "error");
        return;
    }

    const users = getUsers();

    const alreadyExists = users.some(account =>
        account.email.toLowerCase() === email ||
        account.phone === phone
    );

    if (alreadyExists) {
        showMessage(
            "signupMessage",
            "An account with this email or phone already exists.",
            "error"
        );
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        role
    };

    users.push(newUser);
    saveUsers(users);

    showMessage(
        "signupMessage",
        "Account created successfully. You can now log in.",
        "success"
    );

    document.getElementById("signupForm").reset();

    setTimeout(() => {
        signupView.classList.add("hidden");
        loginView.classList.remove("hidden");

        document.getElementById("loginRole").value = role;
        document.getElementById("loginUsername").value = email;
    }, 1000);
});

/* =========================================================
   FORGOT PASSWORD DEMO
========================================================= */

document.getElementById("forgotPassword").addEventListener("click", function(event) {
    event.preventDefault();

    const username = prompt("Enter your registered email or phone number:");

    if (!username) return;

    const users = getUsers();

    const user = users.find(account =>
        account.email.toLowerCase() === username.trim().toLowerCase() ||
        account.phone === username.trim()
    );

    if (!user) {
        alert("No account was found with that email or phone number.");
        return;
    }

    alert(
        "Demo password recovery:\n\n" +
        "Your current password is: " + user.password +
        "\n\nFor a real website, this should send a secure reset link by email."
    );
});

/* =========================================================
   SHOW APPLICATION
========================================================= */

function showApplication(user) {
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
function attendanceStorageKey(className, date) { return "llcc_attendance_" + className.replace(/[^a-z0-9]/gi, "_") + "_" + date; }
function setupTeacherAttendance(user) {
    const teacherView = document.getElementById("teacherAttendanceView");
    const studentView = document.getElementById("studentAttendanceView");
    if (!teacherView || !studentView) return;
    const isTeacher = user && user.role === "teacher";
    teacherView.classList.toggle("hidden", !isTeacher);
    studentView.classList.toggle("hidden", isTeacher);
    if (isTeacher) {
        const list = document.getElementById("attendanceClassList");
        list.innerHTML = Object.entries(teacherClasses).map(([className, students]) => `
            <button type="button" class="contact-card attendance-class-card" data-attendance-class="${className}" style="text-align:left;cursor:pointer;color:inherit;">
                <div class="contact-icon">▦</div><h3>${className}</h3>
                <p>${students.length} students<br><span style="color:var(--primary);font-weight:bold;display:inline-block;margin-top:10px;">View Attendance →</span></p>
            </button>`).join("");
        list.querySelectorAll("[data-attendance-class]").forEach(button => button.addEventListener("click", () => openAttendanceRoster(button.dataset.attendanceClass)));
        document.getElementById("teacherAttendanceDate").value = new Date().toISOString().slice(0,10);
        document.getElementById("attendanceRosterPanel").classList.add("hidden");
        list.closest(".card").classList.remove("hidden");
    }
}
function openAttendanceRoster(className) {
    selectedAttendanceClass = className;
    document.getElementById("attendanceRosterTitle").textContent = className + " — Student Attendance";
    document.getElementById("attendanceClassList").closest(".card").classList.add("hidden");
    document.getElementById("attendanceRosterPanel").classList.remove("hidden");
    renderAttendanceRoster();
}
let attendanceDirty = false;
function attendanceDraftKey(className, date) { return "llccAttendanceDraft:" + className + ":" + date; }
function attendanceHistoryKey(className) { return "llccAttendanceHistory:" + className; }
function getAttendanceRecords(className, date) {
    try { return JSON.parse(localStorage.getItem(attendanceStorageKey(className, date)) || "{}"); } catch (e) { return {}; }
}
function getAttendanceDraft(className, date) {
    try { return JSON.parse(localStorage.getItem(attendanceDraftKey(className, date)) || "null"); } catch (e) { return null; }
}
function updateAttendanceSummary() {
    const selects = [...document.querySelectorAll(".attendance-status-select")];
    const counts = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    selects.forEach(select => { if (counts[select.value] !== undefined) counts[select.value]++; });
    const total = selects.length;
    [["attendanceTotalStudents", total], ["attendancePresentCount", counts.Present], ["attendanceAbsentCount", counts.Absent], ["attendanceLateCount", counts.Late]].forEach(([id, value]) => {
        const el = document.getElementById(id); if (el) el.textContent = value;
    });
}
function renderAttendanceHistory() {
    const el = document.getElementById("attendanceHistoryList");
    if (!el || !selectedAttendanceClass) return;
    let history = [];
    try { history = JSON.parse(localStorage.getItem(attendanceHistoryKey(selectedAttendanceClass)) || "[]"); } catch (e) {}
    el.innerHTML = history.length ? history.slice(0,8).map(item =>
        '<li><strong>' + item.date + '</strong><span>' + item.savedAt + '</span></li>'
    ).join("") : '<li class="attendance-history-empty">No saved attendance history yet.</li>';
}
function renderAttendanceRoster() {
    if (!selectedAttendanceClass) return;
    const date = document.getElementById("teacherAttendanceDate").value || new Date().toISOString().slice(0,10);
    const saved = getAttendanceRecords(selectedAttendanceClass, date);
    const draft = getAttendanceDraft(selectedAttendanceClass, date);
    const records = draft || saved;
    document.getElementById("teacherAttendanceRoster").innerHTML = teacherClasses[selectedAttendanceClass].map((name, index) => {
        const id = "LLCC-" + selectedAttendanceClass.replace(/[^a-z0-9]/gi, "") + "-" + String(index+1).padStart(3,"0");
        const status = records[name] || "Present";
        return `<tr><td>${index+1}</td><td>${name}</td><td>${id}</td><td><select class="attendance-status-select status-${status.toLowerCase()}" data-student="${name}" aria-label="Attendance status for ${name}"><option ${status==='Present'?'selected':''}>Present</option><option ${status==='Absent'?'selected':''}>Absent</option><option ${status==='Late'?'selected':''}>Late</option><option ${status==='Excused'?'selected':''}>Excused</option></select></td></tr>`;
    }).join("");
    document.querySelectorAll(".attendance-status-select").forEach(select => {
        select.addEventListener("change", () => {
            select.className = "attendance-status-select status-" + select.value.toLowerCase();
            const current = {};
            document.querySelectorAll(".attendance-status-select").forEach(s => current[s.dataset.student] = s.value);
            try { localStorage.setItem(attendanceDraftKey(selectedAttendanceClass, date), JSON.stringify(current)); } catch (e) {}
            attendanceDirty = true;
            const msg = document.getElementById("attendanceSaveMessage");
            msg.textContent = "Unsaved changes — click Save Attendance to keep these changes.";
            msg.className = "contact-success attendance-unsaved"; msg.style.display = "block";
            updateAttendanceSummary();
        });
    });
    const savedMetaKey = attendanceStorageKey(selectedAttendanceClass, date) + ":meta";
    let meta = null; try { meta = JSON.parse(localStorage.getItem(savedMetaKey) || "null"); } catch (e) {}
    const message = document.getElementById("attendanceSaveMessage");
    if (draft) {
        message.textContent = "Recovered unsaved changes for " + date + ". Save to confirm them.";
        message.className = "contact-success attendance-unsaved"; message.style.display = "block";
    } else if (meta && meta.savedAt) {
        message.textContent = "Last saved " + meta.savedAt + " for " + date + ".";
        message.className = "contact-success attendance-saved"; message.style.display = "block";
    } else { message.style.display = "none"; }
    attendanceDirty = !!draft;
    updateAttendanceSummary();
    renderAttendanceHistory();
}
document.getElementById("teacherAttendanceDate").addEventListener("change", () => {
    if (attendanceDirty && !confirm("You have unsaved attendance changes. Switch dates and keep a draft for later?")) return;
    renderAttendanceRoster();
});
document.getElementById("backToAttendanceClasses").addEventListener("click", () => {
    if (attendanceDirty && !confirm("Your changes are not saved. Return to classes anyway? Your draft will be kept in this browser.")) return;
    document.getElementById("attendanceRosterPanel").classList.add("hidden");
    document.getElementById("attendanceClassList").closest(".card").classList.remove("hidden");
    selectedAttendanceClass = "";
});
document.getElementById("saveClassAttendance").addEventListener("click", () => {
    if (!selectedAttendanceClass) return;
    const date = document.getElementById("teacherAttendanceDate").value || new Date().toISOString().slice(0,10);
    const records = {};
    document.querySelectorAll(".attendance-status-select").forEach(select => records[select.dataset.student] = select.value);
    const savedAt = new Date().toLocaleString();
    try {
        localStorage.setItem(attendanceStorageKey(selectedAttendanceClass, date), JSON.stringify(records));
        localStorage.setItem(attendanceStorageKey(selectedAttendanceClass, date) + ":meta", JSON.stringify({savedAt}));
        localStorage.removeItem(attendanceDraftKey(selectedAttendanceClass, date));
        let history = JSON.parse(localStorage.getItem(attendanceHistoryKey(selectedAttendanceClass)) || "[]");
        history = [{date, savedAt}, ...history.filter(item => item.date !== date)].slice(0,20);
        localStorage.setItem(attendanceHistoryKey(selectedAttendanceClass), JSON.stringify(history));
    } catch (e) {
        alert("Could not save attendance in this browser. Please check available storage.");
        return;
    }
    attendanceDirty = false;
    const message = document.getElementById("attendanceSaveMessage");
    message.textContent = "✓ Attendance saved successfully for " + selectedAttendanceClass + " on " + date + ". Last saved: " + savedAt;
    message.className = "contact-success attendance-saved"; message.style.display = "block";
    renderAttendanceHistory();
});
window.addEventListener("beforeunload", event => {
    if (attendanceDirty) { event.preventDefault(); event.returnValue = ""; }
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
   HOMEWORK
========================================================= */

document.getElementById("addHomeworkBtn").addEventListener("click", function() {
    document.getElementById("homeworkFormCard").classList.remove("hidden");
});

document.getElementById("cancelHomeworkBtn").addEventListener("click", function() {
    document.getElementById("homeworkFormCard").classList.add("hidden");
});

document.getElementById("homeworkForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const submittingUser = getCurrentUser();
    const homeworkSubject = document.getElementById("homeworkSubject").value;
    const homeworkTitle = document.getElementById("homeworkTitle").value.trim();
    const publishedActivities = JSON.parse(localStorage.getItem("llcc_class_lesson_plans_v1") || "[]");
    const matchedActivity = publishedActivities.find(activity => {
        const sameTitle = String(activity.title || "").trim().toLowerCase() === homeworkTitle.toLowerCase();
        const sameSubject = String(activity.subject || "").trim().toLowerCase() === homeworkSubject.toLowerCase();
        const sameClass = !submittingUser?.className || activity.targetClass === "All Classes" || activity.targetClass === submittingUser.className;
        return sameTitle && sameSubject && sameClass;
    });
    const homework = {
        id: Date.now(),
        subject: homeworkSubject,
        title: homeworkTitle,
        description: document.getElementById("homeworkDescription").value,
        status: "Submitted",
        date: new Date().toLocaleDateString(),
        studentId: String(submittingUser?.id || submittingUser?.email || submittingUser?.name || "unknown-student"),
        studentName: submittingUser?.name || "Student",
        studentEmail: submittingUser?.email || "",
        className: submittingUser?.className || matchedActivity?.targetClass || "",
        activityId: matchedActivity ? String(matchedActivity.id) : ""
    };

    const savedHomework = JSON.parse(
        localStorage.getItem(CUSTOM_HOMEWORK_KEY) || "[]"
    );

    savedHomework.push(homework);
    localStorage.setItem(CUSTOM_HOMEWORK_KEY, JSON.stringify(savedHomework));

    renderCustomHomework();

    document.getElementById("homeworkForm").reset();
    document.getElementById("homeworkFormCard").classList.add("hidden");

    showToast("Homework submitted successfully.");
});

function renderCustomHomework() {
    const savedHomework = JSON.parse(
        localStorage.getItem(CUSTOM_HOMEWORK_KEY) || "[]"
    );

    const tableBody = document.getElementById("homeworkTableBody");

    savedHomework.forEach(homework => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(homework.subject)}</td>
            <td>${escapeHTML(homework.title)}</td>
            <td>${escapeHTML(homework.date)}</td>
            <td><span class="badge success">${escapeHTML(homework.status)}</span></td>
            <td>
                <button class="secondary-btn" onclick="showToast('Submission viewed')">
                    View
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
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

document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem(CURRENT_USER_KEY);

    appPage.classList.add("hidden");
    authPage.classList.remove("hidden");

    document.getElementById("loginForm").reset();
    document.getElementById("loginMessage").className = "message";
    document.getElementById("loginMessage").textContent = "";

    openPage("dashboard");
    showToast("You have been logged out.");
});

/* =========================================================
   AUTO LOGIN IF SESSION EXISTS
========================================================= */

const existingUser = getCurrentUser();

if (existingUser) {
    showApplication(existingUser);
}

;

/* ===== Original inline script block 2 ===== */

(function(){
  const initialsOf = n => (n||'CR').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
  function current(){return typeof getCurrentUser==='function'?getCurrentUser():JSON.parse(localStorage.getItem('currentUser')||'null')}
  function persistUser(u){
    if(typeof getUsers==='function'&&typeof saveUsers==='function'){
      const users=getUsers(); const i=users.findIndex(x=>x.email===u.email||x.id===u.id); if(i>=0) users[i]=u; else users.push(u); saveUsers(users);
    }
    if(typeof saveCurrentUser==='function') saveCurrentUser(u); else localStorage.setItem('currentUser',JSON.stringify(u));
    if(typeof updateUserInterface==='function') updateUserInterface(u);
  }
  function setAvatar(el,u){if(!el)return; const pic=u&&u.profilePicture; el.innerHTML=pic?`<img src="${pic}" alt="Profile picture">`:initialsOf(u&&u.name);}
  function addProfileControls(){
    const avatar=document.getElementById('profileAvatar'); if(!avatar)return;
    if(!document.getElementById('profilePictureInput')){
      const box=document.createElement('div'); box.className='profile-picture-actions'; box.innerHTML=`<label for="profilePictureInput" class="secondary-btn">📷 Change Picture</label><input id="profilePictureInput" type="file" accept="image/*"><button type="button" class="danger-btn" id="removeProfilePictureBtn">Remove</button>`; avatar.parentElement.appendChild(box);
      document.getElementById('profilePictureInput').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;if(f.size>5*1024*1024){alert('Please choose an image smaller than 5MB.');return}const r=new FileReader();r.onload=()=>{const u=current()||{};u.profilePicture=r.result;persistUser(u);setAvatar(document.getElementById('profileAvatar'),u);setAvatar(document.getElementById('topAvatar'),u)};r.readAsDataURL(f)});
      document.getElementById('removeProfilePictureBtn').addEventListener('click',()=>{const u=current()||{};delete u.profilePicture;persistUser(u);setAvatar(document.getElementById('profileAvatar'),u);setAvatar(document.getElementById('topAvatar'),u)});
    }
  }
  const oldUpdate=window.updateUserInterface;
  window.updateUserInterface=function(u){if(oldUpdate)oldUpdate(u);setAvatar(document.getElementById('profileAvatar'),u);setAvatar(document.getElementById('topAvatar'),u);addProfileControls()};
  function addHomeworkDetails(){
    const table=document.querySelector('#homework table, table'); if(!table||document.getElementById('homeworkDetailsBox'))return;
    const box=document.createElement('div');box.id='homeworkDetailsBox';box.className='details-box hidden';box.innerHTML='<h3 id="homeworkDetailsTitle">Homework Details</h3><p><b>Subject:</b> <span id="hdSubject"></span></p><p><b>Date:</b> <span id="hdDate"></span></p><p><b>Status:</b> <span id="hdStatus"></span></p><p><b>Description:</b></p><p id="hdDescription"></p><button type="button" class="secondary-btn" id="closeHd">Close</button> <button type="button" class="danger-btn" id="deleteHd">Delete Homework</button>'; table.parentElement.appendChild(box);
  }
  window.viewHomework=function(id){const list=JSON.parse(localStorage.getItem(typeof CUSTOM_HOMEWORK_KEY!=='undefined'?CUSTOM_HOMEWORK_KEY:'customHomework')||'[]');const h=list.find(x=>String(x.id)===String(id));if(!h)return;addHomeworkDetails();document.getElementById('homeworkDetailsBox').classList.remove('hidden');document.getElementById('homeworkDetailsTitle').textContent=h.title||'Homework Details';document.getElementById('hdSubject').textContent=h.subject||'';document.getElementById('hdDate').textContent=h.date||'';document.getElementById('hdStatus').textContent=h.status||'';document.getElementById('hdDescription').textContent=h.description||'No description.';document.getElementById('deleteHd').onclick=()=>{if(confirm('Delete this homework?')){const next=list.filter(x=>String(x.id)!==String(id));localStorage.setItem(typeof CUSTOM_HOMEWORK_KEY!=='undefined'?CUSTOM_HOMEWORK_KEY:'customHomework',JSON.stringify(next));location.reload()}}};
  function makeHomeworkButtons(){document.querySelectorAll('#homeworkPage table tbody tr').forEach((tr,i)=>{if(tr.querySelector('.view-homework-btn'))return;const cells=tr.querySelectorAll('td');if(!cells.length)return;const id=tr.dataset.id||cells[0].dataset.id;if(id||i>=0){const b=document.createElement('button');b.className='secondary-btn view-homework-btn';b.textContent='View';b.onclick=()=>{const list=JSON.parse(localStorage.getItem('customHomework')||'[]');viewHomework((id||list[i]?.id||i))};const td=document.createElement('td');td.appendChild(b);tr.appendChild(td)}})}
  function addSolutions(){
    const page=[...document.querySelectorAll('.page')].find(x=>/solutions/i.test(x.innerText));if(!page||page.querySelector('.solution-modal'))return;
    const modal=document.createElement('div');modal.className='solution-modal hidden';modal.innerHTML='<div class="modal-card"><h2 id="solutionTitle"></h2><div id="solutionBody"></div><button class="secondary-btn" id="closeSolution">Close</button></div>';page.appendChild(modal);const data={Mathematics:['Review the lesson examples, practice the assigned equations, and check each answer carefully.','1. Write the problem. 2. Show your solution. 3. Simplify the final answer.'],English:['Identify the main idea, supporting details, vocabulary, and grammar patterns in the passage.','Use complete sentences and quote details from the text when explaining your answer.'],Science:['Review the key concepts, definitions, processes, and real-world examples from the lesson.','Explain the process in your own words and include labeled diagrams when needed.']};window.openSolution=function(subject){document.getElementById('solutionTitle').textContent=subject+' Solutions';document.getElementById('solutionBody').innerHTML='<p>'+data[subject][0]+'</p><p><b>Suggested solution guide:</b> '+data[subject][1]+'</p>';modal.classList.remove('hidden')};document.getElementById('closeSolution').onclick=()=>modal.classList.add('hidden');page.querySelectorAll('.solution-open-btn').forEach(b=>{const subject=b.closest('.solution-card')?.querySelector('h2')?.textContent.replace(' Solutions','')||'Mathematics';b.onclick=()=>openSolution(subject)})
  }
  function initTeacherMessages(){
    const list=document.getElementById('teacherList'), header=document.getElementById('chatHeader'), messages=document.getElementById('chatMessages'), form=document.getElementById('chatForm'), input=document.getElementById('chatInput'), send=document.getElementById('sendChatBtn');
    const search=document.getElementById('messageSearch');
    if(!list||!header||!messages||!form)return;
    let current=typeof getCurrentUser==='function'?getCurrentUser():null;
    let currentId=String(current?.id ?? current?.email ?? '');
    let currentRole=String(current?.role||'student').toLowerCase();
    const storageKey='llcc_private_direct_messages_v2';
    const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const pairKey=(a,b)=>[String(a),String(b)].sort().join('::');
    const getChats=()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch(e){return {}}};
    const getId=u=>String(u?.id ?? u?.email ?? '');
    const getPeople=()=>{
      const accounts=(typeof getUsers==='function'?getUsers():[])
        .filter(u=>getId(u)!==currentId && ['student','teacher'].includes(String(u.role||'').toLowerCase()))
        .map(u=>({id:getId(u),name:u.name||u.email||'User',subject:String(u.role||'').toLowerCase()==='teacher'?(u.subject||'Teacher'):'Student',initials:getInitials(u.name||u.email||'User'),role:String(u.role||'').toLowerCase(),email:u.email}));
      // Show every other registered account. Each recipient gets a separate thread.
      return accounts;
    };
    let people=getPeople(), selected=null;
    function renderMessages(){
      const items=selected?(getChats()[pairKey(currentId,selected.id)]||[]):[];
      messages.innerHTML='';
      if(!selected||!items.length){messages.innerHTML='<div class="chat-empty"><div>✉</div><h3>'+(selected?'Start a private conversation':'Your conversations')+'</h3><p>'+(selected?'Send a message to '+esc(selected.name)+'. They can sign in to their own account and reply in this same conversation.':'Choose any registered user on the left to start a private conversation.')+'</p></div>';return;}
      items.forEach(m=>{const bubble=document.createElement('div');bubble.className='chat-bubble '+(String(m.senderId)===currentId?'sent':'received');bubble.innerHTML=esc(m.text)+'<span class="chat-time">'+(String(m.senderId)===currentId?'You':'')+(m.senderName?' · '+esc(m.senderName):'')+' · '+esc(m.time||'')+'</span>';messages.appendChild(bubble)});
      messages.scrollTop=messages.scrollHeight;
    }
    function renderList(){
      people=getPeople();
      const q=(search?.value||'').trim().toLowerCase();
      const chats=getChats();
      const visible=people.filter(p=>{
        const thread=chats[pairKey(currentId,p.id)]||[];
        const last=thread[thread.length-1];
        return (p.name+' '+p.subject+' '+p.role+' '+(last?.text||'')).toLowerCase().includes(q);
      }).sort((a,b)=>{
        const at=(getChats()[pairKey(currentId,a.id)]||[]).slice(-1)[0]?.timestamp||0;
        const bt=(getChats()[pairKey(currentId,b.id)]||[]).slice(-1)[0]?.timestamp||0;
        return bt-at;
      });
      list.innerHTML=visible.length?visible.map(p=>{
        const thread=chats[pairKey(currentId,p.id)]||[],last=thread[thread.length-1];
        return '<button type="button" class="teacher-option '+(selected&&selected.id===p.id?'active':'')+'" data-person="'+esc(p.id)+'"><span class="teacher-avatar">'+esc(p.initials)+'</span><span><strong>'+esc(p.name)+'</strong><small>'+esc(p.subject)+' · '+(last?esc(last.text):'Private message')+'</small></span></button>';
      }).join(''):'<div class="empty-state" style="padding:22px">No other registered users found. Create another student or teacher account to start a conversation.</div>';
      list.querySelectorAll('[data-person]').forEach(b=>b.addEventListener('click',()=>choosePerson(people.find(p=>p.id===b.dataset.person))));
    }
    function refreshForCurrentUser(){
      current=typeof getCurrentUser==='function'?getCurrentUser():null;
      currentId=String(current?.id ?? current?.email ?? '');
      currentRole=String(current?.role||'student').toLowerCase();
      selected=null;
      input.value='';
      input.disabled=!current;
      send.disabled=!current;
      header.innerHTML='<div class="teacher-avatar">✉</div><div><h3>New conversation</h3><p>Select a registered user to message privately.</p></div>';
      renderList();
      if(!current){messages.innerHTML='<div class="chat-empty"><div>✉</div><h3>Sign in to message</h3><p>Log in to start a private conversation.</p></div>';input.disabled=true;send.disabled=true;return;}
      const first=people.find(p=>(getChats()[pairKey(currentId,p.id)]||[]).length)||people[0];
      if(first)choosePerson(first);
      else renderMessages();
    }
    window.refreshPortalMessaging=refreshForCurrentUser;
    function choosePerson(p){
      if(!p)return; selected=p;
      header.innerHTML='<div class="teacher-avatar">'+esc(p.initials)+'</div><div><h3>'+esc(p.name)+'</h3><p>'+esc(p.subject)+' · <span style="color:#16804a">🔒 Private direct message</span></p></div>';
      input.disabled=false;send.disabled=false;input.placeholder='Message '+p.name+'...';renderList();renderMessages();
    }
    if(search)search.addEventListener('input',renderList);
    form.addEventListener('submit',e=>{
      e.preventDefault();const text=input.value.trim();if(!text||!selected)return;
      const chats=getChats(),key=pairKey(currentId,selected.id);chats[key]=chats[key]||[];
      chats[key].push({senderId:currentId,recipientId:selected.id,senderName:current?.name||current?.email||'Current user',text,time:new Date().toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}),timestamp:Date.now()});
      localStorage.setItem(storageKey,JSON.stringify(chats));input.value='';renderList();renderMessages();input.focus();
    });
    // Refresh messages when the account changes in another tab/window of this browser.
    window.addEventListener('storage',e=>{if(e.key===storageKey){renderList();renderMessages()}});
    refreshForCurrentUser();
  }
  document.addEventListener('DOMContentLoaded',()=>{addProfileControls();addHomeworkDetails();makeHomeworkButtons();addSolutions();initTeacherMessages();const c=document.getElementById('closeHd');if(c)c.onclick=()=>document.getElementById('homeworkDetailsBox').classList.add('hidden')});

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
    const plans=getPlans(); plans.push({id:Date.now(),title:document.getElementById('lessonTitle').value.trim(),subject:document.getElementById('lessonSubject').value,targetClass:document.getElementById('lessonClass').value,lessonDate:document.getElementById('lessonDate').value,dueDate:document.getElementById('lessonDueDate').value,description:document.getElementById('lessonDescription').value.trim(),fileName:file?file.name:'',fileData,teacherEmail:user.email||'',teacherName:user.name||'Teacher',sentAt:new Date().toLocaleString()});
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
(function initTeacherActivityResults(){
  const plansKey = 'llcc_class_lesson_plans_v1';
  const submissionsKey = 'creative_readers_homework';
  const studentCard = document.getElementById('studentResultsCard');
  const teacherCard = document.getElementById('teacherResultsCard');
  const body = document.getElementById('teacherResultsTableBody');
  const description = document.getElementById('resultsPageDescription');
  if (!studentCard || !teacherCard || !body) return;

  const safeParse = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; } };
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const fmtDate = value => {
    if (!value) return 'Not set';
    const parts = String(value).split('-');
    if (parts.length === 3) {
      const date = new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]));
      if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'});
    }
    return String(value);
  };
  function render(user = null) {
    user = user || (typeof getCurrentUser === 'function' ? getCurrentUser() : null);
    const isTeacher = !!user && user.role === 'teacher';
    studentCard.classList.toggle('hidden', isTeacher);
    teacherCard.classList.toggle('hidden', !isTeacher);
    if (description) description.textContent = isTeacher
      ? 'Review activities sent to your classes and track student submissions.'
      : 'Check your examination results and grades.';
    if (!isTeacher) return;

    const allPlans = safeParse(plansKey);
    const plans = allPlans.filter(plan => String(plan.teacherEmail || '').toLowerCase() === String(user.email || '').toLowerCase());
    const submissions = safeParse(submissionsKey);
    if (!plans.length) {
      body.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">▤</div><h3>No activities sent yet</h3><p>Activities you send from Solutions will appear here with their due dates and submission counts.</p></div></td></tr>';
      return;
    }
    body.innerHTML = plans.slice().reverse().map(plan => {
      const matching = submissions.filter(sub => {
        const sameActivityId = sub.activityId && String(sub.activityId) === String(plan.id);
        const sameLegacyTitle = !sub.activityId && String(sub.title || '').trim().toLowerCase() === String(plan.title || '').trim().toLowerCase() && String(sub.subject || '').trim().toLowerCase() === String(plan.subject || '').trim().toLowerCase();
        const sameClass = !sub.className || plan.targetClass === 'All Classes' || sub.className === plan.targetClass;
        return (sameActivityId || sameLegacyTitle) && sameClass;
      });
      const uniqueStudents = new Set(matching.map(sub => String(sub.studentId || sub.studentEmail || sub.studentName || sub.id)));
      const count = uniqueStudents.size;
      return '<tr>' +
        '<td>' + esc(plan.subject || '—') + '</td>' +
        '<td>' + esc(plan.title || 'Untitled activity') + '</td>' +
        '<td>' + esc(fmtDate(plan.dueDate || '')) + '</td>' +
        '<td><span class="badge info">' + esc(plan.targetClass || '—') + '</span></td>' +
        '<td><span class="badge ' + (count ? 'success' : 'warning') + '">' + count + (count === 1 ? ' student' : ' students') + ' turned in</span></td>' +
        '</tr>';
    }).join('');
  }

  // Called after login/profile updates and when another tab saves activity or submission data.
  const originalUpdateUserInterface = window.updateUserInterface;
  if (typeof originalUpdateUserInterface === 'function' && !originalUpdateUserInterface.__resultsWrapped) {
    const wrapped = function(user) { originalUpdateUserInterface(user); render(user); };
    wrapped.__resultsWrapped = true;
    window.updateUserInterface = wrapped;
  }
  window.addEventListener('storage', event => {
    if (!event.key || event.key === plansKey || event.key === submissionsKey) render();
  });
  document.querySelectorAll('.nav-item[data-page="results"]').forEach(button => button.addEventListener('click', () => render()));
  render();
})();
