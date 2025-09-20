import {
    CreateData,
    createHub,
    JoinData,
    joinHub,
    Result,
} from "@/lib/api/hub";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateHub = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateData) => createHub(data),
        onSuccess: (result: Result) => {
            if (result.success && result.hub) {
                queryClient.invalidateQueries({ queryKey: ["hubs"] });
            }
        },
    });
};
export const useJoinHub = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: JoinData) => joinHub(data),
        onSuccess: (result: Result) => {
            if (result.success && result.hub) {
                queryClient.invalidateQueries({ queryKey: ["hubs"] });
            }
        },
    });
};
