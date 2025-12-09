// wallet.js — подключение через TonConnect
import { TonConnect } from "https://cdn.jsdelivr.net/npm/@tonconnect/sdk/dist/tonconnect.umd.min.js";

window.isWalletConnected = false;
window.walletAddress = '';
window.userBalance = 0;
window.tonConnect = null;

// Получение баланса через бэкенд Render
export async function fetchBalanceFromBackend(address) {
    try {
        const res = await fetch(`https://trafficbackend-vhqy.onrender.com/balance/${address}`);
        const data = await res.json();
        return parseFloat(data.balances.trf);
    } catch (err) {
        console.error('Ошибка при получении баланса с бэкенда:', err);
        return 0;
    }
}

export function initWallet() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');

    if (connectBtn && withdrawBtn) {
        connectBtn.addEventListener('click', connectTonWallet);
        withdrawBtn.addEventListener('click', withdrawFunds);
    }
}

async function connectTonWallet() {
    try {
        if (!window.tonConnect) {
            window.tonConnect = new TonConnect({
                manifestUrl: "https://trafficmini.github.io/tonconnect-manifest.json" // твой манифест
            });
        }

        // Подключение кошелька
        const session = await window.tonConnect.connect();
        window.walletAddress = session.account.address;
        window.isWalletConnected = true;

        // Показываем адрес в UI
        document.getElementById('wallet-address').textContent = window.walletAddress;
        document.getElementById('wallet-info').classList.remove('hidden');
        document.getElementById('connect-wallet-btn').style.display = 'none';

        // Получаем баланс через бэкенд
        window.userBalance = await fetchBalanceFromBackend(window.walletAddress);
        updateBalanceUI();

        // Добавляем кнопку Refresh Balance
        addRefreshButton();

    } catch (err) {
        console.error('Ошибка подключения кошелька TonConnect:', err);
        alert('Не удалось подключить кошелек');
    }
}

async function withdrawFunds() {
    if (!window.isWalletConnected) {
        alert('Сначала подключите кошелек');
        return;
    }

    if (window.userBalance < 50) {
        alert('Минимум 50 TRF требуется для вывода');
        return;
    }

    try {
        console.log('Вывод средств...');
        alert('Вывод инициирован');
        window.userBalance = 0;
        updateBalanceUI();
    } catch (err) {
        console.error('Ошибка при выводе:', err);
        alert('Не удалось вывести TRF');
    }
}

function updateBalanceUI() {
    const balanceElement = document.getElementById('balance');
    const withdrawBtn = document.getElementById('withdraw-btn');

    if (balanceElement) {
        balanceElement.textContent = window.userBalance.toFixed(2);
    }

    if (withdrawBtn) {
        withdrawBtn.disabled = window.userBalance < 50;
    }
}

function addRefreshButton() {
    const container = document.querySelector('.balance-container');
    if (!container) return;

    if (document.getElementById('refresh-balance-btn')) return;

    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'refresh-balance-btn';
    refreshBtn.textContent = '🔄 Refresh Balance';
    refreshBtn.className = 'submit';
    container.appendChild(refreshBtn);

    refreshBtn.addEventListener('click', async () => {
        if (!window.walletAddress) return;
        window.userBalance = await fetchBalanceFromBackend(window.walletAddress);
        updateBalanceUI();
    });
}
