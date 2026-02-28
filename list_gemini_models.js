import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || 'AIza...'; // Replace with user's key if needed
    console.log("Checking API Key availability...");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            return;
        }

        console.log("✅ Available Models:");
        data.models.forEach(m => {
            console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods.join(', ')})`);
        });
    } catch (error) {
        console.error("❌ Fetch Error:", error.message);
    }
}

listModels();
