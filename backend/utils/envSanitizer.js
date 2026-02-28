/**
 * Environment Variable Sanitizer
 * Ensures all required environment variables are present and valid before the server starts.
 * This adheres to the Fail-Fast principle for security and reliability.
 */

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT'
];

const importantEnvVars = [
    'SMTP_USER',
    'SMTP_PASS',
    'GEMINI_API_KEY',
    'VITE_API_URL'
];

const sanitizeEnv = () => {
    const missingRequired = requiredEnvVars.filter(envVar => !process.env[envVar]);
    const missingImportant = importantEnvVars.filter(envVar => !process.env[envVar]);

    if (missingRequired.length > 0) {
        console.error('CRITICAL: Missing required environment variables:');
        missingRequired.forEach(envVar => console.error(`- ${envVar}`));
        console.error('Server cannot start without these variables.');
        process.exit(1);
    }

    if (missingImportant.length > 0) {
        console.warn('WARNING: Missing important environment variables:');
        missingImportant.forEach(envVar => console.warn(`- ${envVar}`));
        console.warn('Some features may not work correctly (Email, AI, Frontend API).');
    }

    console.log('✅ Environment variables sanitized.');
};

module.exports = sanitizeEnv;
