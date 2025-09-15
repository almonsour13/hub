import { signInUserAPI, signUpUserAPI } from "@/lib/api/auth";
import { AuthResponse, SignInData, SignUpData } from "@/type/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSignUpUser = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, Error, SignUpData>({
        mutationFn: signUpUserAPI,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            console.log("User signed up successfully:", data);
        },
        onError: (error: Error) => {
            console.error("Sign up error:", error.message);
        },
    });
};
export const useSignInUser = () => {
    const queryClient = useQueryClient();

     return useMutation<AuthResponse, Error, SignInData>({
        mutationFn: signInUserAPI,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            console.log("User signed up successfully:", data);
        },
        onError: (error: Error) => {
            console.error("Sign up error:", error.message);
        },
    });
};
