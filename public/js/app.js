class Game {
    constructor() {
        this.initDebugTools();
        this.tg = new TelegramIntegration();
        this.ar = new ARConfig();
        this.initUI();
    }

    initDebugTools() {
        window.appDebug = {
            log: (message) => {
                const timestamp = new Date().toISOString().substr(11, 12);
                console.log(`[${timestamp}] DEBUG: ${message}`);
            },
            showForceReload: () => {
                const btn = document.createElement('button');
                btn.textContent = 'Экстренная перезагрузка';
                btn.style.position = 'fixed';
                btn.style.bottom = '20px';
                btn.style.right = '20px';
                btn.style.zIndex = 10000;
                btn.onclick = () => window.location.reload();
                document.body.appendChild(btn);
            }
        };
    }

    initUI() {
        this.startButton = document.getElementById('startButton');
        this.status = document.getElementById('status');
        
        this.startButton.onclick = () => {
            window.appDebug.log('Кнопка активации нажата');
            this.startAR();
        };
    }

    async startAR() {
        try {
            window.appDebug.showForceReload();
            this.lockUI();
            
            window.appDebug.log('Начало инициализации AR');
            await this.ar.initialize();
            
            window.appDebug.log('AR успешно инициализирован');
            this.showScene();
            
            this.setupEventListeners();

        } catch(error) {
            window.appDebug.log(`Ошибка инициализации: ${error.message}`);
            this.handleError(error);
        }
    }

    lockUI() {
        this.startButton.disabled = true;
        this.status.textContent = 'Инициализация...';
        this.status.style.color = 'yellow';
    }

    showScene() {
        document.querySelector('.loader').classList.add('hidden');
        document.querySelector('a-scene').classList.remove('hidden');
        this.status.textContent = 'Ищите плоскую поверхность...';
        this.status.style.color = 'white';
    }

    setupEventListeners() {
        this.ar.scene.addEventListener('arjs-plane-detected', () => {
            window.appDebug.log('Плоскость обнаружена');
            document.getElementById('animal').setAttribute('visible', 'true');
            this.status.classList.add('hidden');
        });
    }

    handleError(error) {
        console.error('Critical Error:', error);
        this.status.innerHTML = this.getErrorMessageHtml(error);
        this.status.style.color = 'red';
        this.ar.cleanup();
    }

    getErrorMessageHtml(error) {
        const messages = {
            'NotAllowedError': `
                <div class="error-header">🔐 Требуется доступ к камере</div>
                <div class="error-description">
                    1. Нажмите на иконку замка в адресной строке<br>
                    2. Выберите "Настройки сайта"<br>
                    3. Разрешите доступ к камере
                </div>
            `,
            'TimeoutError': `
                <div class="error-header">⏳ Таймаут инициализации</div>
                <div class="error-description">
                    Попробуйте:<br>
                    1. Перезагрузить страницу<br>
                    2. Проверить интернет-соединение<br>
                    3. Закрыть другие приложения, использующие камеру
                </div>
            `,
            'default': `
                <div class="error-header">⚠️ Критическая ошибка</div>
                <div class="error-description">
                    ${error.message}<br>
                    Код ошибки: ${error.name}
                </div>
            `
        };

        return `
            <div class="error-container">
                ${messages[error.name] || messages.default}
                <button class="retry-button" onclick="window.location.reload()">
                    ⟳ Попробовать снова
                </button>
                <div class="debug-info">
                    ${JSON.stringify(window.APP_DEBUG, null, 2)}
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
    console.log('APP_DEBUG:', window.APP_DEBUG);
});
