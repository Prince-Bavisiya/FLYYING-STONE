const { z } = require("zod");

const chatSchema = z.object({
    messages: z
        .array(
            z.object({
                role: z.enum(["user", "assistant", "system"]),
                content: z.string().trim().min(1, "Message content cannot be empty."),
            })
        )
        .min(1, "Messages array must contain at least one message."),
});

module.exports = {
    chatSchema,
};