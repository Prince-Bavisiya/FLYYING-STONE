const { generateChatResponse } = require("../services/chatService");
const { chatSchema } = require("../validators/chatValidator");
const {
    successResponse,
    errorResponse,
} = require("../utils/apiResponse");

const chatWithAI = async (req, res) => {
    try {
        // Validate request
        const validation = chatSchema.safeParse(req.body);

        if (!validation.success) {
            return errorResponse(
                res,
                validation.error.issues[0].message,
                400
            );
        }

        const { messages } = validation.data;

        // Generate AI response
        const reply = await generateChatResponse(messages);

        return successResponse(
            res,
            {
                reply,
            },
            "AI response generated successfully."
        );
    } catch (error) {
        console.error("Chat Controller Error:", error);

        return errorResponse(
            res,
            "Failed to generate AI response.",
            500
        );
    }
};

module.exports = {
    chatWithAI,
};