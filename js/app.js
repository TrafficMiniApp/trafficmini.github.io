import { initWallet } from './wallet.js';
import { initTasks, completeTask, createTask, renderClientTasks } from './tasks.js';
import { loadLanguage, changeLanguage, currentLanguage, getTranslation } from './language.js'; // Добавляем импорт getTranslation
import { initUI, setupEventListeners } from './ui.js';

// Глобальные переменные
window.userBalance = 0;
window.clientBalance = 0;

// Инициализация приложения
async function initApp() {
    await loadLanguage(currentLanguage);
    initUI();
    initWallet();
    initTasks();
    setupEventListeners();
    
    // Сделаем функции глобальными
    window.completeTask = completeTask;
    window.createTask = createTask;
    window.changeLanguage = changeLanguage;
    window.renderClientTasks = renderClientTasks;
    window.toggleLanguageMenu = () => {
        document.getElementById('language-menu').classList.toggle('show');
    };
    window.topUp = () => {
        const amount = parseFloat(prompt(getTranslation('enterAmount', 'Enter amount:'))); // Используем перевод
        if (!isNaN(amount) && amount > 0) {
            window.clientBalance += amount;
            document.getElementById('client-balance').textContent = window.clientBalance.toFixed(2);
        }
    };
}

// Запуск приложения
window.onload = initApp;