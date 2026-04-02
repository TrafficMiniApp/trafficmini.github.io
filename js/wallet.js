import { getTranslation } from './language.js';

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

            // 🔥 ПОКАЗЫВАЕМ ТОЛЬКО NON-BOUNCEABLE АДРЕС (как в Tonkeeper для отправки)
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

            // Пробуем использовать библиотеку @ton/core если доступна
            if (typeof window.TonCore !== 'undefined') {
                try {
                    const address = window.TonCore.Address.parse(this.walletAddress);
                    nonBounceableAddress = address.toString({
                        urlSafe: true,
                        bounceable: false, // 🔥 ТОЛЬКО NON-BOUNCEABLE
                        testOnly: false    // mainnet
                    });
                } catch (libError) {
                    console.warn("TON Core library error:", libError);
                    nonBounceableAddress = this.fallbackToNonBounceable(this.walletAddress);
                }
            } else {
                // Fallback если библиотека не загрузилась
                nonBounceableAddress = this.fallbackToNonBounceable(this.walletAddress);
            }

            // Обновляем UI
            const addressElement = document.getElementById("wallet-address");
            if (addressElement) {
                // Показываем сокращенный адрес: UQ......XXXX
                const shortAddress = nonBounceableAddress.slice(0, 8) + "..." + nonBounceableAddress.slice(-8);
                addressElement.textContent = shortAddress;
            }

            // Настраиваем кнопку копирования (копируется полный адрес)
            this.setupCopyButton(nonBounceableAddress);

        } catch (error) {
            console.error("Address formatting error:", error);
            this.showHexAddress(); // Показываем HEX если не удалось
        }
    }

    // 🔥 Fallback метод для конвертации HEX → Non-Bounceable
    fallbackToNonBounceable(hexAddress) {
        try {
            let workchainId = 0;
            let hashHex = '';

            // Обработка формата "workchain:hash" (Raw Address, стандарт TonConnect)
            if (hexAddress.includes(':')) {
                const parts = hexAddress.split(':');
                workchainId = parseInt(parts[0], 10);
                hashHex = parts[1];
            } else {
                // Если пришел чистый HEX (редкий случай для connect sdk)
                let cleanHex = hexAddress.startsWith('0x') ? hexAddress.slice(2) : hexAddress;
                if (cleanHex.length === 64) {
                    hashHex = cleanHex; // Предполагаем workchain 0
                } else {
                    console.warn("Unexpected address format:", hexAddress);
                    return hexAddress;
                }
            }

            // Проверка валидности хэша
            if (hashHex.length !== 64) {
                console.warn("Invalid hash length:", hashHex.length);
                return hexAddress;
            }

            // Флаги для non-bounceable адреса (mainnet)
            // 0x11 = Bounceable Mainnet (EQ)
            // 0x51 = Non-bounceable Mainnet (UQ)
            const flags = 0x51;

            // Собираем байты: [flags, workchain, ...hash]
            const bytes = new Uint8Array(34);
            bytes[0] = flags;
            bytes[1] = workchainId & 0xFF; // Корректная запись байта workchain

            // Конвертируем хэш из HEX в байты
            for (let i = 0; i < 32; i++) {
                bytes[i + 2] = parseInt(hashHex.slice(i * 2, i * 2 + 2), 16);
            }

            // Вычисляем CRC16
            const crc = this.calculateCRC16(bytes.slice(0, 34));

            // Добавляем CRC в конец
            const fullBytes = new Uint8Array(36);
            fullBytes.set(bytes);
            fullBytes[34] = (crc >> 8) & 0xFF;
            fullBytes[35] = crc & 0xFF;

            // Конвертируем в base64 (URL-safe)
            let binary = '';
            for (let i = 0; i < fullBytes.length; i++) {
                binary += String.fromCharCode(fullBytes[i]);
            }

            const base64 = btoa(binary)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            return base64;

        } catch (error) {
            console.error("Fallback conversion error:", error);
            return hexAddress;
        }
    }

    // Вспомогательный метод для CRC16 (Poly: 0x1021)
    calculateCRC16(data) {
        let crc = 0;
        for (let i = 0; i < data.length; i++) {
            let x = (crc >> 8) ^ data[i];
            x ^= x >> 4;
            crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xFFFF;
        }
        return crc;
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
                    copyBtn.textContent = getTranslation('copied', '✅ Copied!');
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