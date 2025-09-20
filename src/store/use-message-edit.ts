import { create } from "zustand";
import { Message } from "./use-chat-messages";

interface ReplyState {
    editMessage: Message | null;
    setEditMessage: (msg: Message | null) => void;
}

export const useMessageEditStore = create<ReplyState>((set) => ({
    editMessage: null,
    setEditMessage: (msg) => set({ editMessage: msg }),
}));
