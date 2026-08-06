"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatBot() {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "👋 Welcome to FLYYING STONE! I'm your AI Fashion Assistant. Ask me anything about outfits, trends, or fashion recommendations!",
        },
    ]);

    const messagesContainerRef = useRef(null);

    // Mount on client side (Next.js SSR safety)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Smooth auto-scroll to the bottom of the messages viewport
    useEffect(() => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            setTimeout(() => {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: "smooth",
                });
            }, 50);
        }
    }, [messages, isLoading, isOpen]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { role: "user", content: message.trim() };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setMessage("");
        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/api/chat", {
                messages: newMessages,
            });

            if (response.data.success && response.data.data?.reply) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: response.data.data.reply },
                ]);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Failed to fetch response:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "⚠️ Sorry, I could not connect to the AI model. Please verify Ollama is running and has the model pulled, then try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Floating Action Button (FAB) - Spaced exactly 24px from bottom/right */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ right: "24px", bottom: "24px" }}
                className="fixed w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 cursor-pointer"
                aria-label="Toggle Fashion Assistant Chat"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 transition-transform duration-300 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>

            {/* Chat Window Panel - Positioned cleanly above the FAB */}
            <div
                style={{ right: "24px", bottom: "96px" }}
                className={`fixed bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 transition-all duration-300 transform origin-bottom-right
                    /* Mobile dimensions (fluid) */
                    w-[calc(100vw-48px)] h-[65vh] max-h-[480px]
                    /* Desktop dimensions (responsive max/min bounds) */
                    sm:w-[390px] sm:h-[70vh] sm:max-h-[600px] sm:min-h-[380px]
                    ${
                        isOpen
                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 scale-95 translate-y-5 pointer-events-none"
                    }
                `}
            >
                {/* Header Section (Fixed height) */}
                <div className="bg-gradient-to-r from-neutral-900 to-black text-white p-4 flex items-center justify-between border-b border-neutral-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-xs font-bold border border-neutral-800 text-white">
                                FS
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black animate-pulse"></span>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold tracking-wide">
                                FLYYING STONE AI
                            </h2>
                            <p className="text-[11px] text-gray-400">
                                Personal Fashion Assistant
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors duration-200 p-1.5 rounded-lg hover:bg-neutral-800 focus:outline-none cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages Body (Only this section scrolls) */}
                <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth"
                >
                    {messages.map((msg, index) => (
                        <ChatMessage
                            key={index}
                            role={msg.role}
                            content={msg.content}
                        />
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold tracking-wider select-none flex-shrink-0 border border-gray-800">
                                FS
                            </div>
                            <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-200 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area (Fixed height) */}
                <div className="flex-shrink-0">
                    <ChatInput
                        message={message}
                        setMessage={setMessage}
                        onSubmit={handleSendMessage}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </>,
        document.body
    );
}