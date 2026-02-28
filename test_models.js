import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env");
        return;
    }

    try {
        const client = new GoogleGenAI({ apiKey });
        console.log("Fetching models...");
        // Usually there is a listModels method in these SDKs
        // If not, we can try to probe standard ones
        const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-2.0-flash-lite-preview-02-05'];
        
        for (const model of models) {
            try {
                await client.models.generateContent({
                    model: model,
                    contents: "hi",
                });
                console.log(`✅ ${model} is AVAILABLE`);
            } catch (e) {
                console.log(`❌ ${model} failed with: ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
