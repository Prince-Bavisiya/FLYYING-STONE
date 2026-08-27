export default function ChatMessage({ role, content }) {
    const isUser = role === "user";

    return (
        <div
            className={`flex items-end gap-2 ${
                isUser ? "justify-end" : "justify-start"
            }`}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold tracking-wider select-none flex-shrink-0 border border-gray-800">
                    ZY
                </div>
            )}
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                    isUser
                        ? "bg-black text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
            >
                {content}
            </div>
        </div>
    );
}