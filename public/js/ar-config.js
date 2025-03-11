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
            console.log('Requesting camera access...');
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            // 2. Создаем видео элемент
            console.log('Creating video element...');
            await this.setupVideo();

            // 3. Ожидаем полной загрузки сцены
            console.log('Waiting for scene load...');
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => 
                    reject(new Error('Scene load timeout')), 5000
                );
                
                this.scene.addEventListener('loaded', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });

            // 4. Получаем AR систему
            console.log('Getting AR system...');
            this.arSystem = this.scene.systems['arjs'];
            
            if (!this.arSystem) {
                throw new Error('AR.js system not found!');
            }

            // 5. Конфигурируем AR
            console.log('Configuring AR...');
            this.arSystem.configure({
                sourceType: 'webcam',
                source: this.video,
                maxDetectionRate: 60
            });

            // 6. Перезапускаем систему
            console.log('Restarting AR...');
            this.arSystem._arAnchorSystem.stop();
            this.arSystem._arAnchorSystem.start();

            return true;

        } catch(error) {
            console.error('AR Init Error:', error);
            throw error;
        }
    }

    async setupVideo() {
        return new Promise((resolve) => {
            this.video = document.createElement('video');
            this.video.srcObject = this.mediaStream;
            this.video.playsInline = true;
            this.video.muted = true;
            
            this.video.onloadedmetadata = () => {
                this.video.play()
                    .then(resolve)
                    .catch(error => {
                        console.warn('Video play warning:', error);
                        resolve();
                    });
            };
        });
    }

    cleanup() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
    }
}
