// utils/attachment.ts
export const getAttachmentUrl = (
    chatId: string,
    attachmentId: string
): string => {
    return `${process.env.NEXT_PUBLIC_SERVER}/api/chat/${chatId}/attachment/${attachmentId}`;
};

export const mapAttachmentsWithUrl = (
    chatId: string,
    attachments: { id: string; name: string | null; createdAt: Date }[]
) => {
    return attachments.map((att) => ({
        ...att,
        url: getAttachmentUrl(chatId, att.id),
    }));
};
