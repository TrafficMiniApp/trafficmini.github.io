import { getTranslation } from './language.js';

export const tasks = [
    { 
        id: 1, 
        link: 'https://t.me/example', 
        reward: 1.5,
        createdBy: null,
        totalBudget: 100,
        spent: 15,
        completed: 10
    },
    { 
        id: 2, 
        link: 'https://t.me/channel123', 
        reward: 2.0,
        createdBy: null,
        totalBudget: 50,
        spent: 20,
        completed: 10
    }
];

export function initTasks() {
    renderTasks();
    renderClientTasks();
}

export function completeTask(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        const task = tasks[taskIndex];
        window.userBalance += task.reward;
        task.spent += task.reward;
        task.completed += 1;
        
        if (task.spent >= task.totalBudget) {
            tasks.splice(taskIndex, 1);
        }
        
        updateBalanceUI();
        renderTasks();
        renderClientTasks();
        alert(getTranslation('taskCompleted', 'Task completed!'));
    }
}

export function createTask() {
    const link = document.getElementById('channel-link').value;
    const reward = parseFloat(document.getElementById('reward').value);
    
    if (!link || !reward) {
        alert(getTranslation('fillAllFields', 'Fill all fields'));
        return;
    }
    
    const budget = parseFloat(prompt(getTranslation('enterAmount', 'Enter budget (TRF):')));
    
    if (!budget || budget <= 0) {
        alert(getTranslation('enterValidBudget', 'Enter valid budget'));
        return;
    }
    
    if (window.clientBalance < budget) {
        alert(getTranslation('notEnoughFunds', 'Not enough funds'));
        return;
    }
    
    tasks.push({ 
        id: Date.now(), 
        link, 
        reward,
        createdBy: 'client',
        totalBudget: budget,
        spent: 0,
        completed: 0
    });
    
    window.clientBalance -= budget;
    document.getElementById('channel-link').value = '';
    document.getElementById('reward').value = '';
    document.getElementById('client-balance').textContent = window.clientBalance.toFixed(2);
    
    renderTasks();
    renderClientTasks();
    alert(getTranslation('taskCreated', 'Task created!'));
}

function renderTasks() {
    const container = document.getElementById('task-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const availableTasks = tasks.filter(task => task.createdBy !== 'client');
    
    availableTasks.forEach(task => {
        const el = document.createElement('div');
        el.className = 'task';
        el.innerHTML = `
            <div class="task-info">
                🗯 <a href="${task.link}" target="_blank">${task.link}</a><br>
                ${task.reward} TRF
            </div>
            <button class="mini-btn" onclick="completeTask(${task.id})">
                ${getTranslation('completeTask', 'Complete')}
            </button>
        `;
        container.appendChild(el);
    });
}

export function renderClientTasks() {
    const container = document.getElementById('client-tasks-list');
    const clientTasksSection = document.getElementById('client-tasks');
    const myTasksTitle = document.querySelector('#client-tasks h3');
    
    if (!container) return;
    
    // Обновляем заголовок
    if (myTasksTitle) {
        myTasksTitle.textContent = getTranslation('myTasksTitle', '📊 My Tasks');
    }
    
    const clientTasks = tasks.filter(task => task.createdBy === 'client');
    
    if (clientTasks.length === 0) {
        if (clientTasksSection) clientTasksSection.style.display = 'none';
        return;
    }
    
    if (clientTasksSection) clientTasksSection.style.display = 'block';
    container.innerHTML = '';
    
    clientTasks.forEach(task => {
        const progress = (task.spent / task.totalBudget) * 100;
        const remaining = task.totalBudget - task.spent;
        const estimatedSubs = Math.floor(remaining / task.reward);
        
        const taskEl = document.createElement('div');
        taskEl.className = 'client-task';
        taskEl.innerHTML = `
            <div class="task-stats">
                <div class="task-header">
                    <a href="${task.link}" target="_blank">${task.link}</a>
                    <span class="task-reward">${task.reward} TRF${getTranslation('perSubscription', '/sub')}</span>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                    <div class="progress-text">${Math.round(progress)}% ${getTranslation('progressText', 'completed')}</div>
                </div>
                
                <div class="stats-numbers">
                    <div class="stat">
                        <span class="stat-label">${getTranslation('subscribersCompleted', '👥 Completed:')}</span>
                        <span class="stat-value">${task.completed}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${getTranslation('moneySpent', '💰 Spent:')}</span>
                        <span class="stat-value">${task.spent} TRF</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${getTranslation('moneyLeft', '🎯 Left:')}</span>
                        <span class="stat-value">${remaining} TRF</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${getTranslation('totalBudget', '📊 Budget:')}</span>
                        <span class="stat-value">${task.totalBudget} TRF</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${getTranslation('subscribersLeft', '🔮 Left:')}</span>
                        <span class="stat-value">~${estimatedSubs}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(taskEl);
    });
}

function updateBalanceUI() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = window.userBalance.toFixed(2);
    }
}
window.renderClientTasks = renderClientTasks;