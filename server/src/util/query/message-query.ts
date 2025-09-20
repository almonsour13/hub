import { attachment, sender } from "./query";

export const messageQuery = {
    sender: sender,
    replyTo: {
        select: {
            id: true,
            message: true,
            type: true,
            status: true,
            sender: sender,
            attachments: attachment
        },
    },
    edits: true,
    attachments:attachment,
    readReceipts: {
        select: {
            userId: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
        },
    },
    lastSeenBy: true,
};

export const newMessageQuery = {
    sender: sender,
    replyTo: {
        select: {
            id: true,
            message: true,
            senderId: true,
            type: true,
            sender: sender,
            attachments: {
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                },
            },
        },
    },
    edits: {
        select: {
            id: true,
            prevMessage: true,
            editedAt: true,
        },
    },
    attachments: attachment,
};
