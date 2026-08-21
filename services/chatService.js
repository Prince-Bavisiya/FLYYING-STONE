const db = require("../config/db").promise;
const ollama = require("../config/ollamaConfig");
const systemPrompt = require("../prompts/systemPrompt");

let requestCounter = 0;

const generateWithOllama = async (modelName, sanitizedHistory, liveSystemPrompt) => {
    const response = await ollama.chat({
        model: modelName,
        messages: [
            {
                role: "system",
                content: liveSystemPrompt,
            },
            ...sanitizedHistory,
        ],
    });
    return response.message.content;
};

const generateWithGemini = async (modelName, sanitizedHistory, liveSystemPrompt) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    const contents = sanitizedHistory.map((msg) => {
        const geminiRole = msg.role === "assistant" ? "model" : "user";
        return {
            role: geminiRole,
            parts: [{ text: msg.content }]
        };
    });

    const requestBody = {
        contents: contents,
        systemInstruction: {
            parts: [{ text: liveSystemPrompt }]
        }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        let parsedError;
        try {
            parsedError = JSON.parse(errorText);
        } catch (e) {}
        const errorMsg = parsedError?.error?.message || errorText || `HTTP status ${response.status}`;
        const err = new Error(errorMsg);
        err.status = response.status;
        err.responseBody = parsedError;
        throw err;
    }

    const responseData = await response.json();
    const reply = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
        throw new Error("Empty response received from Gemini API.");
    }

    return reply;
};

const sanitizeAndLimitMessages = (messages, limit = 6) => {
    if (!Array.isArray(messages)) return [];
    
    // 1. Filter out empty, non-object, invalid messages and warnings/errors
    const validMessages = messages
        .filter((m) => {
            if (!m || typeof m !== "object") return false;
            if (!["user", "assistant", "system"].includes(m.role)) return false;
            if (typeof m.content !== "string" || !m.content.trim()) return false;
            
            // Skip assistant messages that look like system errors
            if (m.role === "assistant") {
                const contentLower = m.content.toLowerCase();
                if (
                    contentLower.includes("sorry, i could not connect") || 
                    contentLower.includes("verify ollama is running") ||
                    contentLower.includes("failed to generate ai response")
                ) {
                    return false;
                }
            }
            return true;
        })
        .map((m) => ({
            role: m.role,
            content: m.content.trim()
        }));

    // 2. Keep only the latest N messages
    return validMessages.slice(-limit);
};

const generateChatResponse = async (messages) => {
    try {
        if (!messages || messages.length === 0) {
            throw new Error("No messages provided.");
        }

        const latestUserMessage = messages[messages.length - 1].content || "";
        const lowerMessage = latestUserMessage.trim().toLowerCase();

        // 1. Instant Heuristic Rejection for common off-topic categories
        const offTopicKeywords = [
            "healthminister", "helthminister", "health minister", "prime minister", "president", "politics", "politician",
            "weather", "math", "science", "history", "geography", "calculate", "coding", "programming", "python", 
            "javascript", "html", "css", "c++", "java", "code", "capital of", "population of", "who is the health minister",
            "current health minister"
        ];

        const isHeuristicOffTopic = offTopicKeywords.some(keyword => lowerMessage.includes(keyword));

        // 2. Few-shot Classification Rejection using Ollama
        let isClassifierOffTopic = false;
        if (!isHeuristicOffTopic) {
            const systemInstruction = `You are an AI routing assistant. Decide if the user's query is "on-topic" (fashion, clothes, outfits, shopping, store products, size help, greetings like hello/hi) or "off-topic" (history, math, coding, programming, coding help, politics, health, geography, science, general knowledge, other brands). Respond with ONLY the words "on-topic" or "off-topic".`;
            const classifierMessages = [
                { role: "system", content: systemInstruction },
                { role: "user", content: "hello" },
                { role: "assistant", content: "on-topic" },
                { role: "user", content: "what is the weather today?" },
                { role: "assistant", content: "off-topic" },
                { role: "user", content: "suggest a casual shirt" },
                { role: "assistant", content: "on-topic" },
                { role: "user", content: "what is india's health minister?" },
                { role: "assistant", content: "off-topic" },
                { role: "user", content: "today anything update?" },
                { role: "assistant", content: "on-topic" },
                { role: "user", content: "write python code" },
                { role: "assistant", content: "off-topic" },
                { role: "user", content: latestUserMessage }
            ];

            try {
                const classResponse = await ollama.chat({
                    model: process.env.OLLAMA_MODEL,
                    messages: classifierMessages,
                    options: {
                        temperature: 0.0,
                        num_predict: 10
                    }
                });
                const result = classResponse.message.content.trim().toLowerCase();
                if (result.includes("off-topic")) {
                    isClassifierOffTopic = true;
                }
            } catch (classError) {
                console.warn("[Guardrail Classifier warning] Failed to classify, defaulting to on-topic:", classError.message);
            }
        }

        if (isHeuristicOffTopic || isClassifierOffTopic) {
            console.log(`[Guardrail Rejection] Query "${latestUserMessage}" flagged as off-topic.`);
            return "I am only programmed to assist with fashion recommendations, styling, and ZAYRO store queries. \n\nHow can I help you find the perfect outfit today?";
        }

        // 3. Real-time Trends query check
        const trendKeywords = [
            "trending today", "today's fashion", "today fashion", "new today", "fashion update", 
            "latest trends", "trending now", "latest fashion", "current trends", "trending highlights",
            "today anything update", "today updates", "trending updates", "what is trending", 
            "anything new", "update today", "fashion update today"
        ];
        const isTrendQuery = trendKeywords.some(keyword => lowerMessage.includes(keyword));
        if (isTrendQuery) {
            console.log(`[Trend Query Guard] Query "${latestUserMessage}" matches trend keywords.`);
            return "I am programmed to assist with fashion recommendations, styling, and queries about the ZAYRO store catalog. While I don't have access to live real-time internet trend updates or today's global fashion news, I can recommend the perfect outfits and latest arrivals from our available ZAYRO collection! Would you like me to suggest something from our catalog?";
        }

        const geminiModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";

        // Fetch real-time products catalog and stock from database
        const [products] = await db.query(
            "SELECT name, description, price, category, stock FROM products"
        );

        // Format product details into context string
        const productContext = products
            .map(
                (p) =>
                    `- "${p.name}" | Price: $${p.price} | Category: ${p.category} | Stock: ${p.stock} units | Description: ${p.description || "No description"}`
            )
            .join("\n");

        const liveSystemPrompt = `
${systemPrompt}

Current Real-time Product Inventory & Pricing:
${productContext}

Operational Guidelines:
- Use the above catalog to answer questions about pricing, category, descriptions, and stock levels.
- Always quote the exact prices as listed.
- If a product's stock is 0, mention that it is currently out of stock and politely suggest an alternative.
`;

        const provider = (process.env.AI_PROVIDER || "").toLowerCase().trim();
        if (!provider) {
            throw new Error("AI provider is not configured. Please set the AI_PROVIDER environment variable to 'gemini' or 'ollama'.");
        }
        if (provider !== "gemini" && provider !== "ollama") {
            throw new Error(`Invalid AI provider configured: '${provider}'. Allowed values are 'gemini' or 'ollama'.`);
        }

        const modelName = provider === "gemini"
            ? (process.env.GEMINI_MODEL || "gemini-3.6-flash")
            : (process.env.OLLAMA_MODEL || "qwen2.5:3b");

        // SAFE diagnostic logs for production
        const hasGeminiKey = process.env.GEMINI_API_KEY ? "YES" : "NO";
        const envName = process.env.NODE_ENV || "development";
        
        console.log(`\n[AI Diagnostics]`);
        console.log(`AI Provider: ${provider}`);
        console.log(`Environment: ${envName}`);
        console.log(`Gemini key loaded: ${hasGeminiKey}`);
        console.log(`Gemini model: ${process.env.GEMINI_MODEL || "N/A"}`);

        requestCounter++;
        const currentReqNum = requestCounter;
        const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
        const hostUrl = provider === "gemini" ? "https://generativelanguage.googleapis.com" : ollamaHost;
        const providerName = provider === "gemini" ? "Gemini" : "Ollama";
        const startTime = new Date().toISOString();
        const requestId = `req_${Date.now()}_${currentReqNum}`;

        // Sanitize and limit the conversation history to the latest N messages
        const sanitizedHistory = sanitizeAndLimitMessages(messages, 6);
        const approxPromptSize = liveSystemPrompt.length + sanitizedHistory.reduce((acc, m) => acc + m.content.length, 0);

        console.log(`\n[Chat Request]`);
        console.log(`Request ID: ${requestId}`);
        console.log(`Model: ${modelName}`);
        console.log(`Message count: ${sanitizedHistory.length}`);
        console.log(`Prompt size: ${approxPromptSize} chars`);
        console.log(`Environment: ${envName}`);
        console.log(`${providerName} host: ${hostUrl}`);
        console.log(`Start time: ${startTime}`);

        const requestStart = Date.now();
        let replyText;
        if (provider === "gemini") {
            replyText = await generateWithGemini(modelName, sanitizedHistory, liveSystemPrompt);
        } else {
            replyText = await generateWithOllama(modelName, sanitizedHistory, liveSystemPrompt);
        }

        const duration = Date.now() - requestStart;

        console.log(`\n[Chat Response]`);
        console.log(`Request ID: ${requestId}`);
        console.log(`Status: SUCCESS`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Success/Failure: Success`);

        return replyText;
    } catch (error) {
        const provider = (process.env.AI_PROVIDER || "").toLowerCase() === "gemini" ? "gemini" : "ollama";
        const providerName = provider === "gemini" ? "Gemini" : "Ollama";
        const duration = Date.now() - (typeof requestStart !== "undefined" ? requestStart : Date.now());
        const currentReqNum = requestCounter;
        const requestId = `req_${Date.now()}_${currentReqNum}`;
        
        let errorCategory = "Unknown Error";
        let detailedMsg = error.message || error.toString();
        let errorCause = error.cause;
        let httpStatus = error.status || error.statusCode || (error.response ? error.response.status : undefined);

        if (error.code === "ECONNREFUSED" || error.cause?.code === "ECONNREFUSED" || detailedMsg.toLowerCase().includes("fetch failed")) {
            errorCategory = `ECONNREFUSED (${providerName} Connection Refused)`;
        } else if (error.code === "ENOTFOUND" || error.cause?.code === "ENOTFOUND") {
            errorCategory = `ENOTFOUND (Incorrect ${providerName} Host URL)`;
        } else if (httpStatus === 404 || detailedMsg.toLowerCase().includes("404") || detailedMsg.toLowerCase().includes("not found")) {
            errorCategory = "404 (Model Not Found / URL Path Not Found)";
        } else if (error.code === "ETIMEDOUT" || error.cause?.code === "ETIMEDOUT" || detailedMsg.toLowerCase().includes("timeout")) {
            errorCategory = `ETIMEDOUT (${providerName} Request Timed Out)`;
        } else if (httpStatus === 400 || detailedMsg.toLowerCase().includes("400") || detailedMsg.toLowerCase().includes("bad request") || detailedMsg.toLowerCase().includes("invalid")) {
            errorCategory = "400 Bad Request (Malformed Messages / Parameters)";
        } else if (httpStatus === 401 || httpStatus === 403 || detailedMsg.toLowerCase().includes("unauthorized") || detailedMsg.toLowerCase().includes("api key")) {
            errorCategory = "401/403 Unauthorized (Invalid/Missing API Key)";
        } else if (httpStatus === 429 || detailedMsg.toLowerCase().includes("429") || detailedMsg.toLowerCase().includes("quota") || detailedMsg.toLowerCase().includes("rate limit")) {
            errorCategory = "429 Rate Limit Exceeded / Quota Exhausted";
        } else if (httpStatus === 500 || detailedMsg.toLowerCase().includes("500") || detailedMsg.toLowerCase().includes("internal server error")) {
            errorCategory = "500 Internal Server Error";
        } else if (detailedMsg.toLowerCase().includes("context") || detailedMsg.toLowerCase().includes("length") || detailedMsg.toLowerCase().includes("limit") || detailedMsg.toLowerCase().includes("exceeded")) {
            errorCategory = "Context Length Exceeded";
        } else if (error.code === "ECONNRESET" || error.cause?.code === "ECONNRESET") {
            errorCategory = "ECONNRESET (Connection Reset / Socket Error)";
        } else if (error.name === "AbortError" || detailedMsg.toLowerCase().includes("abort")) {
            errorCategory = "AbortError (Request Cancelled)";
        }

        console.log(`\n[Chat Response]`);
        console.log(`Request ID: ${requestId}`);
        console.log(`Status: FAILED`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Success/Failure: Failure`);

        console.error(`\n[${providerName} Error]`);
        console.error(`Request ID: ${requestId}`);
        console.error(`Error type: ${errorCategory}`);
        console.error(`HTTP status: ${httpStatus || "N/A"}`);
        console.error(`Error message: ${detailedMsg}`);
        if (errorCause) {
            console.error(`Error cause:`, errorCause);
        }
        if (error.responseBody) {
            console.error(`${providerName} Error Response Body:`, error.responseBody);
        }

        throw new Error(`[${providerName} Error] Category: ${errorCategory} | Msg: ${detailedMsg}`);
    }
};

module.exports = {
    generateChatResponse,
};