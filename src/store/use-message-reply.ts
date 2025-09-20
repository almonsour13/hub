import { create } from "zustand";
import { Message } from "./use-chat-messages";

interface ReplyState {
    replyingTo: Message | null;
    setReplyingTo: (msg: Message | null) => void;
}

export const useMessageReplyStore = create<ReplyState>((set) => ({
    replyingTo: null,
    setReplyingTo: (msg) => set({ replyingTo: msg }),
}));
