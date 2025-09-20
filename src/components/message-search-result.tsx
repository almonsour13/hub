import { useJumpToMessageHandler } from "@/hook/use-jump-to-message-handler";
import { Message } from "@/store/use-chat-messages";
import { formatMessageTime } from "@/util/format-message-time";
import { highlightSearchTerm } from "@/util/highlight-search-term";

export default function MessageSearchResult({
    message,
    searchTerm,
}: {
    message: Message;
    searchTerm: string;
}) {
    const { jumpToMessage } = useJumpToMessageHandler();
    const handleJumpToMessage = () => {
        jumpToMessage(message.chatId, message.id);
    };
    return (
        <div
            onClick={handleJumpToMessage}
            className="p-3 group hover:bg-muted/50 border-b border-border/50 cursor-pointer transition-colors"
        >
            <div className="flex items-start space-x-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="flex gap-2">
                            <span className="text-sm font-medium text-foreground">
                                {message.sender?.name || "Unknown User"}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                                {formatMessageTime(message.createdAt)}
                            </span>
                        </div>
                        <span className="hidden group-hover:block text-xs text-muted-foreground px-2 rounded-xs bg-card ">
                            Jump
                        </span>
                    </div>
                    <div className="text-sm text-foreground break-words line-clamp-2">
                        {highlightSearchTerm(message.message, searchTerm)}
                    </div>
                </div>
            </div>
        </div>
    );
}
