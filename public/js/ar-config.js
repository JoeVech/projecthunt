class ARConfig {
    constructor() {
        this.scene = document.querySelector('a-scene');
        this.video = null;
        this.mediaStream = null;
    }

    async initialize() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            this.setupVideo();
            this.configureARSystem();

        } catch (error) {
            throw error;
        }
    }

    setupVideo() {
        this.video = document.createElement('video');
        this.video.srcObject = this.mediaStream;
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('muted', '');
        this.video.play();
    }

    configureARSystem() {
        const arSystem = this.scene.systems['arjs'];

        arSystem.configure({
            sourceType: 'webcam',
            source: this.video,
            maxDetectionRate: 60
        });

        arSystem._arAnchorSystem.stop();
        arSystem._arAnchorSystem.start();
    }

    cleanup() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
    }
}