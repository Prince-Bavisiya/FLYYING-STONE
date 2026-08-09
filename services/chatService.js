const db = require("../config/db").promise;
const ollama = require("../config/ollamaConfig");
const systemPrompt = require("../prompts/systemPrompt");

const generateChatResponse = async (messages) => {
    try {
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

        if (process.env.GEMINI_API_KEY) {
            console.log("Using Gemini API for Chatbot...");
            
            // Map messages to Gemini format (roles must be 'user' or 'model')
            const contents = messages.map((m) => ({
                role: m.role === "assistant" || m.role === "model" ? "model" : "user",
                parts: [{ text: m.content }],
            }));

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    systemInstruction: {
                        parts: [{ text: liveSystemPrompt }],
                    },
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Gemini API Error: ${response.status} ${errText}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } else {
            console.log("Using Ollama for Chatbot...");
            const response = await ollama.chat({
                model: process.env.OLLAMA_MODEL,
                messages: [
                    {
                        role: "system",
                        content: liveSystemPrompt,
                    },
                    ...messages,
                ],
            });

            return response.message.content;
        }
    } catch (error) {
        console.error("Chat Service Error:", error);
        throw new Error("Failed to generate AI response.");
    }
};

module.exports = {
    generateChatResponse,
};