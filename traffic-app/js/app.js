// Основные переменные
let currentLanguage = 'en';
let translations = {};
let userBalance = 0;
let clientBalance = 0;
let isWalletConnected = false;
let walletAddress = '';

// Тестовые задания (возвращены все 7 примеров)
const tasks = [
  { id: 1, link: 'https://t.me/example', reward: 1.5 },
  { id: 2, link: 'https://t.me/channel123', reward: 2.0 },
  { id: 3, link: 'https://t.me/dogs_global', reward: 1.2 },
  { id: 4, link: 'https://t.me/example2', reward: 2.5 },
  { id: 5, link: 'https://t.me/example3', reward: 3.5 },
  { id: 6, link: 'https://t.me/example4', reward: 4.5 },
  { id: 7, link: 'https://t.me/example5', reward: 5.5 }
];

// Инициализация кошелька
function initWallet() {
  const connectBtn = document.getElementById('connect-wallet-btn');
  const walletInfo = document.getElementById('wallet-info');
  const withdrawBtn = document.getElementById('withdraw-btn');

  connectBtn.addEventListener('click', async () => {
    try {
      // Заглушка для демо - в реальности TonConnect
      console.log('Connecting wallet...');
      walletAddress = 'EQ123...4567';
      isWalletConnected = true;
      
      document.getElementById('wallet-address').textContent = walletAddress;
      walletInfo.classList.remove('hidden');
      connectBtn.style.display = 'none';
      
      userBalance = Math.floor(Math.random() * 100) + 50;
      updateBalanceUI();
      
    } catch (error) {
      console.error('Wallet error:', error);
      alert(getTranslation('walletError', 'Wallet connection failed'));
    }
  });

  withdrawBtn.addEventListener('click', async () => {
    if (!isWalletConnected) {
      alert(getTranslation('connectWalletFirst', 'Connect wallet first'));
      return;
    }
    
    if (userBalance < 50) {
      alert(getTranslation('minWithdraw', 'Minimum 50 TRF required'));
      return;
    }
    
    try {
      console.log('Withdrawing...'); // Здесь будет вызов контракта
      alert(getTranslation('withdrawSuccess', 'Withdrawal initiated'));
      userBalance = 0;
      updateBalanceUI();
    } catch (error) {
      console.error('Withdraw error:', error);
      alert(getTranslation('withdrawError', 'Withdrawal failed'));
    }
  });
}

// Вспомогательные функции
function getTranslation(key, fallback) {
  return translations[key] || fallback;
}

function updateBalanceUI() {
  document.getElementById('balance').textContent = userBalance.toFixed(2);
  document.getElementById('withdraw-btn').disabled = userBalance < 50;
}

// Загрузка языка
async function loadLanguage(lang) {
  try {
    const response = await fetch(`lang/${lang}.json`);
    if (!response.ok) throw new Error('Language load failed');
    
    translations = await response.json();
    currentLanguage = lang;
    applyTranslations();
    
  } catch (error) {
    console.error('Language load error:', error);
    // Fallback to English if translation fails
    if (lang !== 'en') await loadLanguage('en');
  }
}

function applyTranslations() {
  // Основной интерфейс
  document.getElementById('app-title').textContent = translations.appTitle;
  document.getElementById('balance-text').textContent = translations.balanceText;
  document.getElementById('tasks-title').textContent = translations.tasksTitle;
  document.getElementById('create-task-title').textContent = translations.createTaskTitle;
  document.getElementById('client-balance-text').textContent = translations.clientBalanceText;
  document.getElementById('top-up-btn').textContent = translations.topUpBtn;
  document.getElementById('channel-link').placeholder = translations.channelLinkPlaceholder;
  document.getElementById('reward').placeholder = translations.rewardPlaceholder;
  document.getElementById('create-task-btn').textContent = translations.createTaskBtn;
  document.getElementById('tasks-tab').textContent = translations.tasksTab;
  document.getElementById('order-tab').textContent = translations.orderTab;
  document.getElementById('wallet-tab').textContent = translations.walletTab;
  document.getElementById('footer-text').textContent = translations.footerText;
  document.getElementById('current-language').textContent = translations.currentLanguage;

  // Кошелёк
  const connectBtn = document.getElementById('connect-wallet-btn');
  if (connectBtn) {
    connectBtn.innerHTML = `<img src="assets/icons/ton-icon.png" alt=""> ${translations.walletConnect}`;
  }
  
  const withdrawBtn = document.getElementById('withdraw-btn');
  if (withdrawBtn) {
    withdrawBtn.innerHTML = `<img src="assets/icons/withdraw-icon.png" alt=""> ${translations.withdraw}`;
  }

  // Перерисовываем задания с новыми переводами
  renderTasks();
}

function renderTasks() {
  const container = document.getElementById('task-list');
  if (!container) return;
  
  container.innerHTML = '';
  tasks.forEach(task => {
    const el = document.createElement('div');
    el.className = 'task';
    el.innerHTML = `
      <div class="task-info">
        🗯 <a href="${task.link}" target="_blank">${task.link}</a><br>
        ${task.reward} TRF
      </div>
      <button class="mini-btn" onclick="completeTask(${task.id})">
        ${translations.completeTask}
      </button>
    `;
    container.appendChild(el);
  });
}

// Обработчики событий
function setupEventListeners() {
  document.addEventListener('click', function(event) {
    const languageMenu = document.getElementById('language-menu');
    const languageSwitcher = document.querySelector('.language-switcher');
    if (!languageMenu.contains(event.target) && !languageSwitcher.contains(event.target)) {
      languageMenu.classList.remove('show');
    }
  });

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      navItems.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// Глобальные функции
window.completeTask = (id) => {
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex > -1) {
    userBalance += tasks[taskIndex].reward;
    tasks.splice(taskIndex, 1);
    updateBalanceUI();
    renderTasks();
    alert(translations.taskCompleted || 'Task completed!');
  }
};

window.createTask = () => {
  const link = document.getElementById('channel-link').value;
  const reward = parseFloat(document.getElementById('reward').value);
  
  if (link && reward && clientBalance >= reward) {
    tasks.push({ id: Date.now(), link, reward });
    clientBalance -= reward;
    document.getElementById('channel-link').value = '';
    document.getElementById('reward').value = '';
    document.getElementById('client-balance').textContent = clientBalance.toFixed(2);
    renderTasks();
    alert(translations.taskCreated || 'Task created!');
  } else {
    alert(translations.insufficientFunds || 'Insufficient funds');
  }
};

window.topUp = () => {
  const amount = parseFloat(prompt(translations.enterAmount || 'Enter amount:'));
  if (!isNaN(amount) && amount > 0) {
    clientBalance += amount;
    document.getElementById('client-balance').textContent = clientBalance.toFixed(2);
  }
};

window.toggleLanguageMenu = () => {
  document.getElementById('language-menu').classList.toggle('show');
};

window.changeLanguage = (lang) => {
  currentLanguage = lang;
  document.getElementById('language-menu').classList.remove('show');
  loadLanguage(lang);
};

// Инициализация
window.onload = () => {
  setupEventListeners();
  initWallet();
  loadLanguage(currentLanguage);
};