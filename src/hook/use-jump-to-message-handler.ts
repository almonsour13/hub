import { useJumpToMessage } from "@/hook/use-messages";
import { highlightMessage } from "@/util/high-light-message";
import { useChatMessagesStore } from "@/store/use-chat-messages";
import { authSession } from "@/lib/session";

export const useJumpToMessageHandler = () => {
    const {user} = authSession();
    const { mutate: jumpToMessageAPI } = useJumpToMessage();
    const {
        messages,
        setMessages,
        setHasMoreMessages,
        setNextCursor,
        nextCursor,
    } = useChatMessagesStore();

    const jumpToMessage = (chatId:string, messageId:string) => {
        if(!user) return
        // If already in cache, just highlight
        if (messages[chatId]?.some((msg) => msg.id === messageId)) {
            highlightMessage(messageId);
            return;
        }

        // Otherwise, fetch surrounding messages
        jumpToMessageAPI(
            {
                userId:user?.id as string,
                chatId,
                messageId,
                nextCursor: nextCursor[chatId],
            },
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

                    // Highlight the target after DOM updates
                    setTimeout(() => {
                        if (result.targetMessage) {
                            highlightMessage(result.targetMessage.id);
                        }
                    }, 100);
                },
            }
        );
    };

    return { jumpToMessage };
};
