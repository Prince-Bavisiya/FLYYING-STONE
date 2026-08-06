"use client";

import { useState } from "react";

export default function ChatInput() {

    const [message, setMessage] = useState("");

    return (

        <div className="border-t p-3">

            <input
                value={message}
                onChange={(e) =>
                    setMessage(e.target.value)
                }
                placeholder="Ask about fashion..."
                className="w-full border rounded-lg p-3 outline-none"
            />

        </div>
    );
}