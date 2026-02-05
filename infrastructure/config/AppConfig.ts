export class AppConfig {
    static get GEMINI_API_KEY(): string {
        const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (!key) {
            console.warn("API Key is missing in environment variables");
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
