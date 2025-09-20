import { useSession } from "next-auth/react";

export const useAuthSession = () => {
    const { data: session } = useSession();
    return {
        user: session?.user,
    };
};
