export function initUI() {
    setupNavigation();
}

export function setupEventListeners() {
    document.addEventListener('click', function(event) {
        const languageMenu = document.getElementById('language-menu');
        const languageSwitcher = document.querySelector('.language-switcher');
        
        if (languageMenu && languageSwitcher) {
            if (!languageMenu.contains(event.target) && !languageSwitcher.contains(event.target)) {
                languageMenu.classList.remove('show');
            }
        }
    });
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок
            navItems.forEach(b => b.classList.remove('active'));
            
            // Убираем активный класс у всех вкладок
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке
            btn.classList.add('active');
            
            // Активируем соответствующую вкладку
            const selectedTab = btn.getAttribute('data-tab');
            const tabElement = document.getElementById(selectedTab);
            if (tabElement) {
                tabElement.classList.add('active');
            }
        });
    });
}