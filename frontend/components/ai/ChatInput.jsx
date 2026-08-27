"use client";

export default function ChatInput({ message, setMessage, onSubmit, isLoading }) {
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="border-t border-gray-100 bg-white p-3 flex gap-2 items-center"
        >
            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? "Generating response..." : "Ask about fashion..."}
                disabled={isLoading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:bg-white focus:border-black focus:ring-1 focus:ring-black disabled:opacity-60 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400"
            />
            <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex-shrink-0"
            >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                )}
            </button>
        </form>
    );
}