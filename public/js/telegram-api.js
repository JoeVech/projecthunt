class TelegramIntegration {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.init();
    }

    init() {
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.applyTheme();
        }
    }

    applyTheme() {
        if (this.tg?.themeParams) {
            document.body.style.backgroundColor = this.tg.themeParams.bg_color || '#000';
            document.body.style.color = this.tg.themeParams.text_color || '#fff';
        }
    }

    get user() {
        return this.tg?.initDataUnsafe?.user || null;
    }
}