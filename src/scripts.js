// ===== CONFIGURATION =====
let musicPageInitialized = false;
let currentMusicSource = 'youtube';
let activeProfileId = null;
const DEFAULT_MUSIC_SOURCES = {
    youtube: {
        src: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&rel=0&modestbranding=1',
        hint: 'Now playing YouTube lo-fi stream.',
        mode: 'frame'
    },
    youtubeChillGang: {
        src: 'https://www.youtube-nocookie.com/embed/5yx6BWlEVcY?autoplay=1&rel=0&modestbranding=1',
        hint: 'Now playing YouTube Chill Gang stream.',
        mode: 'frame'
    },
    soundcloud: {
        src: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/forss/flickermood&auto_play=true',
        hint: 'Now playing SoundCloud.',
        mode: 'frame'
    },
    radio9800: {
        src: 'https://www.5fm.co.za/5fm/',
        hint: 'Now playing 5FM (South Africa).',
        mode: 'frame'
    }
};
let currentCalendarDate = new Date();
let currentFilter = 'all';
let reminderCheckInterval;
let currentReminderTask = null;

function isMobileView() {
    return window.matchMedia('(max-width: 768px)').matches;
}

function closeMobileSidebar() {
    document.querySelector('.sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebarBackdrop')?.classList.remove('active');
}

function currentPageName() {
    const active = document.querySelector('.page.active');
    return active?.id?.replace('-page', '') || 'home';
}

function setMusicDockVisibility(showInMusicPage) {
    const dock = document.getElementById('musicDock');
    if (!dock) return;

    const shouldShow = isMobileView() ? showInMusicPage : true;
    dock.style.display = shouldShow ? 'block' : 'none';
    document.body.classList.toggle('mobile-music-open', isMobileView() && shouldShow);
}

// ===== CONSTANTS =====
const CATEGORIES = {
    work: '💼 Work',
    personal: '👤 Personal',
    health: '💪 Health'
};

const PRIORITIES = {
    high: '🔴 High',
    medium: '🟡 Medium',
    low: '🟢 Low'
};

// ===== INITIALIZATION =====
function initApp() {
    checkThemeMode();
    setupPageNavigation();
    setupEventListeners();
    closeMobileSidebar();
    setMusicDockVisibility(false);
    updateDate();
    renderCalendar();
    startReminderCheck();
    // Profile check — show chooser if no active profile
    const savedProfileId = localStorage.getItem('activeProfile');
    if (savedProfileId) {
        activeProfileId = savedProfileId;
        updateSidebarProfile();
        loadTasks();
        updateStreakDisplay();
        updateAllAnalytics();
    } else {
        showProfileChooser();
    }
}

document.addEventListener('DOMContentLoaded', initApp);

// ===== THEME MODE =====
function checkThemeMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    document.getElementById('themeToggle').textContent = isDarkMode ? '☀️' : '🌙';
    playSound();
}

// ===== PAGE NAVIGATION =====
function setupPageNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);

            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Settings modal
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('exportBtn').addEventListener('click', exportTasksToCSV);

    // Profile
    document.getElementById('switchProfileBtn').addEventListener('click', showProfileChooser);
    document.getElementById('createProfileBtn').addEventListener('click', createProfile);
    document.getElementById('newProfileName').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') createProfile();
    });

    // Mobile sidebar
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('mobile-open');
        document.getElementById('sidebarBackdrop').classList.toggle('active');
    });
    document.getElementById('sidebarBackdrop').addEventListener('click', closeMobileSidebar);
    // Close sidebar on nav item tap (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            closeMobileSidebar();
        });
    });

    window.addEventListener('resize', () => {
        setMusicDockVisibility(currentPageName() === 'music');
        if (!isMobileView()) {
            closeMobileSidebar();
        }
    });

    // Modal close
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });
}

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName + '-page').classList.add('active');

    setMusicDockVisibility(pageName === 'music');

    if (pageName === 'calendar') {
        renderCalendar();
    } else if (pageName === 'analytics') {
        updateAllAnalytics();
    } else if (pageName === 'music') {
        initMusic();
    } else if (pageName === 'tasks') {
        loadAllTasksPage();
    }
}

// ===== DATE FUNCTIONS =====
function updateDate() {
    const dateElement = document.getElementById('date');
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    dateElement.textContent = today;
}

// ===== TASK MANAGEMENT =====
function setupEventListeners() {
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskInput = document.getElementById('taskInput');

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadAllTasksPage();
            playSound();
        });
    });
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const categorySelect = document.getElementById('categorySelect');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');

    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        date: new Date().toISOString().split('T')[0],
        category: categorySelect.value,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        reminderSet: false
    };

    let tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);

    taskInput.value = '';
    dueDateInput.value = '';
    loadTasks();
    renderCalendar();
    updateAllAnalytics();
    playSound();
}

function loadTasks() {
    const tasks = getTasks();
    const tasksList = document.getElementById('tasks-list');

    tasksList.innerHTML = '';

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    if (todayTasks.length === 0) {
        tasksList.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No tasks for today. Great job! 🎉</p>';
        return;
    }

    todayTasks.forEach(task => {
        const taskCard = createTaskElement(task);
        tasksList.appendChild(taskCard);
    });

    updateTaskStats();
}

function createTaskElement(task) {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card priority-${task.priority}`;
    if (task.completed) taskCard.classList.add('completed');
    taskCard.dataset.id = task.id;

    const dueDate = new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    taskCard.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="task-content">
            <h4>${escapeHtml(task.text)}</h4>
            <div class="task-meta">
                <span class="task-category">${CATEGORIES[task.category]}</span>
                <span class="task-priority">${PRIORITIES[task.priority]}</span>
                <span>📅 ${dueDate}</span>
            </div>
        </div>
        <button class="delete-btn" title="Delete task">✕</button>
    `;

    const checkbox = taskCard.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

    const deleteBtn = taskCard.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return taskCard;
}

function toggleTask(id, completed) {
    let tasks = getTasks();
    tasks = tasks.map(task => 
        task.id === id ? { ...task, completed, completedAt: completed ? new Date().toISOString() : null } : task
    );
    saveTasks(tasks);
    loadTasks();
    renderCalendar();
    updateAllAnalytics();
    checkStreak();
    playSound();
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        let tasks = getTasks();
        tasks = tasks.filter(task => task.id !== id);
        saveTasks(tasks);
        loadTasks();
        renderCalendar();
        updateAllAnalytics();
        playSound();
    }
}

function updateTaskStats() {
    const tasks = getTasks();
    const today = new Date().toISOString().split('T')[0];

    const todayTasks = tasks.filter(t => t.date === today);
    const completedToday = todayTasks.filter(t => t.completed).length;
    const priorityTasks = todayTasks.filter(t => t.priority === 'high').length;

    document.getElementById('todayCount').textContent = todayTasks.length;
    document.getElementById('completedCount').textContent = completedToday;
    document.getElementById('priorityCount').textContent = priorityTasks;
    document.getElementById('task-count').textContent = `${todayTasks.length} tasks today`;
}

function getTasks() {
    if (!activeProfileId) return [];
    const raw = localStorage.getItem('tasks_' + activeProfileId);
    return raw ? JSON.parse(raw) : [];
}

function saveTasks(tasks) {
    if (!activeProfileId) return;
    localStorage.setItem('tasks_' + activeProfileId, JSON.stringify(tasks));
}

// ===== CALENDAR =====
function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';

    const tasks = getTasks();
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    const dayStats = {};
    const dayTasksMap = {};

    tasks.forEach(task => {
        const dayKey = task.dueDate || task.date;
        if (!dayKey || !dayKey.startsWith(monthPrefix)) {
            return;
        }

        if (!dayStats[dayKey]) {
            dayStats[dayKey] = { total: 0, done: 0 };
            dayTasksMap[dayKey] = [];
        }

        dayStats[dayKey].total += 1;
        if (task.completed) {
            dayStats[dayKey].done += 1;
        }

        dayTasksMap[dayKey].push(task);
    });

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(day);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const stats = dayStats[dateStr] || { total: 0, done: 0 };
        const dayTasks = dayTasksMap[dateStr] || [];
        const hasTasksOnDay = stats.total > 0;

        dayElement.innerHTML = `<span class="calendar-day-number">${day}</span>`;

        if (hasTasksOnDay) {
            const taskList = document.createElement('div');
            taskList.className = 'calendar-day-task-list';

            dayTasks.slice(0, 8).forEach(task => {
                const taskItem = document.createElement('span');
                taskItem.className = task.completed
                    ? 'calendar-day-task-item task-chip-done'
                    : 'calendar-day-task-item task-chip-pending';
                taskItem.textContent = task.completed ? `✓ ${task.text}` : task.text;
                taskItem.title = task.text;
                taskItem.addEventListener('click', (event) => {
                    event.stopPropagation();
                    currentCalendarDate = new Date(year, month, day);
                    renderCalendar();
                    displaySelectedDateTasks(dateStr, task.id);
                });
                taskList.appendChild(taskItem);
            });

            if (dayTasks.length > 8) {
                const moreItem = document.createElement('span');
                moreItem.className = 'calendar-day-task-more';
                moreItem.textContent = `+${dayTasks.length - 8} more`;
                taskList.appendChild(moreItem);
            }

            dayElement.appendChild(taskList);

            const metrics = document.createElement('div');
            metrics.className = 'calendar-day-metrics';

            const done = document.createElement('span');
            done.className = 'calendar-day-done';
            done.textContent = `${stats.done} done`;

            const total = document.createElement('span');
            total.className = 'calendar-day-total';
            total.textContent = `${stats.total} total`;

            if (stats.done === 0) {
                dayElement.classList.add('none-done');
            } else if (stats.done < stats.total) {
                dayElement.classList.add('partial-done');
            } else {
                dayElement.classList.add('all-done');
            }

            metrics.appendChild(done);
            metrics.appendChild(total);
            dayElement.appendChild(metrics);
        }

        if (hasTasksOnDay) {
            dayElement.classList.add('has-tasks');
        }

        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }

        dayElement.addEventListener('click', () => {
            currentCalendarDate = new Date(year, month, day);
            renderCalendar();
            displaySelectedDateTasks(dateStr);
        });

        calendarDays.appendChild(dayElement);
    }

    // Next month days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = day;
        calendarDays.appendChild(dayElement);
    }

    // Navigation
    document.getElementById('prevMonth').onclick = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    };

    document.getElementById('nextMonth').onclick = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    };

    // Display selected date's tasks
    const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentCalendarDate.getDate()).padStart(2, '0')}`;
    displaySelectedDateTasks(selectedDateStr);
}

function displaySelectedDateTasks(dateStr, focusTaskId = null) {
    const tasks = getTasks();
    const tasksOnDate = tasks.filter(t => t.dueDate === dateStr);
    const selectedDateTasksList = document.getElementById('selected-date-tasks-list');
    const selectedDateTitle = document.getElementById('selectedDateTitle');

    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    selectedDateTitle.textContent = `Tasks for ${dateFormatted}`;

    selectedDateTasksList.innerHTML = '';

    if (tasksOnDate.length === 0) {
        selectedDateTasksList.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No tasks scheduled for this date.</p>';
        return;
    }

    tasksOnDate.forEach(task => {
        const taskCard = createTaskElement(task);
        selectedDateTasksList.appendChild(taskCard);
    });

    if (focusTaskId !== null) {
        const target = selectedDateTasksList.querySelector(`.task-card[data-id="${focusTaskId}"]`);
        if (target) {
            target.classList.add('task-card-focus');
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => target.classList.remove('task-card-focus'), 1600);
        }
    }
}

// ===== ANALYTICS =====
function updateAllAnalytics() {
    const tasks = getTasks();
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Overview
    document.getElementById('totalTasksAnalytics').textContent = total;
    document.getElementById('completedTasksAnalytics').textContent = completed;
    document.getElementById('completionRateAnalytics').textContent = rate + '%';
    document.getElementById('streakAnalytics').textContent = getStreak() + ' 🔥';

    // Category breakdown
    const workTasks = tasks.filter(t => t.category === 'work').length;
    const personalTasks = tasks.filter(t => t.category === 'personal').length;
    const healthTasks = tasks.filter(t => t.category === 'health').length;
    const maxCategoryTasks = Math.max(workTasks, personalTasks, healthTasks) || 1;

    document.getElementById('workCount').textContent = workTasks;
    document.getElementById('personalCount').textContent = personalTasks;
    document.getElementById('healthCount').textContent = healthTasks;

    document.getElementById('workBar').style.width = (workTasks / maxCategoryTasks) * 100 + '%';
    document.getElementById('personalBar').style.width = (personalTasks / maxCategoryTasks) * 100 + '%';
    document.getElementById('healthBar').style.width = (healthTasks / maxCategoryTasks) * 100 + '%';

    // Priority breakdown
    document.getElementById('highPriorityCount').textContent = tasks.filter(t => t.priority === 'high').length;
    document.getElementById('mediumPriorityCount').textContent = tasks.filter(t => t.priority === 'medium').length;
    document.getElementById('lowPriorityCount').textContent = tasks.filter(t => t.priority === 'low').length;

    // Weekly chart
    updateWeeklyChart(tasks);
}

function updateWeeklyChart(tasks) {
    const weeklyChart = document.getElementById('weeklyChart');
    weeklyChart.innerHTML = '';

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (today.getDay() - 1 - i));
        const dateStr = date.toISOString().split('T')[0];

        const dayTasks = tasks.filter(t => t.date === dateStr);
        const completedDayTasks = dayTasks.filter(t => t.completed).length;

        const chartBar = document.createElement('div');
        chartBar.className = 'chart-bar';

        const height = dayTasks.length === 0 ? 10 : (completedDayTasks / dayTasks.length) * 100;

        chartBar.innerHTML = `
            <div class="bar" style="height: ${Math.max(height * 1.5, 20)}px;"></div>
            <span class="bar-label">${dayNames[i]}</span>
            <span class="bar-value">${completedDayTasks}/${dayTasks.length}</span>
        `;

        weeklyChart.appendChild(chartBar);
    }
}

function loadAllTasksPage() {
    const tasks = getTasks();
    const allTasksContainer = document.getElementById('all-tasks-container');

    allTasksContainer.innerHTML = '';

    let filteredTasks = tasks;

    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (currentFilter !== 'all') {
        filteredTasks = tasks.filter(t => t.category === currentFilter);
    }

    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filteredTasks.length === 0) {
        allTasksContainer.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No tasks found.</p>';
        return;
    }

    filteredTasks.forEach(task => {
        const taskCard = createTaskElement(task);
        allTasksContainer.appendChild(taskCard);
    });
}

// ===== STREAK MANAGEMENT =====
function checkStreak() {
    if (!activeProfileId) return;
    const tasks = getTasks();
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.date === today);

    if (todayTasks.length > 0 && todayTasks.every(t => t.completed)) {
        const streakKey = 'streak_' + activeProfileId;
        const streakDateKey = 'streakDate_' + activeProfileId;
        let streak = parseInt(localStorage.getItem(streakKey)) || 0;
        const lastStreakDate = localStorage.getItem(streakDateKey);

        if (lastStreakDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        streak = lastStreakDate === yesterdayStr ? streak + 1 : 1;
        localStorage.setItem(streakKey, streak);
        localStorage.setItem(streakDateKey, today);
        updateStreakDisplay();
    }
}

function getStreak() {
    if (!activeProfileId) return 0;
    return parseInt(localStorage.getItem('streak_' + activeProfileId)) || 0;
}

function updateStreakDisplay() {
    const streak = getStreak();
    const el = document.getElementById('streakCounter');
    if (el) el.textContent = `🔥 ${streak} day streak`;
}

// ===== REMINDERS =====
function startReminderCheck() {
    updateStreakDisplay();
    reminderCheckInterval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately
}

function checkReminders() {
    const tasks = getTasks();
    const now = new Date();
    const notificationsEnabled = localStorage.getItem('notifications') !== 'false';

    tasks.forEach(task => {
        if (task.completed || task.reminderSet) return;

        const taskDueDate = new Date(task.dueDate);
        const timeDiff = taskDueDate - now;

        // Remind 30 minutes before
        if (timeDiff > 0 && timeDiff < 31 * 60 * 1000) {
            if (notificationsEnabled) {
                showReminderModal(task);
                task.reminderSet = true;
                saveTasks(tasks);
            }
        }
    });
}

function showReminderModal(task) {
    currentReminderTask = task;
    document.getElementById('reminderText').textContent = `You have a task due soon: "${task.text}"`;
    document.getElementById('reminderModal').classList.remove('hidden');
    playSound();

    // Browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Task Reminder', {
            body: `You have a task due: ${task.text}`,
            icon: '📋'
        });
    }
}

function closeReminderModal() {
    document.getElementById('reminderModal').classList.add('hidden');
    currentReminderTask = null;
}

function completeReminderTask() {
    if (currentReminderTask) {
        toggleTask(currentReminderTask.id, true);
        closeReminderModal();
    }
}

function snoozeReminder() {
    closeReminderModal();
    setTimeout(() => {
        if (currentReminderTask) {
            showReminderModal(currentReminderTask);
        }
    }, 5 * 60 * 1000); // Snooze for 5 minutes
}

// ===== EXPORT TO CSV =====
function exportTasksToCSV() {
    const tasks = getTasks();

    if (tasks.length === 0) {
        alert('No tasks to export!');
        return;
    }

    let csv = 'Task,Category,Priority,Due Date,Status,Created Date\n';

    tasks.forEach(task => {
        const row = [
            `"${task.text.replace(/"/g, '""')}"`,
            CATEGORIES[task.category],
            PRIORITIES[task.priority],
            task.dueDate,
            task.completed ? 'Completed' : 'Pending',
            new Date(task.createdAt).toLocaleDateString()
        ].join(',');
        csv += row + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    playSound();
    alert('Tasks exported successfully! 📥');
}

// ===== MUSIC HUB =====
function initMusic() {
    updateMusicLabels();

    if (musicPageInitialized) {
        return;
    }

    document.getElementById('youtubeBtn').addEventListener('click', () => {
        setMusicSource('youtube');
    });

    document.getElementById('youtubeChillGangBtn').addEventListener('click', () => {
        setMusicSource('youtubeChillGang');
    });

    document.getElementById('soundcloudBtn').addEventListener('click', () => {
        setMusicSource('soundcloud');
    });

    document.getElementById('radio9800Btn').addEventListener('click', () => {
        setMusicSource('radio9800');
    });

    document.getElementById('loadYoutubeBtn').addEventListener('click', loadCustomMusicLink);
    document.getElementById('youtubeCustomInput').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            loadCustomMusicLink();
        }
    });

    document.getElementById('saveYoutubeBtn').addEventListener('click', () => saveCustomSource('youtube'));
    document.getElementById('saveYoutubeChillGangBtn').addEventListener('click', () => saveCustomSource('youtubeChillGang'));
    document.getElementById('saveSoundcloudBtn').addEventListener('click', () => saveCustomSource('soundcloud'));
    document.getElementById('saveRadio9800Btn').addEventListener('click', () => saveCustomSource('radio9800'));

    updateMusicInputState();
    musicPageInitialized = true;
}

function setMusicSource(provider) {
    const frame = document.getElementById('musicFrame');
    const audio = document.getElementById('musicAudio');
    const hint = document.getElementById('musicHint');

    const sources = getMusicSources();

    const selected = sources[provider] || sources.youtube;
    currentMusicSource = provider in sources ? provider : 'youtube';

    if (selected.mode === 'audio') {
        frame.style.display = 'none';
        audio.style.display = 'block';
        audio.src = selected.src;
        audio.play().catch(() => {
            // If autoplay is blocked, user can press play in native controls.
        });
    } else {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        audio.style.display = 'none';

        frame.style.display = 'block';
        frame.src = selected.src;
    }

    hint.textContent = selected.hint;
    updateMusicLabels();
    updateMusicInputState();
}

function loadCustomMusicLink() {
    const input = document.getElementById('youtubeCustomInput');
    const value = input.value.trim();

    if (!value) {
        alert('Paste a link first.');
        return;
    }

    const frame = document.getElementById('musicFrame');
    const audio = document.getElementById('musicAudio');
    const hint = document.getElementById('musicHint');

    if (currentMusicSource === 'youtube' || currentMusicSource === 'youtubeChillGang') {
        const embedUrl = toYouTubeEmbedUrl(value);
        if (!embedUrl) {
            alert('Invalid YouTube link. Use a youtube.com, youtu.be, or music.youtube.com URL.');
            return;
        }

        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        audio.style.display = 'none';

        frame.style.display = 'block';
        frame.src = embedUrl;
        hint.textContent = currentMusicSource === 'youtubeChillGang'
            ? 'Now playing your Chill Gang YouTube link.'
            : 'Now playing your YouTube link.';
    } else if (currentMusicSource === 'soundcloud') {
        const encoded = encodeURIComponent(value);
        const soundcloudEmbed = `https://w.soundcloud.com/player/?url=${encoded}&auto_play=true`;

        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        audio.style.display = 'none';

        frame.style.display = 'block';
        frame.src = soundcloudEmbed;
        hint.textContent = 'Now playing your SoundCloud link.';
    } else {
        frame.style.display = 'none';
        audio.style.display = 'block';
        audio.src = value;
        audio.play().catch(() => {
            // If autoplay is blocked, user can press play in native controls.
        });
        hint.textContent = 'Now playing your radio stream URL.';
    }

    updateMusicLabels();
    updateMusicInputState();
}

function getMusicSources() {
    let saved = null;
    try {
        saved = JSON.parse(localStorage.getItem('musicSources') || 'null');
    } catch {
        saved = null;
    }

    if (!saved || typeof saved !== 'object') {
        return { ...DEFAULT_MUSIC_SOURCES };
    }

    const savedYouTubeSrc = saved.youtube?.src;
    const hasOldLofi = savedYouTubeSrc && savedYouTubeSrc.includes('CSigjEr_Elc');
    const hasAutoMixPlaylist = savedYouTubeSrc && /videoseries\?list=RD/i.test(savedYouTubeSrc);
    const normalizedYouTubeSrc = (hasOldLofi || hasAutoMixPlaylist)
        ? DEFAULT_MUSIC_SOURCES.youtube.src
        : (savedYouTubeSrc || DEFAULT_MUSIC_SOURCES.youtube.src);

    return {
        youtube: {
            src: normalizedYouTubeSrc,
            hint: DEFAULT_MUSIC_SOURCES.youtube.hint,
            mode: 'frame'
        },
        youtubeChillGang: {
            src: saved.youtubeChillGang?.src || DEFAULT_MUSIC_SOURCES.youtubeChillGang.src,
            hint: DEFAULT_MUSIC_SOURCES.youtubeChillGang.hint,
            mode: saved.youtubeChillGang?.mode || DEFAULT_MUSIC_SOURCES.youtubeChillGang.mode
        },
        soundcloud: {
            src: saved.soundcloud?.src || DEFAULT_MUSIC_SOURCES.soundcloud.src,
            hint: DEFAULT_MUSIC_SOURCES.soundcloud.hint,
            mode: saved.soundcloud?.mode || DEFAULT_MUSIC_SOURCES.soundcloud.mode
        },
        radio9800: {
            src: saved.radio9800?.src || DEFAULT_MUSIC_SOURCES.radio9800.src,
            hint: DEFAULT_MUSIC_SOURCES.radio9800.hint,
            mode: saved.radio9800?.mode || DEFAULT_MUSIC_SOURCES.radio9800.mode
        }
    };
}

function saveMusicSources(sources) {
    localStorage.setItem('musicSources', JSON.stringify(sources));
}

function saveCustomSource(provider) {
    const input = document.getElementById('youtubeCustomInput');
    const value = input.value.trim();

    if (!value) {
        alert('Paste a link first.');
        return;
    }

    const sources = getMusicSources();

    if (provider === 'youtube' || provider === 'youtubeChillGang') {
        const embedUrl = toYouTubeEmbedUrl(value);
        if (!embedUrl) {
            alert('Invalid YouTube link.');
            return;
        }
        sources[provider].src = embedUrl;
        sources[provider].mode = 'frame';
    } else if (provider === 'soundcloud') {
        const encoded = encodeURIComponent(value);
        sources.soundcloud.src = `https://w.soundcloud.com/player/?url=${encoded}&auto_play=true`;
        sources.soundcloud.mode = 'frame';
    } else if (provider === 'radio9800') {
        sources[provider].src = value;
        sources[provider].mode = 'audio';
    }

    saveMusicSources(sources);
    alert(`Saved ${provider} link. It will stay after refresh.`);
}

function toYouTubeEmbedUrl(rawUrl) {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return null;
    }

    const host = parsed.hostname.toLowerCase();
    let videoId = null;
    let playlistId = parsed.searchParams.get('list');

    if (host === 'youtu.be' || host === 'www.youtu.be') {
        videoId = parsed.pathname.slice(1).split('/')[0] || null;
    } else if (host.includes('youtube.com') || host === 'music.youtube.com') {
        if (parsed.pathname === '/watch') {
            videoId = parsed.searchParams.get('v');
        } else if (parsed.pathname.startsWith('/shorts/')) {
            videoId = parsed.pathname.split('/')[2] || null;
        } else if (parsed.pathname.startsWith('/live/')) {
            videoId = parsed.pathname.split('/')[2] || null;
        } else if (parsed.pathname === '/embed/videoseries') {
            videoId = null;
        } else if (parsed.pathname.startsWith('/embed/')) {
            videoId = parsed.pathname.split('/')[2] || null;
        } else if (parsed.pathname === '/playlist') {
            videoId = null;
        }
    } else {
        return null;
    }

    // RD* lists are YouTube auto-mix/radio lists; ignore them when we already have a direct video ID.
    if (playlistId && playlistId.startsWith('RD') && videoId) {
        playlistId = null;
    }

    if (playlistId && !videoId) {
        return buildYouTubeEmbedUrl({ playlistId });
    }

    if (videoId) {
        return buildYouTubeEmbedUrl({ videoId, playlistId });
    }

    if (playlistId) {
        return `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1`;
    }

    return null;
}

function buildYouTubeEmbedUrl({ videoId = null, playlistId = null }) {
    const base = videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}`
        : 'https://www.youtube-nocookie.com/embed/videoseries';

    const params = new URLSearchParams();
    params.set('autoplay', '1');
    params.set('rel', '0');
    params.set('modestbranding', '1');

    if (playlistId) {
        params.set('list', playlistId);
    }

    // Supplying origin helps YouTube trust embedded playback context.
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
        params.set('origin', window.location.origin);
    }

    return `${base}?${params.toString()}`;
}

function updateMusicInputState() {
    const input = document.getElementById('youtubeCustomInput');
    const loadBtn = document.getElementById('loadYoutubeBtn');
    const customLabel = document.getElementById('musicCustomLabel');
    const saveYoutubeBtn = document.getElementById('saveYoutubeBtn');
    const saveYoutubeChillGangBtn = document.getElementById('saveYoutubeChillGangBtn');
    const saveSoundcloudBtn = document.getElementById('saveSoundcloudBtn');
    const saveRadio9800Btn = document.getElementById('saveRadio9800Btn');

    if (!input || !loadBtn || !customLabel || !saveYoutubeBtn || !saveYoutubeChillGangBtn || !saveSoundcloudBtn || !saveRadio9800Btn) {
        return;
    }

    saveYoutubeBtn.style.display = 'none';
    saveYoutubeChillGangBtn.style.display = 'none';
    saveSoundcloudBtn.style.display = 'none';
    saveRadio9800Btn.style.display = 'none';

    if (currentMusicSource === 'youtube') {
        customLabel.textContent = 'YouTube URL';
        input.placeholder = 'Paste YouTube link (video, live, or playlist)';
        loadBtn.textContent = 'Load YouTube';
        saveYoutubeBtn.style.display = 'block';
    } else if (currentMusicSource === 'youtubeChillGang') {
        customLabel.textContent = 'Chill Gang YouTube URL';
        input.placeholder = 'Paste Chill Gang YouTube link (video, live, or playlist)';
        loadBtn.textContent = 'Load Chill Gang';
        saveYoutubeChillGangBtn.style.display = 'block';
    } else if (currentMusicSource === 'soundcloud') {
        customLabel.textContent = 'SoundCloud URL';
        input.placeholder = 'Paste SoundCloud track or playlist URL';
        loadBtn.textContent = 'Load SoundCloud';
        saveSoundcloudBtn.style.display = 'block';
    } else {
        customLabel.textContent = '5FM Stream URL';
        input.placeholder = 'Paste 5FM radio stream URL';
        loadBtn.textContent = 'Load 5FM';
        saveRadio9800Btn.style.display = 'block';
    }
}

function updateMusicLabels() {
    const label = currentMusicSource === 'youtube'
        ? 'YouTube'
        : currentMusicSource === 'youtubeChillGang'
            ? 'YouTube Chill Gang'
        : currentMusicSource === 'soundcloud'
            ? 'SoundCloud'
            : '5FM';

    const badge = document.getElementById('musicSourceBadge');
    if (badge) {
        badge.textContent = `Source: ${label}`;
    }

    const dockLabel = document.getElementById('musicDockLabel');
    if (dockLabel) {
        dockLabel.textContent = `Now playing: ${label}`;
    }
}

// ===== PROFILES =====
const MAX_PROFILES = 5;
const PROFILE_COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

function getProfiles() {
    try { return JSON.parse(localStorage.getItem('profiles') || '[]'); } catch { return []; }
}

function saveProfiles(profiles) {
    localStorage.setItem('profiles', JSON.stringify(profiles));
}

function showProfileChooser() {
    renderProfileCards();
    document.getElementById('profileChooser').classList.remove('hidden');
    closeMobileSidebar();
    setMusicDockVisibility(false);
}

function hideProfileChooser() {
    document.getElementById('profileChooser').classList.add('hidden');
}

function renderProfileCards() {
    const profiles = getProfiles();
    const container = document.getElementById('profileCards');
    container.innerHTML = '';
    profiles.forEach(profile => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.style.setProperty('--pcolor', profile.color);
        card.innerHTML = `
            <span class="profile-card-avatar" style="background:${profile.color}">${profile.name.charAt(0).toUpperCase()}</span>
            <span class="profile-card-name">${escapeHtml(profile.name)}</span>
            <button class="profile-card-delete" data-id="${profile.id}" title="Delete profile">✕</button>
        `;
        card.querySelector('.profile-card-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteProfile(profile.id);
        });
        card.addEventListener('click', (e) => {
            if (e.target.closest('.profile-card-delete')) return;
            activateProfile(profile.id);
        });
        container.appendChild(card);
    });
    document.getElementById('profileAddArea').style.display =
        profiles.length < MAX_PROFILES ? 'flex' : 'none';
}

function activateProfile(id) {
    activeProfileId = String(id);
    localStorage.setItem('activeProfile', activeProfileId);
    hideProfileChooser();
    closeMobileSidebar();
    setMusicDockVisibility(currentPageName() === 'music');
    updateSidebarProfile();
    loadTasks();
    updateStreakDisplay();
    updateAllAnalytics();
}

function deleteProfile(id) {
    const profiles = getProfiles();
    if (profiles.length <= 1) { alert('You must keep at least one profile.'); return; }
    if (!confirm('Delete this profile and all its tasks?')) return;
    saveProfiles(profiles.filter(p => String(p.id) !== String(id)));
    localStorage.removeItem('tasks_' + id);
    localStorage.removeItem('streak_' + id);
    localStorage.removeItem('streakDate_' + id);
    if (String(activeProfileId) === String(id)) {
        activeProfileId = null;
        localStorage.removeItem('activeProfile');
    }
    renderProfileCards();
    if (!activeProfileId) showProfileChooser();
}

function createProfile() {
    const input = document.getElementById('newProfileName');
    const name = (input.value || '').trim();
    if (!name) { alert('Enter a name.'); return; }
    const profiles = getProfiles();
    if (profiles.length >= MAX_PROFILES) { alert('Maximum ' + MAX_PROFILES + ' profiles allowed.'); return; }
    const id = Date.now();
    const color = PROFILE_COLORS[profiles.length % PROFILE_COLORS.length];
    profiles.push({ id, name, color });
    saveProfiles(profiles);
    input.value = '';
    activateProfile(id);
}

function updateSidebarProfile() {
    const profiles = getProfiles();
    const profile = profiles.find(p => String(p.id) === String(activeProfileId));
    if (!profile) return;
    const nameEl = document.getElementById('profileName');
    const avatarEl = document.getElementById('profileAvatar');
    if (nameEl) nameEl.textContent = 'Hi, ' + profile.name;
    if (avatarEl) {
        avatarEl.textContent = profile.name.charAt(0).toUpperCase();
        avatarEl.style.background = profile.color;
    }
}

// placeholder so the old Shazam initShazam function name doesn't break anything
function initShazam() {
    const savedKey = localStorage.getItem('shazamApiKey') || '';
    const keyInput = document.getElementById('shazamApiKey');
    if (keyInput && savedKey) {
        keyInput.value = savedKey;
    }
    document.getElementById('saveShazamKeyBtn').addEventListener('click', () => {
        const key = (document.getElementById('shazamApiKey').value || '').trim();
        if (key) {
            localStorage.setItem('shazamApiKey', key);
            showShazamStatus('API key saved!', false);
        }
    });
    document.getElementById('shazamBtn').addEventListener('click', shazamListen);
}

async function shazamListen() {
    const apiKey = (localStorage.getItem('shazamApiKey') || document.getElementById('shazamApiKey').value || '').trim();
    if (!apiKey) {
        showShazamStatus('Enter your RapidAPI key first.', true);
        return;
    }
    if (shazamRecording) return;
    shazamRecording = true;

    const btn = document.getElementById('shazamBtn');
    const resultEl = document.getElementById('shazamResult');
    btn.disabled = true;
    resultEl.classList.add('hidden');
    while (resultEl.firstChild) resultEl.removeChild(resultEl.firstChild);

    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
        showShazamStatus('Microphone access denied.', true);
        shazamRecording = false;
        btn.disabled = false;
        return;
    }

    const chunks = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const arrayBuffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i]);
        }
        const base64Audio = btoa(binary);
        showShazamStatus('Identifying...', false);
        try {
            const response = await fetch('https://shazam.p.rapidapi.com/songs/detect', {
                method: 'POST',
                headers: {
                    'content-type': 'text/plain',
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
                },
                body: base64Audio
            });
            if (!response.ok) {
                showShazamStatus(`API error (${response.status}). Check your key.`, true);
                return;
            }
            const data = await response.json();
            if (data?.track) {
                const track = data.track;
                const wrapper = document.createElement('div');
                wrapper.className = 'shazam-match';
                if (track.images?.coverart) {
                    const img = document.createElement('img');
                    img.src = track.images.coverart;
                    img.alt = 'Album cover';
                    img.className = 'shazam-cover';
                    wrapper.appendChild(img);
                }
                const info = document.createElement('div');
                info.className = 'shazam-info';
                const titleEl = document.createElement('div');
                titleEl.className = 'shazam-title';
                titleEl.textContent = track.title || 'Unknown Title';
                info.appendChild(titleEl);
                if (track.subtitle) {
                    const artistEl = document.createElement('div');
                    artistEl.className = 'shazam-artist';
                    artistEl.textContent = track.subtitle;
                    info.appendChild(artistEl);
                }
                const album = track.sections?.[0]?.metadata?.find(m => m.title === 'Album')?.text;
                if (album) {
                    const albumEl = document.createElement('div');
                    albumEl.className = 'shazam-album';
                    albumEl.textContent = `\u{1F4BF} ${album}`;
                    info.appendChild(albumEl);
                }
                wrapper.appendChild(info);
                resultEl.appendChild(wrapper);
                resultEl.classList.remove('hidden');
                showShazamStatus('Match found!', false);
            } else {
                showShazamStatus('No match found. Try again.', false);
            }
        } catch {
            showShazamStatus('Network error. Check your key and connection.', true);
        } finally {
            shazamRecording = false;
            btn.disabled = false;
        }
    };

    let countdown = 5;
    showShazamStatus(`\uD83C\uDF99 Listening... ${countdown}s`, false);
    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) showShazamStatus(`\uD83C\uDF99 Listening... ${countdown}s`, false);
    }, 1000);
    recorder.start();
    setTimeout(() => {
        clearInterval(countdownInterval);
        showShazamStatus('Processing...', false);
        recorder.stop();
    }, 5000);
}

// ===== SETTINGS =====
function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');

    const notificationsToggle = document.getElementById('notificationsToggle');
    const soundToggle = document.getElementById('soundToggle');
    const darkModeDefault = document.getElementById('darkModeDefault');

    notificationsToggle.checked = localStorage.getItem('notifications') !== 'false';
    soundToggle.checked = localStorage.getItem('sound') !== 'false';
    darkModeDefault.checked = localStorage.getItem('darkMode') === 'true';

    notificationsToggle.addEventListener('change', (e) => {
        localStorage.setItem('notifications', e.target.checked);
    });

    soundToggle.addEventListener('change', (e) => {
        localStorage.setItem('sound', e.target.checked);
    });

    darkModeDefault.addEventListener('change', (e) => {
        localStorage.setItem('darkMode', e.target.checked);
    });
}

// ===== UTILITIES =====
function playSound() {
    if (localStorage.getItem('sound') !== 'false') {
        // Create a simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function closeModal() {
    document.getElementById('settingsModal').classList.add('hidden');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('settingsModal');
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});