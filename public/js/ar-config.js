class ARConfig {
    constructor() {
        this.scene = document.querySelector('a-scene');
        this.video = null;
        this.mediaStream = null;
        this.arSystem = null;
    }

    async initialize() {
        try {
            // 1. Получаем доступ к камере
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            // 2. Создаем видео элемент
            await this.setupVideo();

            // 3. Ждем полной инициализации сцены
            await new Promise(resolve => {
                this.scene.addEventListener('loaded', () => {
                    this.arSystem = this.scene.systems['arjs'];
                    resolve();
                });
            });

            // 4. Проверяем наличие AR системы
            if (!this.arSystem) {
                throw new Error('AR.js система не инициализирована');
            }

            // 5. Конфигурируем AR
            this.arSystem.configure({
                sourceType: 'webcam',
                source: this.video,
                maxDetectionRate: 60,
                canvasWidth: this.video.videoWidth,
                canvasHeight: this.video.videoHeight
            });

            // 6. Перезапускаем систему
            this.arSystem._arAnchorSystem.stop();
            this.arSystem._arAnchorSystem.start();

        } catch(error) {
            throw error;
        }
    }

    async setupVideo() {
        return new Promise((resolve) => {
            this.video = document.createElement('video');
            this.video.srcObject = this.mediaStream;
            this.video.setAttribute('playsinline', '');
            this.video.setAttribute('muted', '');
            
            this.video.onloadedmetadata = () => {
                this.video.play();
                resolve();
            };
        });
    }

    cleanup() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
    }
}
