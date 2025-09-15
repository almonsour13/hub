import { useSession } from "next-auth/react";

export const authSession = () => {
    const { data: session } = useSession();
    return {
        user: session?.user,
    };
};
