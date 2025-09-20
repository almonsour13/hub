import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatInfoStore {
    isVisible: boolean;
    toggle: () => void;
}

export const useChatInfoStore = create<ChatInfoStore>()(
    persist(
        (set) => ({
            isVisible: false,
            toggle: () => set((state) => ({ isVisible: !state.isVisible })),
        }),
        {
            name: "chat-info-visibility", // localStorage key
        }
    )
);
