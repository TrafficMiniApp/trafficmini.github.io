export class WalletManager {
    constructor() {
        this.walletAddress = '';
        this.isWalletConnected = false;
        this.tonConnectUI = null;
        this.userBalance = 0;
    }

    // Инициализация TonConnect
    initTonConnect() {
        try {
            this.tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
                manifestUrl: 'https://trafficminiapp.github.io/trafficmini.github.io/tonconnect-manifest.json',
                buttonRootId: 'connect-wallet-btn'
            });

            // Проверяем существующее подключение
            this.checkConnection();

            // Подписываемся на изменения статуса кошелька
            this.tonConnectUI.onStatusChange(this.handleWalletStatusChange.bind(this));

            return this.tonConnectUI;
        } catch (error) {
            console.error("TonConnect initialization error:", error);
            return null;
        }
    }

    // Проверка существующего подключения
    async checkConnection() {
        if (!this.tonConnectUI) return;

        try {
            const connectedWallets = await this.tonConnectUI.getWallets();
            if (connectedWallets.length > 0) {
                const wallet = connectedWallets[0];
                await this.handleWalletStatusChange(wallet);
            }
        } catch (error) {
            console.error("Check connection error:", error);
        }
    }

    // Обработчик изменения статуса кошелька
    async handleWalletStatusChange(wallet) {
        console.log("Wallet status changed:", wallet);

        const walletInfo = document.getElementById("wallet-info");
        const connectBtn = document.getElementById("connect-wallet-btn");

        if (wallet && wallet.account) {
            this.walletAddress = wallet.account.address;
            this.isWalletConnected = true;

            // Показываем информацию о кошельке
            if (walletInfo) {
                walletInfo.classList.remove("hidden");
            }

            // 🔥 ПОКАЗЫВАЕМ ТОЛЬКО NON-BOUNCEABLE АДРЕС (как в Tonkeeper)
            this.showNonBounceableAddress();

            // Меняем кнопку подключения на "Отключить"
            if (connectBtn) {
                connectBtn.innerHTML = '<img src="assets/icons/ton-icon.png" alt=""> Disconnect Wallet';
                connectBtn.onclick = () => this.disconnect();
            }

            // Обновляем баланс (заглушка)
            this.userBalance = this.getMockBalance();
            this.updateBalanceUI();

            // Добавляем кнопку обновления баланса
            this.addRefreshButton();

        } else {
            // Сбрасываем состояние при отключении
            this.walletAddress = '';
            this.isWalletConnected = false;
            this.userBalance = 0;

            if (walletInfo) {
                walletInfo.classList.add("hidden");
            }

            if (connectBtn) {
                connectBtn.innerHTML = '<img src="assets/icons/ton-icon.png" alt=""> Connect Wallet';
                connectBtn.onclick = () => this.connect();
            }

            this.updateBalanceUI();
            this.removeRefreshButton();
        }

        // Обновляем состояние кнопки вывода
        this.updateWithdrawButton();
    }

    // 🔥 ПОКАЗ ТОЛЬКО NON-BOUNCEABLE АДРЕСА
    showNonBounceableAddress() {
        if (!this.walletAddress) return;

        try {
            let nonBounceableAddress = '';

            // Используем TonWeb для конвертации
            if (window.TonWeb) {
                const address = new TonWeb.utils.Address(this.walletAddress);
                // toString(isUserFriendly, isUrlSafe, isBounceable, isTestOnly)
                // isBounceable = false для UQ... адресов
                nonBounceableAddress = address.toString(true, true, false, false);
            } else {
                throw new Error("TonWeb library not found");
            }

            // Обновляем UI
            const addressElement = document.getElementById("wallet-address");
            if (addressElement) {
                // Показываем сокращенный адрес для красоты (как в Tonkeeper: UQ...xxxx)

                const short = nonBounceableAddress.slice(0, 4) + '...' + nonBounceableAddress.slice(-4);
                addressElement.textContent = short;
                addressElement.setAttribute('title', nonBounceableAddress); // Полный адрес при наведении
            }

            // Настраиваем кнопку копирования (копируется ПОЛНЫЙ адрес)
            this.setupCopyButton(nonBounceableAddress);

        } catch (error) {
            console.error("Address formatting error:", error);
            this.showHexAddress(); // Показываем HEX если не удалось
        }
    }



    // Показ HEX адреса (если не удалось конвертировать)
    showHexAddress() {
        if (!this.walletAddress) return;

        const addressElement = document.getElementById("wallet-address");
        if (addressElement) {
            const addr = this.walletAddress;
            addressElement.textContent = addr.slice(0, 8) + '...' + addr.slice(-8);
        }
    }

    // Настройка кнопки копирования
    setupCopyButton(address) {
        const copyBtn = document.getElementById("copy-address-btn");
        if (!copyBtn) return;

        copyBtn.onclick = () => {
            navigator.clipboard.writeText(address)
                .then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = '✅ Copied!';
                    copyBtn.style.color = '#00D26A';

                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.style.color = '';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Copy failed:', err);
                    alert('Failed to copy address to clipboard');
                });
        };
    }

    // Подключение кошелька
    async connect() {
        try {
            if (!this.tonConnectUI) return;
            await this.tonConnectUI.openModal();
        } catch (error) {
            console.error("Connection error:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    }

    // Отключение кошелька
    async disconnect() {
        try {
            if (!this.tonConnectUI) return;
            await this.tonConnectUI.disconnect();
        } catch (error) {
            console.error("Disconnection error:", error);
        }
    }

    // Заглушка для баланса
    getMockBalance() {
        return Math.floor(Math.random() * 490) + 10;
    }

    // Обновление UI баланса
    updateBalanceUI() {
        const balanceElement = document.getElementById("balance");
        if (balanceElement) {
            balanceElement.textContent = this.userBalance.toFixed(2);
        }
    }

    // Обновление кнопки вывода
    updateWithdrawButton() {
        const withdrawBtn = document.getElementById("withdraw-btn");
        if (withdrawBtn) {
            const isDisabled = this.userBalance < 50 || !this.isWalletConnected;
            withdrawBtn.disabled = isDisabled;

            if (!isDisabled) {
                withdrawBtn.innerHTML = `
                    <img src="assets/icons/trf.png" alt=""> 
                    Withdraw ${this.userBalance.toFixed(2)} TRF
                `;
            } else {
                withdrawBtn.innerHTML = `
                    <img src="assets/icons/trf.png" alt=""> 
                    Withdraw TRF
                `;
            }
        }
    }

    // Добавление кнопки обновления баланса
    addRefreshButton() {
        const container = document.getElementById("balance-refresh-container");
        if (!container) return;

        // Удаляем существующую кнопку если есть
        this.removeRefreshButton();

        const btn = document.createElement("button");
        btn.id = "refresh-balance-btn";
        btn.textContent = "🔄 Refresh Balance";
        btn.className = "refresh-btn";
        btn.style.display = 'none'; // 🔥 Скрываем по умолчанию

        btn.addEventListener("click", async () => {
            if (!this.walletAddress) {
                alert("Please connect wallet first");
                return;
            }

            // Имитация загрузки баланса
            btn.textContent = "🔄 Loading...";
            btn.disabled = true;

            setTimeout(() => {
                this.userBalance = this.getMockBalance();
                this.updateBalanceUI();
                this.updateWithdrawButton();

                btn.textContent = "🔄 Refresh Balance";
                btn.disabled = false;
            }, 1000);
        });

        container.appendChild(btn);
    }

    // 🔥 Новый метод: управление видимостью кнопки
    updateRefreshButtonVisibility(activeTab) {
        const refreshBtn = document.getElementById("refresh-balance-btn");
        if (!refreshBtn) return;

        // Показываем кнопку только на вкладке Wallet
        if (activeTab === 'Wallet') {
            refreshBtn.style.display = 'block';
        } else {
            refreshBtn.style.display = 'none';
        }
    }

    // Удаление кнопки обновления баланса
    removeRefreshButton() {
        const btn = document.getElementById("refresh-balance-btn");
        if (btn) {
            btn.remove();
        }
    }

    // Вывод средств (заглушка)
    async withdrawFunds() {
        if (!this.isWalletConnected) {
            alert("Please connect your wallet first");
            return;
        }

        if (this.userBalance < 50) {
            alert(`Minimum withdrawal amount is 50 TRF. You have ${this.userBalance.toFixed(2)} TRF.`);
            return;
        }

        try {
            alert(`Withdrawal request for ${this.userBalance.toFixed(2)} TRF sent!\n\nThis is a demo.`);

            this.userBalance = 0;
            this.updateBalanceUI();
            this.updateWithdrawButton();

        } catch (error) {
            console.error("Withdrawal error:", error);
            alert("Withdrawal failed: " + error.message);
        }
    }
}

// Экспортируем создание экземпляра
export function initWallet(tonConnectUI) {
    const walletManager = new WalletManager();
    walletManager.initTonConnect();
    return walletManager;
}