let isWalletConnected = false;
let walletAddress = '';

export function initWallet() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');

    if (connectBtn && withdrawBtn) {
        connectBtn.addEventListener('click', connectWallet);
        withdrawBtn.addEventListener('click', withdrawFunds);
    }
}

async function connectWallet() {
    try {
        console.log('Connecting wallet...');
        walletAddress = 'EQ123...4567';
        isWalletConnected = true;
        
        document.getElementById('wallet-address').textContent = walletAddress;
        document.getElementById('wallet-info').classList.remove('hidden');
        document.getElementById('connect-wallet-btn').style.display = 'none';
        
        window.userBalance = Math.floor(Math.random() * 100) + 50;
        updateBalanceUI();
        
    } catch (error) {
        console.error('Wallet error:', error);
        alert('Wallet connection failed');
    }
}

async function withdrawFunds() {
    if (!isWalletConnected) {
        alert('Connect wallet first');
        return;
    }
    
    if (window.userBalance < 50) {
        alert('Minimum 50 TRF required');
        return;
    }
    
    try {
        console.log('Withdrawing...');
        alert('Withdrawal initiated');
        window.userBalance = 0;
        updateBalanceUI();
    } catch (error) {
        console.error('Withdraw error:', error);
        alert('Withdrawal failed');
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