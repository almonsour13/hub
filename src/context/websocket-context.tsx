// context/WebSocketContext.tsx
"use client";

import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type WebSocketContextType = {
    ws: WebSocket | null;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
    undefined
);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = getSocket();
        setWs(socket);
    }, [session?.user]);
    // In your websocket-context.tsx
    const messageHandlers = useRef<Set<(event: MessageEvent) => void>>(
        new Set()
    );

    // In your WebSocket setup
    useEffect(() => {
        if (!ws || !session?.user) return;
        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: "authenticate",
                    data: {
                        userId: session?.user.id,
                        userName: session?.user.name,
                    },
                })
            );
        };
        ws.onmessage = (event) => {
            messageHandlers.current.forEach((handler) => handler(event));
        };
    }, [ws]);

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
