// CLIENT SIDE - Add to your MessageBubble component
"use client";
// 1. Add this hook to track message visibility
import { useWebSocket } from "@/context/websocket-context";
import { useAuthSession } from "@/lib/session";
import { Message } from "@/store/use-chat-messages";
import { useEffect, useRef } from "react";

// Add this custom hook for intersection observer
export const useMessageVisibility = (message: Message) => {
    const { id: messageId, chatId } = message;
    const { ws } = useWebSocket();
    const { user } = useAuthSession();
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elementRef.current || !ws || !user || !message.readReceipts) return;
        const hasAlreadySeen = message.readReceipts.some(
            (r) => r.user.id === user.id
        )
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAlreadySeen) {
                        // Mark as read when message becomes visible
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(
                                JSON.stringify({
                                    type: "chat-activity",
                                    data: {
                                        action: "mark-read",
                                        chatId,
                                        senderId: user.id,
                                        messageId,
                                    },
                                })
                            );
                        }
                    }
                });
            },
            { threshold: 0.5 } // Message is 50% visible
        );

        observer.observe(elementRef.current);

        return () => {
            observer.disconnect();
        };
    }, [messageId, chatId, ws, user, message.readReceipts]);

    return elementRef;
};
