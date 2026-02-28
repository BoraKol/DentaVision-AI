try {
    const { GoogleGenAI } = require('@google/genai');
    console.log('Successfully loaded GoogleGenAI from @google/genai');
    console.log('Type:', typeof GoogleGenAI);
} catch (error) {
    console.error('Failed to load @google/genai:', error.message);
}
