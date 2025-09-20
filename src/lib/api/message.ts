import { Message } from "@/store/use-chat-messages";

/* ===========================
   Types
=========================== */
export interface MessageData {
    chatId: string;
    userId: string;
    nextCursor?: string | null;
}

export interface JumpToMessageData {
    chatId: string;
    userId: string;
    messageId: string;
    nextCursor?: string | null; // Keep pagination position
}

export interface Result {
    success: boolean;
    message?: string;
    error?: string;
    messages: Message[];
    hasMore: boolean;
    nextCursor: string | null;
    targetMessage?: Message;
}

export interface Attachment {
    id: string;
    url: string;
    file: File;
}

export interface UploadAttachmentData {
    chatId: string;
    userId: string;
    tempId: string;
    message: string;
    replyToId?: string | null;
    attachments: Attachment[];
}

/* ===========================
   API Helpers
=========================== */

/**
 * Generic fetch wrapper with error handling
 */
const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || "Request failed");
    }

    return result as T;
};

/**
 * Load messages (paginated)
 */
export const loadMessage = async (data: MessageData): Promise<Result> => {
    const { userId, chatId, nextCursor } = data;
    const url = new URL(
        `${process.env.NEXT_PUBLIC_SERVER}/api/chat/${userId}/${chatId}`
    );

    if (nextCursor) {
        url.searchParams.append("cursor", nextCursor);
    }

    return fetchJson<Result>(url.toString());
};

/**
 * Jump directly to a message and load surrounding context
 */
export const jumpToMessageAndLoad = async (
    data: JumpToMessageData
): Promise<Result> => {
    const { userId, chatId, messageId, nextCursor } = data;
    const url = new URL(
        `${process.env.NEXT_PUBLIC_SERVER}/api/chat/${userId}/${chatId}/jump/${messageId}`
    );

    if (nextCursor) {
        url.searchParams.append("cursor", nextCursor);
    }

    return fetchJson<Result>(url.toString());
};

/**
 * Upload attachments with optional text message
 */
export const uploadAttachment = async (
    data: UploadAttachmentData
): Promise<any> => {
    const { chatId, userId, message, replyToId, attachments, tempId } = data;
    const formData = new FormData();

    if (message.trim()) formData.append("message", message.trim());
    formData.append("replyToId", replyToId ?? "");
    formData.append("tempId", tempId);

    attachments.forEach(({ file }) => {
        formData.append("files", file, file.name);
        formData.append("type", "1"); // Example: could be "image", "file", etc.
    });

    const url = `${process.env.NEXT_PUBLIC_SERVER}/api/chat/${userId}/${chatId}/attachment/upload`;

    return fetchJson<any>(url, {
        method: "POST",
        body: formData,
    });
};
export interface SearchData {
    userId: string;
    chatId: string;
    query: string;
}
export const searchMessages = async (data: SearchData): Promise<Result> => {
    const { userId, chatId, query } = data;
    const url = new URL(
        `${process.env.NEXT_PUBLIC_SERVER}/api/chat/${userId}/${chatId}/search`
    );

    url.searchParams.append("query", query);

    return fetchJson<Result>(url.toString());
};
