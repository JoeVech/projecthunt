class Game {
    constructor() {
        this.tg = new TelegramIntegration();
        this.ar = new ARConfig();
        this.initUI();
        this.bindEvents();
    }

    initUI() {
        this.startButton = document.getElementById('startButton');
        this.status = document.getElementById('status');
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => this.startAR());
    }

    async startAR() {
        try {
            this.startButton.disabled = true;
            this.status.textContent = 'Инициализация AR...';
            
            await this.ar.initialize();
            
            document.querySelector('.loader').classList.add('hidden');
            document.querySelector('a-scene').classList.remove('hidden');
            
            this.setupEventListeners();

        } catch(error) {
            this.handleError(error);
        }
    }

    setupEventListeners() {
        this.ar.scene.addEventListener('arjs-plane-detected', () => {
            document.getElementById('animal').setAttribute('visible', 'true');
            this.status.classList.add('hidden');
        });
    }

    handleError(error) {
        console.error('AR Error:', error);
        this.status.innerHTML = `
            ${this.getErrorMessage(error)}<br>
            <button onclick="location.reload()">Перезагрузить</button>
        `;
        this.ar.cleanup();
    }

    getErrorMessage(error) {
        const messages = {
            'NotAllowedError': '🔒 Разрешите доступ к камере',
            'NotFoundError': '📷 Камера не найдена',
            'NotReadableError': '⚠️ Ошибка доступа к камере',
            'OverconstrainedError': '🚫 Неподдерживаемые параметры',
            'Error': `AR.js: ${error.message}`
        };
        return messages[error.name] || error.message;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => new Game());
