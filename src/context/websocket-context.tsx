// context/WebSocketContext.tsx
"use client";

import { authSession } from "@/lib/session";
import { getSocket } from "@/lib/socket";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type WebSocketContextType = {
    ws: WebSocket | null;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
    undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const {user} = authSession();
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = getSocket();
        setWs(socket);
    }, [user]);
    const messageHandlers = useRef<Set<(event: MessageEvent) => void>>(
        new Set()
    );

    useEffect(() => {
        if (!ws || !user) return;
        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: "authenticate",
                    data: {
                        userId: user.id,
                        userName:user.name,
                    },
                })
            );
        };
        ws.onmessage = (event) => {
            messageHandlers.current.forEach((handler) => handler(event));
            try {
                const message = JSON.parse(event.data);

                // Handle authentication response
                if (message.type === "authenticated") {
                    console.log("✅ WebSocket authenticated successfully");
                } else if (message.type === "auth_error") {
                    console.error(
                        "❌ WebSocket authentication failed:",
                        message.data.message
                    );
                }

                // Call all registered message handlers
                messageHandlers.current.forEach((handler) => handler(event));
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };
    }, [ws, user]);

    return (
        <WebSocketContext.Provider value={{ ws }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) throw new Error("useWebSocket must be inside WebSocketProvider");
    return ctx;
};
