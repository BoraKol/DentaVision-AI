export class AppConfig {
    static get GEMINI_API_KEY(): string {
        // First check local storage (User provided key)
        const localKey = localStorage.getItem('denta_vision_gemini_key');
        if (localKey) return localKey;

        // Fallback to environment variables
        const key = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;

        if (!key) {
            // Don't warn here to avoid spamming console if user hasn't set it yet
            return '';
        }
        return key;
    }

    static get IS_DEV(): boolean {
        return import.meta.env.DEV;
    }

    static get API_BASE_URL(): string {
        return import.meta.env.VITE_API_BASE_URL || '';
    }
}
