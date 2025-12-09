import { initWallet, fetchBalanceFromBackend } from './wallet.js';
import { initTasks, completeTask, createTask, renderClientTasks } from './tasks.js';
import { loadLanguage, changeLanguage, currentLanguage, getTranslation } from './language.js';
import { initUI, setupEventListeners } from './ui.js';

window.userBalance = 0;
window.clientBalance = 0;

async function initApp() {
    await loadLanguage(currentLanguage);
    initUI();
    initWallet(); // теперь TonConnect
    initTasks();
    setupEventListeners();

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
            document.getElementById('client-balance').textContent = window.clientBalance.toFixed(2);
        }
    };

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', async () => {
            const tab = btn.dataset.tab;
            if (tab === 'Wallet' && window.isWalletConnected && window.walletAddress) {
                window.userBalance = await fetchBalanceFromBackend(window.walletAddress);
                const balanceElement = document.getElementById('balance');
                if (balanceElement) balanceElement.textContent = window.userBalance.toFixed(2);
            }
        });
    });
}

window.onload = initApp;
