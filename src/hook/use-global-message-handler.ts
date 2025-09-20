// hooks/use-global-message-handler.ts
import { useEffect, useRef } from "react";
import { useWebSocket } from "@/context/websocket-context";
import { authSession } from "@/lib/session";
import { useChatMessagesStore } from "@/store/use-chat-messages";

/**
 * Global message handler that updates messages regardless of which chat is currently open
 */
export const useGlobalMessageHandler = () => {
    const { user } = authSession();
    const { ws } = useWebSocket();
    const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
        null
    );

    useEffect(() => {
        if (!ws || !user) return;

        // Remove existing listener if any
        if (messageHandlerRef.current) {
            ws.removeEventListener("message", messageHandlerRef.current);
        }

        const handleGlobalChatActivity = (event: MessageEvent) => {
            try {
                const parseData = JSON.parse(event.data);
                const type = parseData.type;
                const data = parseData.data;

                if (type === "chat-activity") {
                    const {
                        action,
                        tempId,
                        messageId,
                        senderId,
                        message,
                        chatId,
                    } = data;

                    switch (action) {
                        case "new-message": {
                            const currentMessages =
                                useChatMessagesStore.getState().messages;
                            const chatMessages = currentMessages[chatId] || [];
                            console.log(data);
                            // Check if this is an update to a temp message (user's own message)
                            const existingMessageWithTempId = tempId
                                ? chatMessages.find((msg) => msg.id === tempId)
                                : null;

                            if (existingMessageWithTempId) {
                                // Update own message from sending to sent
                                useChatMessagesStore
                                    .getState()
                                    .updateMessage(chatId, tempId, {
                                        id: message.id,
                                        sendStatus: "sent",
                                        attachments: message.attachment,
                                        replyTo: message.replyTo,
                                    });

                                setTimeout(() => {
                                    useChatMessagesStore
                                        .getState()
                                        .updateMessage(chatId, tempId, {
                                            id: message.id,
                                            sendStatus: "sent",
                                        });
                                }, 1000);
                            } else {
                                // Add new message from another user
                                useChatMessagesStore
                                    .getState()
                                    .addMessage(chatId, {
                                        ...message,
                                        sendStatus: "",
                                    });
                            }
                            break;
                        }

                        case "update-message": {
                            useChatMessagesStore
                                .getState()
                                .updateMessage(chatId, message.id, {
                                    ...message,
                                });
                            break;
                        }

                        case "remove-message": {
                            useChatMessagesStore
                                .getState()
                                .updateMessageStatus(chatId, messageId, 2);
                            break;
                        }

                        case "pin-message": {
                            useChatMessagesStore
                                .getState()
                                .updateMessage(chatId, messageId, {
                                    pinnedById: senderId,
                                    pinnedAt: new Date(),
                                });
                            break;
                        }

                        case "unpin-message": {
                            useChatMessagesStore
                                .getState()
                                .updateMessage(chatId, messageId, {
                                    pinnedById: null,
                                    pinnedAt: null,
                                });
                            break;
                        }
                        case "message-receipts-update": {
                            useChatMessagesStore
                                .getState()
                                .addReadReceipt(
                                    chatId,
                                    messageId,
                                    data.receipt
                                );
                            break;
                        }
                        case "user-last-seen-update": {
                            console.log(data)
                            const {user} = data;
                            useChatMessagesStore
                                .getState()
                                .updateLastSeenBy(chatId, messageId, user);
                            break;
                        }

                        // Note: Typing indicators are handled per-chat in ChatContent
                        // as they're only relevant for the currently open chat
                    }
                }
            } catch (error) {
                console.error("Error handling global chat activity:", error);
            }
        };

        messageHandlerRef.current = handleGlobalChatActivity;
        ws.addEventListener("message", handleGlobalChatActivity);

        return () => {
            if (messageHandlerRef.current) {
                ws.removeEventListener("message", messageHandlerRef.current);
                messageHandlerRef.current = null;
            }
        };
    }, [ws, user]);
};
