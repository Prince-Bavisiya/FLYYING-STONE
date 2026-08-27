require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

async function runSayHelloTest() {
    const key = process.env.GEMINI_API_KEY || "";
    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const hasKey = key ? "YES" : "NO";
    const prefix = key.startsWith("AQ.") ? "AQ." : (key ? key.substring(0, 4) : "N/A");

    console.log("=== GEMINI STANDALONE AUTHENTICATION TEST ===");
    console.log(`Gemini key loaded: ${hasKey}`);
    console.log(`Key type/prefix: ${prefix}`);
    console.log(`Model: ${model}`);

    if (!key) {
        console.error("\nGEMINI TEST: AUTHENTICATION FAILED");
        console.error("Error: GEMINI_API_KEY is missing from environment variables.");
        return;
    }

    const ai = new GoogleGenAI({ apiKey: key });

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: "Say hello in one sentence."
        });

        console.log("\nHTTP success/failure: SUCCESS (HTTP 200 equivalent)");
        console.log(`Response text: "${response.text.trim()}"`);
        console.log("\nGEMINI TEST: SUCCESS");
    } catch (err) {
        const status = err.status || err.statusCode || 401;
        const msg = err.message || err.toString();
        
        console.log(`\nHTTP success/failure: FAILURE (HTTP ${status} equivalent)`);
        console.log(`Error status: ${status}`);
        console.log(`Error category/message: ${msg}`);
        
        console.log("\nGEMINI TEST: AUTHENTICATION FAILED");
    }
}

runSayHelloTest();
