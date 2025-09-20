import EmptyChat from "@/components/chat/empty-chat";
import MessageBubble from "@/components/chat/message";
import MessageDateSeperator from "@/components/chat/message-date-separator";
import { useWebSocket } from "@/context/websocket-context";
import { useJumpToMessage, useMessages } from "@/hook/use-messages";
import { authSession } from "@/lib/session";
import {
    Message,
    Sender,
    useChatMessagesStore,
} from "@/store/use-chat-messages";
import { useMessageEditStore } from "@/store/use-message-edit";
import { formatMessageTime } from "@/util/format-message-time";
import { shouldShowTimestamp } from "@/util/show-time-stamp";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatContent() {
    const { user } = authSession();
    const chatId = useParams().chatId as string;
    const {
        messages,
        setMessages,
        nextCursor,
        setNextCursor,
        hasMoreMessages,
        setHasMoreMessages,
    } = useChatMessagesStore(); // Assume addMessages exists
    const { editMessage } = useMessageEditStore();
    const { ws } = useWebSocket();
    const { mutate: loadMessage, isPending } = useMessages();
    const {isPending: isJumping } =
        useJumpToMessage();

    const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
        null
    );
    const [typing, setTyping] = useState<Sender[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesStartRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     const currentMessages = messages[chatId];
    //     if (!currentMessages || currentMessages.length === 0) return;
    //     if (currentMessages.length === 1) {
    //         scrollToBottom(messagesEndRef, "instant");
    //         return;
    //     }

    //     const latestMessage = currentMessages[currentMessages.length - 1];

    //     // Always scroll if the current user sent the message
    //     const isCurrentUserMessage = latestMessage?.senderId === user?.id;
    //     if (isCurrentUserMessage) {
    //         // Small delay to ensure DOM is updated
    //         setTimeout(() => {
    //             scrollToBottom(messagesEndRef, "smooth");
    //         }, 100);
    //     }
    // }, [messages[chatId]?.length, chatId, user?.id]);

    // Initial load
    useEffect(() => {
        if (!user || !chatId) return;

        // Only fetch if this chat has no messages cached yet
        if (!messages[chatId] || messages[chatId].length === 0) {
            loadMessage(
                { userId: user.id, chatId, nextCursor: null },
                {
                    onSuccess: (result) => {
                        setMessages(chatId, result.messages);
                        setHasMoreMessages(chatId, result.hasMore);
                        setNextCursor(chatId, result.nextCursor);
                    },
                }
            );
        }
    }, [user, chatId, loadMessage, setMessages, messages, setHasMoreMessages, setNextCursor]);
    const loadMoreMessages = () => {
        if (!user || !nextCursor || isLoadingMore) return;

        setIsLoadingMore(true);
        loadMessage(
            { userId: user.id, chatId, nextCursor: nextCursor[chatId] },
            {
                onSuccess: (result) => {
                    const currentMessages = messages[chatId] || [];
                    const updatedMessages = [
                        ...result.messages,
                        ...currentMessages,
                    ];
                    setMessages(chatId, updatedMessages);
                    setHasMoreMessages(chatId, result.hasMore);
                    setNextCursor(chatId, result.nextCursor);
                    setIsLoadingMore(false);
                },
                onError: () => {
                    setIsLoadingMore(false);
                },
            }
        );
    };

    // Handle scroll to load more messages
    // const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    //     const { scrollTop } = e.currentTarget;

    //     // If scrolled to top and there are more messages, load them
    //     if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
    //         loadMoreMessages();
    //     }
    // };

    useEffect(() => {
        if (!ws || !user) return;

        if (messageHandlerRef.current) {
            ws.removeEventListener("message", messageHandlerRef.current);
        }

        const handleChatActivty = (event: MessageEvent) => {
            try {
                const parseData = JSON.parse(event.data);
                const type = parseData.type;
                const data = parseData.data;
                if (type === "chat-activity") {
                    const { action,  senderId } =
                        data;
                    if (action === "typing") {
                        const { isTyping, sender } = data;
                        setTyping((prev) => {
                            if (isTyping) {
                                return prev.some((user) => user.id === senderId)
                                    ? prev
                                    : [...prev, sender];
                            } else {
                                return prev.filter(
                                    (user) => user.id !== senderId
                                );
                            }
                        });
                    }
                }
            } catch (error) {}
        };

        messageHandlerRef.current = handleChatActivty;

        ws.addEventListener("message", handleChatActivty);

        return () => {
            if (messageHandlerRef.current) {
                ws.removeEventListener("message", messageHandlerRef.current);
                messageHandlerRef.current = null;
            }
        };
    }, [ws, user, chatId]);

    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {};

        messages &&
            messages.forEach((message) => {
                const date = format(new Date(message.createdAt), "yyyy-MM-dd");
                if (!groups[date]) groups[date] = [];
                groups[date].push(message);
            });

        return groups;
    };

    const messageGroups = groupMessagesByDate(messages[chatId]);

    return (
        <div
            className="flex-1 overflow-y-auto w-full min-h-0 relative"
            style={{
                overflow: editMessage ? "hidden" : "auto",
            }}
            // onScroll={handleScroll}
        >
            <div className="relative min-h-full">
                {/* Load more indicator */}
                {isJumping && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
                        <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm">
                            Loading message...
                        </div>
                    </div>
                )}
                {isLoadingMore && (
                    <div className="flex justify-center py-4">
                        <div className="text-sm text-muted-foreground">
                            Loading more messages...
                        </div>
                    </div>
                )}

                {/* Load more button (alternative to scroll-based loading) */}
                {hasMoreMessages[chatId] &&
                    !isLoadingMore &&
                    messages[chatId]?.length > 0 && (
                        <div className="flex justify-center py-4">
                            <button
                                onClick={loadMoreMessages}
                                className="text-sm text-primary hover:underline bg-card px-3 py-1 rounded-full"
                            >
                                Load more messages
                            </button>
                        </div>
                    )}

                <div ref={messagesStartRef} />

                {isPending &&
                (!messages[chatId] || messages[chatId].length === 0) ? (
                    <div className="flex justify-center py-8">
                        <div>Loading...</div>
                    </div>
                ) : messages[chatId] && messages[chatId].length > 0 ? (
                    Object.entries(messageGroups).map(
                        ([date, dateMessages]) => (
                            <div key={date} className="flex flex-col gap-1">
                                <MessageDateSeperator date={date} />
                                <div className={`flex flex-col py-8`}>
                                    {dateMessages.map((message, msgIdx) => {
                                        const prevMsg =
                                            msgIdx > 0
                                                ? dateMessages[msgIdx - 1]
                                                : null;
                                        const nextMsg =
                                            msgIdx < dateMessages.length - 1
                                                ? dateMessages[msgIdx + 1]
                                                : null;

                                        const showTimestamp =
                                            shouldShowTimestamp(
                                                message,
                                                prevMsg
                                            );
                                        return (
                                            <div key={message.id}>
                                                {showTimestamp && prevMsg && (
                                                    <div className="flex items-center justify-center w-full gap-2 my-4 px-8">
                                                        <time className="text-xs text-muted-foreground font-medium">
                                                            {formatMessageTime(
                                                                message.createdAt
                                                            )}
                                                        </time>
                                                    </div>
                                                )}
                                                <MessageBubble
                                                    showTimestamp={
                                                        showTimestamp
                                                    }
                                                    message={message}
                                                    prevMessage={prevMsg}
                                                    nextMessage={nextMsg}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    )
                ) : (
                    <EmptyChat />
                )}

                <div ref={messagesEndRef} className="h-4" />

                {editMessage && (
                    <div className="absolute inset-0 bg-black/80 z-5 pointer-events-auto" />
                )}
            </div>

            {typing.length > 0 && (
                <div className="px-8 pl-18 sticky z-20 py-2 bottom-0 bg-sidebar shadow-xs w-full">
                    <p className="text-xs text-muted-foreground">
                        {typing.map((user) => user.name).join(", ")}{" "}
                        {typing.length === 1 ? "is" : "are"} typing...
                    </p>
                </div>
            )}
        </div>
    );
}
