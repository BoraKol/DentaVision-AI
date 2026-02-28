export class AppConfig {
    static get GEMINI_API_KEY(): string {
        // First check stored user profile (Secure database storage)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.geminiApiKey) {
                    console.log("[AppConfig] Using SECURE Gemini API Key from User Profile");
                    return user.geminiApiKey;
                }
            } catch (e) {
                console.error('Failed to parse user for API key');
            }
        }

        // Fallback to environment variables
        const key = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;

        if (!key) {
            return '';
        }
        console.log("[AppConfig] Using DEFAULT Gemini API Key from environment");
        return key;
    }

    static get IS_DEV(): boolean {
        return import.meta.env.DEV;
    }

    static get API_BASE_URL(): string {
        return import.meta.env.VITE_API_BASE_URL || '';
    }
}
