import { Message } from "@/store/use-chat-messages";

export const shouldShowTimestamp = (
    currentMessage: Message,
    prevMessage: Message | null
) => {
    if (!prevMessage) return true;

    const currentTime = new Date(currentMessage.createdAt);
    const prevTime = new Date(prevMessage.createdAt);
    return currentTime.getTime() - prevTime.getTime() > 10 * 60  * 1000;

}