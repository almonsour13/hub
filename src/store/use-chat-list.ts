import { create } from "zustand";
import { Message } from "./use-chat-messages";
import { Hub } from "@/type/hub";

interface LastActivity {
    hub: {
        name: string;
    } | null;
    message: Message | null;
}

export interface ChatList {
    id: string;
    type: number;
    lastActivity: LastActivity;
    updatedAt: Date;
}

interface ChatListStore {
    chatList: ChatList[];
    setChatList: (chatList: ChatList[]) => void;
    updateChatList: (chatId: string, lastMessage: Message) => void;
}

export const useChatListStore = create<ChatListStore>((set) => ({
    chatList: [],
    setChatList: (chatList) => set({ chatList }),
    updateChatList: (chatId: string, lastMessage: Message, hub?: Hub) =>
        set((state) => {
            const existingIndex = state.chatList.findIndex(
                (c) => c.id === chatId
            );
            let updatedChatList: ChatList[];

            if (existingIndex !== -1) {
                updatedChatList = state.chatList.map((chat, i) =>
                    i === existingIndex
                        ? {
                              ...chat,
                              lastActivity: {
                                  hub: hub
                                      ? { name: hub.name } // ✅ only keep name
                                      : chat.lastActivity.hub,
                                  message:
                                      lastMessage ?? chat.lastActivity.message,
                              },
                              updatedAt: new Date(),
                          }
                        : chat
                );
            } else {
                updatedChatList = [
                    ...state.chatList,
                    {
                        id: chatId,
                        type: 1,
                        lastActivity: {
                            hub: hub ? { name: hub.name } : null, // ✅ only keep name
                            message: lastMessage ?? null,
                        },
                        updatedAt: new Date(),
                    },
                ];
            }

            updatedChatList.sort((a, b) => {
                return b.updatedAt.getTime() - a.updatedAt.getTime();
            });

            return { chatList: updatedChatList };
        }),
}));
