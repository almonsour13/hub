"use client";

import { useWebSocket } from "@/context/websocket-context";
import { useChatList } from "@/hook/use-chat";
import { useAuthSession } from "@/lib/session";
import { useChatListStore } from "@/store/use-chat-list";
import { format } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function ChatList() {
    const { user } = useAuthSession();
    const { mutate: loadChatList, isPending } = useChatList();
    const { chatList, setChatList, updateChatList } = useChatListStore();
    const { ws } = useWebSocket();
    const pathname = usePathname();

    const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
        null
    );

    useEffect(() => {
        if (!user?.id) return;
        loadChatList(
            { userId: user.id },
            {
                onSuccess: (result) => {
                    setChatList(result.chatList);
                },
            }
        );
    }, [user?.id, loadChatList, setChatList]);

    useEffect(() => {
        if (!ws || !user) return;

        // Clean up previous handler
        if (messageHandlerRef.current) {
            ws.removeEventListener("message", messageHandlerRef.current);
        }

        const handleChatListActivity = (event: MessageEvent) => {
            try {
                const parseData = JSON.parse(event.data);
                const type = parseData.type;
                const data = parseData.data;

                if (type === "chat-list-activity") {
                    const { action } = data;
                    if (action === "new-message") {
                        const { chatId, lastMessage } = data;
                        updateChatList(chatId, lastMessage);
                    }
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        messageHandlerRef.current = handleChatListActivity;
        ws.addEventListener("message", handleChatListActivity);

        return () => {
            if (messageHandlerRef.current) {
                ws.removeEventListener("message", messageHandlerRef.current);
                messageHandlerRef.current = null;
            }
        };
    }, [ws, user, updateChatList]);

    const formatMessageTime = (date: Date | string) => {
        return format(new Date(date), "HH:mm");
    };

    return (
        <div className="h-auto flex-1 px-2 py-4 flex flex-col gap-1">
            {isPending ? (
                <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500">Loading chats...</div>
                </div>
            ) : chatList.length === 0 ? (
                <div className="text-center p-8">
                    <p className="text-gray-500">
                        You are not a member of any hubs.
                    </p>
                </div>
            ) : (
                chatList.map((chat) => {
                    const isActive = pathname.includes(chat.id.toLowerCase());

                    return (
                        <Link key={chat.id} href={`/hub/${chat.id}`}>
                            <div
                                className={`group w-full px-2 py-2 border rounded transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-accent/50"
                                }`}
                            >
                                {chat.lastActivity.hub && (
                                    <div className="">
                                        <p className="font-semibold ">
                                            {chat.lastActivity.hub.name}
                                        </p>
                                    </div>
                                )}

                                {chat.lastActivity.message ? (
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex gap-1 truncate">
                                            {chat.lastActivity.message
                                                .sender && (
                                                <span>
                                                    {chat.lastActivity.message
                                                        .senderId === user?.id
                                                        ? "you"
                                                        : chat.lastActivity
                                                              .message.sender
                                                              .name}
                                                    {chat.lastActivity.message
                                                        .type === 1 && ":"}
                                                </span>
                                            )}
                                            <p className=" flex-1">
                                                {
                                                    chat.lastActivity.message
                                                        .message
                                                }
                                            </p>
                                        </div>
                                        <span className="text-xs flex-shrink-0">
                                            {formatMessageTime(
                                                chat.lastActivity.message
                                                    .createdAt
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic">
                                        No messages yet in this hub
                                    </p>
                                )}
                            </div>
                        </Link>
                    );
                })
            )}
        </div>
    );
}
