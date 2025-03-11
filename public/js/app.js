class Game {
    constructor() {
        this.initConstants();
        this.initElements();
        this.initEventListeners();
        this.initDebugger();
        this.checkDependencies();
        this.tgIntegration = new TelegramIntegration();
        this.arConfig = new ARConfig();
    }

    initConstants() {
        this.constants = {
            LOADING_DELAY: 5000,
            ERROR_MESSAGES: {
                NO_AFRAME: 'Требуется A-Frame. Обновите страницу.',
                NO_ARJS: 'AR.js не загружен. Проверьте интернет.',
                NO_CAMERA: 'Доступ к камере запрещен.',
                INIT_TIMEOUT: 'Превышено время инициализации.',
                UNKNOWN_ERROR: 'Неизвестная ошибка.'
            }
        };
    }

    initElements() {
        this.elements = {
            loader: document.querySelector('.loader'),
            startButton: document.getElementById('startButton'),
            status: document.getElementById('status'),
            scene: document.querySelector('a-scene'),
            animal: document.getElementById('animal'),
            spinner: document.querySelector('.loading-spinner')
        };
    }

    initEventListeners() {
        this.elements.startButton.addEventListener('click', () => this.startAR());
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    initDebugger() {
        window.appDebug = {
            log: (message) => console.log(`[DEBUG][${new Date().toISOString()}] ${message}`),
            state: () => ({
                aframe: !!window.AFRAME,
                arjs: !!window.ARjs,
                sceneReady: this.elements.scene.getAttribute('data-loaded') === 'true',
                cameraAccess: navigator.mediaDevices ? true : false
            })
        };
    }

    async checkDependencies() {
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                const { aframe, arjs } = window.appDebug.state();
                
                if (aframe && arjs) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    async startAR() {
        try {
            this.setLoadingState(true);
            await this.validatePrerequisites();
            await this.arConfig.initialize();
            this.initARSession();
            
        } catch (error) {
            this.handleError(error);
        }
    }

    async validatePrerequisites() {
        const { aframe, arjs, cameraAccess } = window.appDebug.state();
        
        if (!aframe) throw new Error(this.constants.ERROR_MESSAGES.NO_AFRAME);
        if (!arjs) throw new Error(this.constants.ERROR_MESSAGES.NO_ARJS);
        if (!cameraAccess) throw new Error(this.constants.ERROR_MESSAGES.NO_CAMERA);
    }

    setLoadingState(loading) {
        this.elements.startButton.disabled = loading;
        this.elements.spinner.classList.toggle('hidden', !loading);
        this.elements.status.textContent = loading 
            ? 'Инициализация AR...' 
            : 'Готов к работе!';
    }

    initARSession() {
        this.elements.scene.addEventListener('loaded', () => {
            this.elements.scene.setAttribute('data-loaded', 'true');
            this.elements.loader.classList.add('hidden');
            this.elements.scene.classList.remove('hidden');
            this.setupARTracking();
        });
    }

    setupARTracking() {
        let timeout = setTimeout(() => {
            this.handleError(new Error(this.constants.ERROR_MESSAGES.INIT_TIMEOUT));
        }, this.constants.LOADING_DELAY);

        this.elements.scene.addEventListener('arjs-plane-detected', () => {
            clearTimeout(timeout);
            this.elements.animal.setAttribute('visible', 'true');
            this.elements.status.classList.add('hidden');
        });
    }

    handleError(error) {
        console.error('AR Error:', error);
        this.setLoadingState(false);
        this.showErrorOverlay(error);
        this.cleanup();
    }

    showErrorOverlay(error) {
        const errorMessage = error.message || this.constants.ERROR_MESSAGES.UNKNOWN_ERROR;
        document.body.innerHTML = `
            <div class="error-overlay">
                <div class="error-content">
                    <h2>🚨 Ошибка AR</h2>
                    <p>${errorMessage}</p>
                    <div class="error-actions">
                        <button onclick="window.location.reload()">⟳ Обновить</button>
                        ${this.tgIntegration.isWebApp ? 
                            `<button onclick="Telegram.WebApp.close()">✖️ Закрыть</button>` : ''}
                    </div>
                    <details class="error-details">
                        <summary>Техническая информация</summary>
                        <pre>${error.stack || 'Нет дополнительной информации'}</pre>
                    </details>
                </div>
            </div>
        `;
    }

    cleanup() {
        if (this.arConfig) {
            this.arConfig.cleanup();
        }
        window.appDebug.log('Ресурсы очищены');
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.app = game;
    window.appDebug.log('Приложение инициализировано');
});
