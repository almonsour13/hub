
import { Message } from "@/store/use-chat-messages";
import { shouldShowTimestamp } from "./show-time-stamp";

interface BubbleRoundingParams {
    message: Message;
    prevMessage: Message | null;
    nextMessage: Message | null;
    isSameSender: boolean;
    isNextSameSender: boolean;
    showTimestamp: boolean;
}

/**
 * Professional chat bubble rounding logic that handles all edge cases
 * including sender changes, timestamp breaks, and reply messages
 */
type Corners = {
    br?: string;
    tr?: string;
    bl?: string;
    tl?: string;
    both: string;
};
export const getBubbleRounding = ({
    message,
    nextMessage,
    isSameSender,
    isNextSameSender,
    showTimestamp,
}: BubbleRoundingParams): string | undefined => {
    const currentHasReply = !!message.replyTo;
    const nextHasReply = nextMessage ? !!nextMessage.replyTo : false;
    const isFirst = !isSameSender;
    const isLast = !isNextSameSender;
    const willNextShowTimestamp = nextMessage
        ? shouldShowTimestamp(nextMessage, message)
        : true;

    const receiverCorners: Corners = {
        bl: "rounded-bl-2xl",
        tl: "rounded-tl-2xl",
        both: "rounded-bl rounded-tl",
    };
    const corners = receiverCorners;
    const firstCorner =  corners.tl;
    const lastCorner =  corners.bl;


    // Helper to check conditions and return appropriate rounding
    const checkConditions = [
        // first and not last
        [
            isFirst &&
                !isLast &&
                showTimestamp &&
                currentHasReply &&
                nextHasReply,
            "",
        ],
        [isFirst && !isLast && !showTimestamp && willNextShowTimestamp, ""],
        [
            isFirst && !isLast && showTimestamp && !willNextShowTimestamp,
            firstCorner,
        ],
        [isFirst && !isLast && !showTimestamp, firstCorner],
        // not first and not last
        [!isFirst &&
                !isLast && showTimestamp && currentHasReply && !nextHasReply && willNextShowTimestamp,""],
        [!isFirst &&
                !isLast && showTimestamp && currentHasReply && nextHasReply && !    willNextShowTimestamp,""],
        [!isFirst &&
                !isLast && showTimestamp && currentHasReply && nextHasReply && willNextShowTimestamp,""],
        [
            !isFirst &&
                !isLast &&
                !showTimestamp &&
                currentHasReply &&
                nextHasReply,
            "",
        ],
        [
            !isFirst &&
                !isLast &&
                !showTimestamp &&
                currentHasReply &&
                !nextHasReply &&
                willNextShowTimestamp,
            "",
        ],
        [
            !isFirst &&
                !isLast &&
                !showTimestamp &&
                !currentHasReply &&
                !nextHasReply &&
                willNextShowTimestamp,
            lastCorner,
        ],
        [
            !isFirst &&
                !isLast &&
                showTimestamp &&
                !currentHasReply &&
                !nextHasReply &&
                willNextShowTimestamp,
            "",
        ],
        [
            !isFirst &&
                !isLast &&
                !showTimestamp &&
                !currentHasReply &&
                nextHasReply,
            lastCorner,
        ],
        [
            !isFirst &&
                !isLast &&
                showTimestamp &&
                !currentHasReply &&
                nextHasReply,
            "",
        ],
        [!isFirst && !isLast && !showTimestamp && currentHasReply, firstCorner],
        [!isFirst && !isLast && !showTimestamp, corners.both],
        [!isFirst && !isLast && showTimestamp, firstCorner],
        // not first and last
        [!isFirst && isLast && !showTimestamp && currentHasReply, ""],
        [!isFirst && isLast && !showTimestamp, lastCorner],
    ] as const;

    for (const [condition, result] of checkConditions) {
        if (condition) return result;
    }

    return "rounded-2xl";
};
