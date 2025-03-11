class Game {
    constructor() {
        this.tg = new TelegramIntegration();
        this.ar = new ARConfig();
        this.initUI();
    }

    initUI() {
        this.startButton = document.getElementById('startButton');
        this.status = document.getElementById('status');

        this.startButton.addEventListener('click', () => this.startGame());
    }

    async startGame() {
        try {
            this.startButton.disabled = true;
            this.status.textContent = 'Инициализация камеры...';

            await this.ar.initialize();

            document.querySelector('.loader').classList.add('hidden');
            document.querySelector('a-scene').classList.remove('hidden');

            this.setupAREvents();

        } catch (error) {
            this.handleError(error);
        }
    }

    setupAREvents() {
        this.ar.scene.addEventListener('arjs-plane-detected', () => {
            document.getElementById('animal').setAttribute('visible', 'true');
            this.status.classList.add('hidden');
        });
    }

    handleError(error) {
        console.error('Game Error:', error);
        this.status.innerHTML = `
            Ошибка: ${error.name}<br>
            ${this.errorMessage(error)}
        `;
        this.startButton.disabled = false;
        this.ar.cleanup();
    }

    errorMessage(error) {
        const messages = {
            'NotAllowedError': 'Доступ к камере запрещен',
            'NotFoundError': 'Камера не найдена',
            'NotReadableError': 'Ошибка доступа к камере',
            'OverconstrainedError': 'Неподдерживаемые параметры камеры'
        };
        return messages[error.name] || error.message;
    }
}

// Инициализация игры
window.addEventListener('DOMContentLoaded', () => new Game());