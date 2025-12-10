import { initWallet } from './wallet.js';
import { initTasks, completeTask, createTask, renderClientTasks } from './tasks.js';
import { loadLanguage, changeLanguage, currentLanguage, getTranslation } from './language.js';
import { initUI, setupEventListeners } from './ui.js';

// Глобальные переменные
window.userBalance = 0;
window.clientBalance = 0;

let tonConnectUI = null;

// Инициализация приложения
async function initApp() {

    // ЖДЁМ TonConnect, который инициализируется в HTML
    tonConnectUI = window.tonConnectUI;
    if (!tonConnectUI) {
        console.error("TonConnectUI NOT loaded!");
        return;
    }

    // Загружаем язык
    await loadLanguage(currentLanguage);

    // UI и вкладки
    initUI();
    setupEventListeners();

    // ИНИЦИАЛИЗИРУЕМ КОШЕЛЁК ЧЕРЕЗ TONCONNECT UI
    initWallet(tonConnectUI);

    // Инициализация задач
    initTasks();

    // Глобальные функции
    window.completeTask = completeTask;
    window.createTask = createTask;
    window.changeLanguage = changeLanguage;
    window.renderClientTasks = renderClientTasks;

    window.toggleLanguageMenu = () => {
        document.getElementById('language-menu').classList.toggle('show');
    };

    window.topUp = () => {
        const amount = parseFloat(prompt(getTranslation('enterAmount', 'Enter amount:')));
        if (!isNaN(amount) && amount > 0) {
            window.clientBalance += amount;
            document.getElementById('client-balance').textContent =
                window.clientBalance.toFixed(2);
        }
    };
}

// Запуск приложения
window.onload = initApp;
