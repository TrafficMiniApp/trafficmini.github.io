let walletAddress = '';
let isWalletConnected = false;
let tonConnectUI = null;

// Загружаем TonConnect (его создаёт HTML)
export function initWallet(tc) {
    tonConnectUI = tc;

    tonConnectUI.onStatusChange(async (wallet) => {
        console.log("Wallet status:", wallet);

        if (wallet && wallet.account) {
            walletAddress = wallet.account.address;
            isWalletConnected = true;

            document.getElementById("wallet-info").classList.remove("hidden");
            document.getElementById("wallet-address").textContent =
                walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);

            // Загружаем баланс TRF с бэка
            window.userBalance = await fetchBalanceFromBackend(walletAddress);
            updateBalanceUI();
            addRefreshButton();

        } else {
            walletAddress = '';
            isWalletConnected = false;

            document.getElementById("wallet-info").classList.add("hidden");
            document.getElementById("withdraw-btn").disabled = true;
        }
    });

    const withdrawBtn = document.getElementById("withdraw-btn");
    withdrawBtn.addEventListener("click", withdrawFunds);
}


// --- BACKEND ---
async function fetchBalanceFromBackend(address) {
    try {
        const res = await fetch(`https://your-backend-domain.com/wallet/balance?address=${address}`);
        const data = await res.json();
        return data.result || 0;
    } catch (e) {
        console.error("Backend error:", e);
        return 0;
    }
}


// --- WITHDRAW ---
async function withdrawFunds() {
    if (!isWalletConnected) return alert("Connect wallet first");

    if (window.userBalance < 50) {
        return alert("Minimum 50 TRF required");
    }

    alert("Withdrawal request sent!");
    window.userBalance = 0;
    updateBalanceUI();
}


// --- UPDATE UI ---
function updateBalanceUI() {
    const balanceElement = document.getElementById("balance");
    if (balanceElement) balanceElement.textContent = window.userBalance.toFixed(2);

    document.getElementById("withdraw-btn").disabled = window.userBalance < 50;
}


function addRefreshButton() {
    const container = document.querySelector(".balance-container");
    if (!container) return;

    if (document.getElementById("refresh-balance-btn")) return;

    const btn = document.createElement("button");
    btn.id = "refresh-balance-btn";
    btn.textContent = "🔄 Refresh";
    btn.className = "submit";

    container.appendChild(btn);

    btn.addEventListener("click", async () => {
        if (!walletAddress) return;
        window.userBalance = await fetchBalanceFromBackend(walletAddress);
        updateBalanceUI();
    });
}
