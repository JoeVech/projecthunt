class Game {
    constructor() {
        this.tg = new TelegramIntegration();
        this.ar = new ARConfig();
        this.initUI();
    }

    initUI() {
        this.startButton = document.getElementById('startButton');
        this.status = document.getElementById('status');
        
        this.startButton.addEventListener('click', () => this.startAR());
    }

    async startAR() {
        try {
            this.startButton.disabled = true;
            this.status.textContent = 'Инициализация...';
            
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
            console.log('Plane detected!');
            document.getElementById('animal').setAttribute('visible', 'true');
            this.status.classList.add('hidden');
        });
    }

    handleError(error) {
        let message = 'Неизвестная ошибка';
        
        const errorMap = {
            'NotAllowedError': 'Разрешите доступ к камере в настройках браузера',
            'NotFoundError': 'Камера не найдена',
            'NotReadableError': 'Ошибка доступа к камере',
            'OverconstrainedError': 'Неподдерживаемые параметры камеры'
        };

        if (error.message.includes('AR.js system')) {
            message = 'Ошибка AR системы. Перезагрузите страницу.';
        } else {
            message = errorMap[error.name] || error.message;
        }

        this.status.innerHTML = `
            <div class="error-message">
                ${message}<br>
                <button onclick="window.location.reload()">Перезагрузить</button>
            </div>
        `;
        this.ar.cleanup();
    }
}
