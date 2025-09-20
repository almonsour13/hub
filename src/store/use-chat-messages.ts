import { create } from "zustand";

// Define possible sending statuses
export interface Sender {
    id: string;
    name: string;
    image: string;
}

export type SendStatus = "sending" | "sent" | "failed" | "";
interface LastSeenBy extends Sender {
    id: string;
}
interface ReadReceipt {
    id: string;
    readAt: Date;
    user: Sender;
}
export interface Attachment {
    id: string;
    url: string;
    name: string;
}

export interface Edit {
    id: string;
    messageId: string;
    prevMessage: string;
    editedAt: Date;
}

export interface ReplyTo {
    id: string;
    message: string;
    sender: Sender;
    attachments?: Attachment[];
    type: number;
    status: number;
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    sender: Sender;
    message: string;
    status: number; // can still be used for read/unread or delivery status
    type: number; // message type (text, image, etc.)
    sendStatus: SendStatus; // new field for sending status
    replyToId?: string | null;
    replyTo?: ReplyTo | null;
    pinnedById?: string | null;
    pinnedAt?: Date | null;
    edits?: Edit[] | null;
    attachments?: Attachment[];
    createdAt: Date;
    updatedAt: Date;
    readReceipts?: ReadReceipt[];
    lastSeenBy?: LastSeenBy[];
    pinnedBy: Sender | null;
}

interface ChatMessagesState {
    messages: Record<string, Message[]>; // keyed by chatId
    nextCursor: Record<string, string | null>; // keyed by chatId
    hasMoreMessages: Record<string, boolean>; // keyed by chatId
    setMessages: (chatId: string, msgs: Message[]) => void;
    setNextCursor: (chatId: string, cursor: string | null) => void;
    setHasMoreMessages: (chatId: string, hasMore: boolean) => void;
    addMessage: (chatId: string, msg: Message) => void;
    updateMessage: (
        chatId: string,
        tempId: string,
        newMsg: Partial<Message>
    ) => void;
    updateMessageStatus: (
        chatId: string,
        messageId: string,
        status: number
    ) => void;
    updateMessageReadReceipt: (
        chatId: string,
        messageId: string,
        receipt: ReadReceipt
    ) => void;
    addReadReceipt: (
        chatId: string,
        messageId: string,
        receipt: ReadReceipt
    ) => void;
    updateLastSeenBy: (
        chatId: string,
        messageId: string,
        user: LastSeenBy
    ) => void;
}

export const useChatMessagesStore = create<ChatMessagesState>((set) => ({
    messages: {},
    hasMoreMessages: {},
    nextCursor: {},
    setMessages: (chatId, msgs) =>
        set((state) => ({
            messages: { ...state.messages, [chatId]: msgs },
            
        })),
    setNextCursor: (chatId, cursor) =>
        set((state) => ({
            nextCursor: { ...state.nextCursor, [chatId]: cursor },
        })),
    setHasMoreMessages: (chatId, hasMore) =>
        set((state) => ({
            hasMoreMessages: { ...state.hasMoreMessages, [chatId]: hasMore },
        })),
    addMessage: (chatId, msg) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [chatId]: [
                    ...(state.messages[chatId] || []).map((m) =>
                        // Clear "sent" status from existing messages when new message arrives
                        m.sendStatus === "sent"
                            ? { ...m, sendStatus: "" as SendStatus }
                            : m
                    ),
                    msg,
                ],
            },
        })),
    updateMessage: (chatId, tempId, newMsg) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [chatId]: state.messages[chatId]?.map((m) =>
                    m.id === tempId
                        ? {
                              ...m,
                              ...newMsg,
                              replyTo:
                                  m.replyTo && m.replyTo.attachments
                                      ? {
                                            ...m.replyTo,
                                            ...newMsg.replyTo, // merge new replyTo safely
                                            attachments:
                                                m.replyTo.attachments.map(
                                                    (att) => {
                                                        const isExist =
                                                            newMsg.replyTo?.attachments?.find(
                                                                (at) =>
                                                                    at.id ===
                                                                    att.id
                                                            );
                                                        return isExist
                                                            ? {
                                                                  ...att,
                                                                  ...isExist,
                                                              }
                                                            : att;
                                                    }
                                                ),
                                        }
                                      : newMsg.replyTo ?? m.replyTo ?? null,

                              attachments: m.attachments
                                  ? m.attachments.map((att) => {
                                        const isExist =
                                            newMsg.attachments?.find(
                                                (at) => at.id === att.id
                                            );
                                        return isExist
                                            ? { ...att, ...isExist }
                                            : att;
                                    })
                                  : newMsg.attachments ?? [],
                          }
                        : m
                ),
            },
        })),

    updateMessageStatus: (chatId, messageId, status) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [chatId]:
                    state.messages[chatId]?.map((msg) => {
                        if (msg.id === messageId) {
                            // mark parent as removed
                            return { ...msg, status };
                        }
                        if (msg.replyTo && msg.replyTo.id === messageId) {
                            // mark reply's reference as removed
                            return {
                                ...msg,
                                replyTo: { ...msg.replyTo, status },
                            };
                        }
                        return msg;
                    }) || [],
            },
        })),

    updateMessageReadReceipt: (chatId, messageId, receipt) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [chatId]:
                    state.messages[chatId]?.map((msg) =>
                        msg.id === messageId
                            ? {
                                  ...msg,
                                  readReceipts: [
                                      ...(msg.readReceipts || []).filter(
                                          (r) => r.user.id !== receipt.user.id
                                      ),
                                      receipt,
                                  ],
                              }
                            : msg
                    ) || [],
            },
        })),
    addReadReceipt: (chatId, messageId, receipt) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [chatId]:
                    state.messages[chatId]?.map((msg) =>
                        msg.id === messageId
                            ? {
                                  ...msg,
                                  readReceipts: [
                                      ...(msg.readReceipts || []).filter(
                                          (r) => r.user.id !== receipt.user.id
                                      ),
                                      receipt,
                                  ],
                              }
                            : msg
                    ) || [],
            },
        })),

    updateLastSeenBy: (chatId, messageId, user) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [chatId]:
                    state.messages[chatId]?.map((msg) => {
                        if (msg.id === messageId) {
                            // Add user to this message's lastSeenBy
                            return {
                                ...msg,
                                lastSeenBy: [
                                    ...(msg.lastSeenBy || []).filter(
                                        (u) => u.id !== user.id
                                    ),
                                    user,
                                ],
                            };
                        } else {
                            // Remove user from all other messages' lastSeenBy
                            return {
                                ...msg,
                                lastSeenBy: (msg.lastSeenBy || []).filter(
                                    (u) => u.id !== user.id
                                ),
                            };
                        }
                    }) || [],
            },
        })),
}));
