export class AppConfig {
    private static _inMemoryKey: string = '';

    static setGeminiKey(key: string): void {
        this._inMemoryKey = key;
        if (key) {
            console.log("[AppConfig] Secure RAM-only Gemini API Key initialized");
        }
    }

    static get GEMINI_API_KEY(): string {
        // Priority 1: RAM-only storage (Most Secure)
        if (this._inMemoryKey) {
            return this._inMemoryKey;
        }

        // Priority 2: Fallback to environment variables (Default/Mock)
        const envKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;

        if (envKey) {
            console.log("[AppConfig] Using DEFAULT Gemini API Key from environment");
            return envKey;
        }

        return '';
    }

    static get IS_DEV(): boolean {
        return import.meta.env.DEV;
    }

    static get API_BASE_URL(): string {
        return import.meta.env.VITE_API_BASE_URL || '';
    }
}
