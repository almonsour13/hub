import { MutableRefObject } from "react";

export const scrollToBottom = (
    messagesEndRef: MutableRefObject<HTMLDivElement | null>,
    behavior: ScrollBehavior = "smooth"
) => {
    messagesEndRef.current?.scrollIntoView({
        behavior,
        block: "end",
    });
};
