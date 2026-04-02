import { initWallet } from './wallet.js';
import { initTasks, completeTask, createTask, renderClientTasks } from './tasks.js';
import { loadLanguage, changeLanguage, currentLanguage, getTranslation } from './language.js';
import { initUI, setupEventListeners } from './ui.js';

// Глобальные переменные
window.userBalance = 0;
window.clientBalance = 0;
window.walletManager = null;

// Инициализация приложения
async function initApp() {
    try {
        // Загружаем язык
        await loadLanguage(currentLanguage);

        // Инициализируем UI
        initUI();
        setupEventListeners();

        // Инициализируем менеджер кошельков
        window.walletManager = initWallet(window.tonConnectUI);

        // Инициализация задач
        initTasks();

        // Назначаем обработчики кнопок
        setupButtonHandlers();

        // Глобальные функции
        window.completeTask = completeTask;
        window.createTask = createTask;
        window.changeLanguage = changeLanguage;
        window.renderClientTasks = renderClientTasks;
        window.toggleLanguageMenu = toggleLanguageMenu;

    } catch (error) {
        console.error("App initialization error:", error);
    }
}

// Настройка обработчиков кнопок
function setupButtonHandlers() {
    // Языковое меню
    const languageSwitcher = document.getElementById('language-switcher');
    if (languageSwitcher) {
        languageSwitcher.addEventListener('click', toggleLanguageMenu);
    }

    // Опции языка
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            changeLanguage(lang);
            document.getElementById('language-menu').classList.remove('show');
        });
    });

    // Кнопка пополнения баланса
    const topUpBtn = document.getElementById('top-up-btn');
    if (topUpBtn) {
        topUpBtn.addEventListener('click', () => {
            const amount = parseFloat(prompt(getTranslation('enterAmount', 'Enter amount:')));
            if (!isNaN(amount) && amount > 0) {
                window.clientBalance += amount;
                document.getElementById('client-balance').textContent = 
                    window.clientBalance.toFixed(2);
            }
        });
    }

    // Кнопка создания задания
    const createTaskBtn = document.getElementById('create-task-btn');
    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', () => {
            const link = document.getElementById('channel-link').value;
            const reward = parseFloat(document.getElementById('reward').value);
            if (link && reward) {
                createTask(link, reward);
            }
        });
    }

    // Кнопка вывода средств
    const withdrawBtn = document.getElementById('withdraw-btn');
    if (withdrawBtn && window.walletManager) {
        withdrawBtn.addEventListener('click', () => {
            window.walletManager.withdrawFunds();
        });
    }

}

// Функция переключения языкового меню
function toggleLanguageMenu() {
    const menu = document.getElementById('language-menu');
    if (menu) {
        menu.classList.toggle('show');
    }
}

// Закрытие языкового меню при клике вне его
document.addEventListener('click', function(event) {
    const languageMenu = document.getElementById('language-menu');
    const languageSwitcher = document.querySelector('.language-switcher');
    
    if (languageMenu && languageSwitcher) {
        if (!languageMenu.contains(event.target) && !languageSwitcher.contains(event.target)) {
            languageMenu.classList.remove('show');
        }
    }
});

// 🔥 Новая функция для управления вкладками
function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedTab = btn.getAttribute('data-tab');
            
            // 🔥 Обновляем видимость кнопки Refresh Balance
            if (window.walletManager) {
                window.walletManager.updateRefreshButtonVisibility(selectedTab);
            }
            
            // 🔥 Обновляем видимость баланса (если уже реализовано)
            updateBalanceVisibility(selectedTab);
        });
    });
}

// 🔥 Функция для видимости баланса (если ещё нет)
function updateBalanceVisibility(activeTab) {
    const balanceContainer = document.querySelector('.balance-text');
    
    if (!balanceContainer) return;
    
    // Показываем баланс только на Tasks и Wallet
    if (activeTab === 'Tasks' || activeTab === 'Wallet') {
        balanceContainer.style.display = 'block';
    } else {
        balanceContainer.style.display = 'none';
    }
}


// Запуск приложения
window.addEventListener('DOMContentLoaded', initApp);