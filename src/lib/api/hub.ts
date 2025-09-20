import { Hub } from "@/type/hub";

export interface CreateData {
    userId: string;
    name: string;
    description: string;
}
export interface JoinData {
    userId: string;
    code: string;
}
export interface Result {
    success: boolean;
    message?: string;
    error?: string;
    hub: Hub;
}

export const createHub = async (data: CreateData): Promise<Result> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/hub/${data.userId}/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
    const result: Result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || "Hub creation failed");
    }

    return result;
};
export const joinHub = async (data: JoinData): Promise<Result> => {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/hub/${data.userId}/join`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );
    const result: Result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || "Hub creation failed");
    }

    return result;
};

