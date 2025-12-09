export let currentLanguage = 'en';
export let translations = {};

export async function loadLanguage(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error('Language load failed');
        
        translations = await response.json();
        currentLanguage = lang;
        applyTranslations();
        
    } catch (error) {
        console.error('Language load error:', error);
        if (lang !== 'en') await loadLanguage('en');
    }
}

export function changeLanguage(lang) {
    currentLanguage = lang;
    const languageMenu = document.getElementById('language-menu');
    if (languageMenu) {
        languageMenu.classList.remove('show');
    }
    loadLanguage(lang);
}

export function getTranslation(key, fallback = '') {
    return translations[key] || fallback;
}

function applyTranslations() {
    if (!translations) return;
    
    // Основные текстовые элементы
    const textElements = {
        'app-title': 'appTitle',
        'balance-text': 'balanceText',
        'tasks-title': 'tasksTitle',
        'create-task-title': 'createTaskTitle',
        'client-balance-text': 'clientBalanceText',
        'top-up-btn': 'topUpBtn',
        'create-task-btn': 'createTaskBtn',
        'tasks-tab': 'tasksTab',
        'order-tab': 'orderTab',
        'wallet-tab': 'walletTab',
        'footer-text': 'footerText',
        'current-language': 'currentLanguage'
    };
    
    for (const [id, key] of Object.entries(textElements)) {
        const element = document.getElementById(id);
        if (element && translations[key]) {
            element.textContent = translations[key];
        }
    }
    
    // Placeholders
    const channelInput = document.getElementById('channel-link');
    const rewardInput = document.getElementById('reward');
    if (channelInput && translations.channelLinkPlaceholder) {
        channelInput.placeholder = translations.channelLinkPlaceholder;
    }
    if (rewardInput && translations.rewardPlaceholder) {
        rewardInput.placeholder = translations.rewardPlaceholder;
    }
    
    // Кошелёк
    const connectBtn = document.getElementById('connect-wallet-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');
    const walletLabel = document.querySelector('.wallet-address .label');
    
    if (connectBtn && translations.walletConnect) {
        connectBtn.innerHTML = `<img src="assets/icons/ton-icon.png" alt=""> ${translations.walletConnect}`;
    }
    if (withdrawBtn && translations.withdraw) {
        withdrawBtn.innerHTML = `<img src="assets/icons/trf.png" alt=""> ${translations.withdraw}`;
    }
    if (walletLabel && translations.yourAddress) {
        walletLabel.textContent = translations.yourAddress;
    }

    // Статистика заданий
    const myTasksTitle = document.querySelector('#client-tasks h3');
    if (myTasksTitle && translations.myTasksTitle) {
        myTasksTitle.textContent = translations.myTasksTitle;
    }
    
    // Обновляем кнопки заданий
    updateTaskButtons();
    
    // ОБНОВЛЯЕМ СТАТИСТИКУ ЗАДАНИЙ ПРИ СМЕНЕ ЯЗЫКА
    updateTasksStatistics();
}

function updateTaskButtons() {
    const taskButtons = document.querySelectorAll('.mini-btn');
    taskButtons.forEach(button => {
        if (translations.completeTask) {
            button.textContent = translations.completeTask;
        }
    });
}

// Новая функция для обновления статистики заданий
function updateTasksStatistics() {
    // Проверяем существует ли функция renderClientTasks
    if (typeof window.renderClientTasks === 'function') {
        window.renderClientTasks();
    }
}