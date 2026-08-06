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
    } catch (error) {
        console.error("Ollama / Database Error:", error);

        throw new Error("Failed to generate AI response.");
    }
};

module.exports = {
    generateChatResponse,
};