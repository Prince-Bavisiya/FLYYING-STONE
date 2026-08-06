"use client";

import { useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatBot() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "👋 Welcome to FLYYING STONE! I'm your AI Fashion Assistant.",
        },
    ]);

    return (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">

            {/* Header */}
            <div className="bg-black text-white p-4">
                <h2 className="text-lg font-semibold">
                    FLYYING STONE AI
                </h2>

                <p className="text-sm text-gray-300">
                    Personal Fashion Assistant
                </p>
            </div>

            {/* Messages */}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => (
                    <ChatMessage
                        key={index}
                        role={msg.role}
                        content={msg.content}
                    />
                ))}
            </div>

            {/* Input */}

            <ChatInput
                messages={messages}
                setMessages={setMessages}
            />
        </div>
    );
}