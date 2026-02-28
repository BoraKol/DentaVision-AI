export const APP_CONSTANTS = {
    APP_NAME: 'DentaVision AI',
    VERSION: '2.0 Beta',
    API: {
        TIMEOUT_MS: 30000,
        RETRY_ATTEMPTS: 3
    },
    MODELS: {
        TEXT: "gemini-flash-latest",
        VISION: "gemini-flash-latest"
    }
};

export const ERROR_MESSAGES = {
    API_KEY_MISSING: "API Key is missing. Please check your configuration.",
    ANALYSIS_FAILED: "Analysis failed. Please try again.",
    IMAGE_UPLOAD_ERROR: "Failed to upload image.",
    NETWORK_ERROR: "Network error. Please check your connection."
};
