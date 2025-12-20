// Экспортируем управление кошельком
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

            // Проверяем текущее состояние
            this.checkConnection();
            
            // Подписываемся на изменения
            this.tonConnectUI.onStatusChange(this.handleWalletStatusChange.bind(this));
            
            return this.tonConnectUI;
        } catch (error) {
            console.error("TonConnect initialization error:", error);
            return null;
        }
    }

    // Проверяем существующее подключение
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

    // Обработчик изменения состояния кошелька
    async handleWalletStatusChange(wallet) {
        console.log("Wallet status changed:", wallet);

        const walletInfo = document.getElementById("wallet-info");
        const walletAddressElement = document.getElementById("wallet-address");
        const withdrawBtn = document.getElementById("withdraw-btn");
        const connectBtn = document.getElementById("connect-wallet-btn");

        if (wallet && wallet.account) {
            this.walletAddress = wallet.account.address;
            this.isWalletConnected = true;

            // Обновляем UI
            if (walletInfo) {
                walletInfo.classList.remove("hidden");
            }
            
            if (walletAddressElement) {
                const addr = this.walletAddress;
                walletAddressElement.textContent = `${addr.slice(0, 6)}...${addr.slice(-4)}`;
            }

            // Активируем кнопку вывода
            if (withdrawBtn) {
                withdrawBtn.disabled = false;
            }

            // Меняем текст кнопки подключения
            if (connectBtn) {
                connectBtn.innerHTML = '<img src="assets/icons/ton-icon.png" alt=""> Disconnect';
                connectBtn.onclick = () => this.disconnect();
            }

            // Загружаем баланс
            await this.fetchBalance();
            this.updateBalanceUI();

        } else {
            // Сброс состояния
            this.walletAddress = '';
            this.isWalletConnected = false;
            this.userBalance = 0;

            if (walletInfo) {
                walletInfo.classList.add("hidden");
            }

            if (withdrawBtn) {
                withdrawBtn.disabled = true;
            }

            if (connectBtn) {
                connectBtn.innerHTML = '<img src="assets/icons/ton-icon.png" alt=""> Connect Wallet';
                connectBtn.onclick = () => this.connect();
            }
        }
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

    // Загрузка баланса с бэкенда
    async fetchBalance() {
        if (!this.walletAddress) return 0;
        
        try {
            // TODO: Замени на реальный URL твоего бэкенда
            const response = await fetch(`https://trafficbackend-vhqy.onrender.com/wallet/balance?address=${this.walletAddress}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            this.userBalance = data.result || 0;
            return this.userBalance;
        } catch (error) {
            console.error("Balance fetch error:", error);
            this.userBalance = 0;
            return 0;
        }
    }

    // Вывод средств
    async withdrawFunds() {
        if (!this.isWalletConnected) {
            alert("Please connect your wallet first");
            return;
        }

        if (this.userBalance < 50) {
            alert("Minimum withdrawal amount is 50 TRF");
            return;
        }

        // TODO: Реализовать транзакцию через смарт-контракт
        try {
            // Пример: отправка транзакции
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
                messages: [
                    {
                        address: this.walletAddress,
                        amount: "1000000000", // 1 TON в нанотонах
                        payload: "Withdraw TRF tokens"
                    }
                ]
            };

            const result = await this.tonConnectUI.sendTransaction(transaction);
            console.log("Transaction sent:", result);

            // Обновляем баланс после успешного вывода
            this.userBalance = 0;
            this.updateBalanceUI();
            
            alert("Withdrawal request sent successfully!");
        } catch (error) {
            console.error("Withdrawal error:", error);
            alert("Withdrawal failed: " + error.message);
        }
    }

    // Обновление UI баланса
    updateBalanceUI() {
        const balanceElement = document.getElementById("balance");
        if (balanceElement) {
            balanceElement.textContent = this.userBalance.toFixed(2);
        }

        const withdrawBtn = document.getElementById("withdraw-btn");
        if (withdrawBtn) {
            withdrawBtn.disabled = this.userBalance < 50;
        }
    }

    // Добавление кнопки обновления баланса
    addRefreshButton() {
        const container = document.querySelector(".balance-container");
        if (!container) return;

        // Удаляем существующую кнопку
        const existingBtn = document.getElementById("refresh-balance-btn");
        if (existingBtn) existingBtn.remove();

        // Создаем новую кнопку
        const btn = document.createElement("button");
        btn.id = "refresh-balance-btn";
        btn.textContent = "🔄 Refresh";
        btn.className = "submit";

        btn.addEventListener("click", async () => {
            if (!this.walletAddress) {
                alert("Please connect wallet first");
                return;
            }
            await this.fetchBalance();
            this.updateBalanceUI();
        });

        container.appendChild(btn);
    }

    // Получение текущего адреса
    getAddress() {
        return this.walletAddress;
    }

    // Проверка подключения
    isConnected() {
        return this.isWalletConnected;
    }

    // Получение баланса
    getBalance() {
        return this.userBalance;
    }
}
