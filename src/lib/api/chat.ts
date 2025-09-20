import { ChatList } from "@/store/use-chat-list";

export interface ChatListData {
    userId: string;
}
export interface Result {
    success: boolean;
    message?: string;
    error?: string;
    chatList: ChatList[];
}
export const loadChatList = async (data: ChatListData) => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/chat/${data.userId}`
    );
    const result: Result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || "Hub creation failed");
    }
    return result;
};

