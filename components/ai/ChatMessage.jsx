export default function ChatMessage({ role, content }) {

    const isUser = role === "user";

    return (

        <div
            className={`flex ${isUser ? "justify-end" : "justify-start"
                }`}
        >
            <div
                className={`max-w-[80%] rounded-xl px-4 py-3 ${isUser
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black"
                    }`}
            >
                {content}
            </div>
        </div>
    );
}