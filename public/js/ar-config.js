class ARConfig {
    constructor() {
        this.scene = document.querySelector('a-scene');
        this.video = null;
        this.mediaStream = null;
        this.arSystem = null;
        this.loadTimeout = null;
    }

    async initialize() {
        try {
            // Шаг 1: Проверка поддержки медиаустройств
            if (!navigator.mediaDevices) {
                throw new Error('Браузер не поддерживает доступ к камере');
            }

            // Шаг 2: Запрос разрешения камеры
            window.APP_DEBUG.cameraAllowed = await this.checkCameraPermission();
            if (!window.APP_DEBUG.cameraAllowed) {
                throw new Error('Доступ к камере запрещен');
            }

            // Шаг 3: Получение видеопотока
            this.mediaStream = await this.getCameraStream();
            
            // Шаг 4: Создание видео элемента
            this.video = await this.createVideoElement();
            
            // Шаг 5: Инициализация сцены с таймаутом
            await this.initializeSceneWithTimeout(5000);
            
            // Шаг 6: Проверка AR системы
            this.arSystem = this.getARSystem();
            
            // Шаг 7: Конфигурация AR
            this.configureAR();
            
            return true;

        } catch(error) {
            this.cleanup();
            throw error;
        }
    }

    async checkCameraPermission() {
        try {
            const permission = await navigator.permissions.query({ name: 'camera' });
            return permission.state === 'granted';
        } catch {
            return null;
        }
    }

    async getCameraStream() {
        try {
            return await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
        } catch(error) {
            throw new Error(`Ошибка доступа к камере: ${error.message}`);
        }
    }

    async createVideoElement() {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.srcObject = this.mediaStream;
            video.playsInline = true;
            video.muted = true;
            
            video.onloadedmetadata = () => {
                video.play().then(() => resolve(video)).catch(reject);
            };
            
            video.onerror = reject;
        });
    }

    initializeSceneWithTimeout(timeout) {
        return new Promise((resolve, reject) => {
            this.loadTimeout = setTimeout(() => {
                reject(new Error('Таймаут загрузки сцены'));
            }, timeout);

            this.scene.addEventListener('loaded', () => {
                clearTimeout(this.loadTimeout);
                window.APP_DEBUG.sceneLoaded = true;
                resolve();
            });
        });
    }

    getARSystem() {
        const arSystem = this.scene.systems['arjs'];
        if (!arSystem) {
            throw new Error('AR.js система не обнаружена');
        }
        window.APP_DEBUG.arSystemReady = true;
        return arSystem;
    }

    configureAR() {
        this.arSystem.configure({
            sourceType: 'webcam',
            source: this.video,
            maxDetectionRate: 60,
            canvasWidth: this.video.videoWidth,
            canvasHeight: this.video.videoHeight
        });

        this.arSystem._arAnchorSystem.stop();
        this.arSystem._arAnchorSystem.start();
    }

    cleanup() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
        }
    }
}
