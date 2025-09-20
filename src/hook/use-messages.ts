import { jumpToMessageAndLoad, JumpToMessageData, loadMessage, MessageData, Result, SearchData, searchMessages } from "@/lib/api/message";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useMessages = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: MessageData) => loadMessage(data),
        onSuccess: (result: Result) => {
            if (result.success && result.messages) {
                queryClient.invalidateQueries({ queryKey: ["messages"] });
            }
        },
    });
};

export const useJumpToMessage = () => {
    return useMutation<Result, Error, JumpToMessageData>({
        mutationFn: jumpToMessageAndLoad,
        onError: (error) => {
            console.error("Jump to message failed:", error);
        },
    });
};
export const useSearchMessages = () => {
    return useMutation<Result, Error, SearchData>({
        mutationFn: searchMessages,
        onError: (error) => {
            console.error("Jump to message failed:", error);
        },
    });
}
