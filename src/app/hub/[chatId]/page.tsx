"use client";

import ChatContent from "@/components/layout/hub-chat/chat-content";
import ChatFooter from "@/components/layout/hub-chat/chat-footer";
import ChatHeader from "@/components/layout/hub-chat/chat-header";
import { useWebSocket } from "@/context/websocket-context";
import { useAuthSession } from "@/lib/session";
import { useChatInfoStore } from "@/store/use-chat-info";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Page() {
    const chatId = useParams().chatId as string;
    const { user } = useAuthSession();
    const { ws } = useWebSocket();
    const {isVisible} = useChatInfoStore();
    const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
        null
    );
    useEffect(() => {
        if (!ws || !user || !chatId) return;
        if (messageHandlerRef.current) {
            ws.removeEventListener("message", messageHandlerRef.current);
        }

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(
                JSON.stringify({
                    type: "join_chat",
                    data: {
                        chatId,
                        userId: user.id,
                        userName: user.name,
                    },
                })
            );
        } else {
            console.log(
                "[Hub Chat] WebSocket not ready, state:",
                ws.readyState
            );
        }
        return () => {
            if (messageHandlerRef.current) {
                ws.removeEventListener("message", messageHandlerRef.current);
                messageHandlerRef.current = null;
            }
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(
                    JSON.stringify({
                        type: "leave_chat",
                        data: {
                            chatId,
                            userId: user.id,
                            userName: user.name,
                        },
                    })
                );
            }
        };
    }, [ws, user, chatId]);
    
    
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col border-r">
                    <ChatHeader/>
                    <ChatContent />
                    <ChatFooter />
                </div>
                {/* chat info */}
                {isVisible && (
                    <div className="w-80"></div>
                )}
            </div>
        </div>
    );
}
