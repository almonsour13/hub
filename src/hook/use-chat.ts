import { ChatListData, loadChatList, Result } from "@/lib/api/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useChatList = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ChatListData) => loadChatList(data),
        onSuccess: (result: Result) => {
            if (result.success && result.chatList) {
                console.log(result)
                queryClient.invalidateQueries({ queryKey: ["chatList"] });
            }
        },
    });
};
