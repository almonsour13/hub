import { create } from "zustand";
import { Message } from "./use-chat-messages";

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
    updateChatList: (chatId: string, lastMessage: any, hub?: any) =>
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
                                      ? { ...hub }
                                      : { ...chat.lastActivity.hub },
                                  message: lastMessage
                                      ? { ...lastMessage }
                                      : { ...chat.lastActivity.message },
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
                            hub: hub ? { ...hub } : null,
                            message: lastMessage ? { ...lastMessage } : null,
                        },
                        updatedAt: new Date(),
                    },
                ];
            }

            updatedChatList.sort((a, b) => {
                const aDate = a.updatedAt
                    ? new Date(a.updatedAt).getTime()
                    : 0;
                const bDate = b.updatedAt
                    ? new Date(b.updatedAt).getTime()
                    : 0;
                return bDate - aDate;
            });

            return { chatList: updatedChatList };
        }),
}));
