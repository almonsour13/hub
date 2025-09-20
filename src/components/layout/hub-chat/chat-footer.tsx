"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWebSocket } from "@/context/websocket-context";
import { uploadAttachment } from "@/lib/api/message";
import { useAuthSession } from "@/lib/session";
import { Message, useChatMessagesStore } from "@/store/use-chat-messages";
import { useMessageEditStore } from "@/store/use-message-edit";
import { useMessageReplyStore } from "@/store/use-message-reply";
import { Check, ImageIcon, Send, X } from "lucide-react"; // for close button
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Attachment {
    id: string;
    url: string;
    file: File;
}
export default function ChatFooter() {
    const { user } = useAuthSession();
    const { editMessage, setEditMessage } = useMessageEditStore();
    const chatId = useParams().chatId as string;
    const [message, setMessage] = useState("");
    const { ws } = useWebSocket();
    const { replyingTo, setReplyingTo } = useMessageReplyStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const [attachments, setAttachments] = useState<Attachment[] | []>([]);
    const [previewAttachments, setPreviewAttachments] = useState<
        Attachment[] | []
    >([]);
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const imageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editMessage && textareaRef.current) {
            setMessage(editMessage.message);
            textareaRef.current.focus();
            textareaRef.current.selectionStart =
                textareaRef.current.value.length;
        }
    }, [editMessage]);

    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach((file) => {
            const id = Math.random().toString(36).substring(7);
            const preview = URL.createObjectURL(file);
            if (file.size > MAX_FILE_SIZE) {
                alert(`"${file.name}" exceeds the 10MB size limit.`);
                return;
            }
            setAttachments((prev) => [...prev, { url: preview, file, id }]);
            setPreviewAttachments((prev) => [
                ...prev,
                { url: preview, file, id },
            ]);
        });
    }, [MAX_FILE_SIZE]);

    const handleImageUpload = useCallback(() => {
        if (imageInputRef.current) {
            imageInputRef.current.click();
        }
    }, []);

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        if (!ws || !user) return;
        if (!editMessage) {
            ws.send(
                JSON.stringify({
                    type: "chat-activity",
                    data: {
                        action: "typing",
                        chatId,
                        senderId: user.id,
                        sender: user,
                        isTyping: true,
                    },
                })
            );
            if (typingTimeout.current) clearTimeout(typingTimeout.current);

            typingTimeout.current = setTimeout(() => {
                ws.send(
                    JSON.stringify({
                        type: "chat-activity",
                        data: {
                            action: "typing",
                            chatId,
                            senderId: user.id,
                            sender: user,
                            isTyping: false,
                        },
                    })
                );
            }, 5000);
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === "Escape" && editMessage) {
            setEditMessage(null);
        }
    };
    const handleSubmit = () => {
        if (editMessage) {
            updateMessage();
        } else {
            sendMessage();
        }

        if (!ws || !user) return;
        ws.send(
            JSON.stringify({
                type: "chat-activity",
                data: {
                    action: "typing",
                    chatId,
                    senderId: user.id,
                    sender: user,
                    isTyping: false,
                },
            })
        );
    };
    const sendMessage = async () => {
        if ((!message.trim() && attachments.length === 0) || !ws || !user)
            return;

        const structuredAttachment = attachments.map((att) => ({
            ...att,
            name: att.file.name,
        }));

        const tempMessage: Message = {
            id: uuidv4(),
            senderId: user.id,
            chatId,
            type: structuredAttachment.length > 0 ? 2 : 1,
            status: 1,
            message: message.trim(),
            sendStatus: "sending",
            sender: {
                id: user.id!,
                name: user.name!,
                image: user.image!,
            },
            attachments: structuredAttachment,
            replyToId: replyingTo?.id ?? null,
            replyTo: replyingTo ?? null,
            pinnedBy: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        useChatMessagesStore.getState().addMessage(chatId, tempMessage);

        setMessage("");
        setReplyingTo(null);
        setPreviewAttachments([]);

        if (structuredAttachment.length > 0) {
            console.log("Attachment");
            await uploadAttachment({
                chatId,
                userId: user.id,
                tempId: tempMessage.id,
                message: tempMessage.message,
                replyToId: tempMessage.replyTo?.id ?? null,
                attachments,
            });
        } else {
            ws.send(
                JSON.stringify({
                    type: "chat-activity",
                    data: {
                        action: "send",
                        chatId,
                        senderId: user.id,
                        message: tempMessage.message,
                        tempId: tempMessage.id,
                        replyToId: tempMessage.replyTo?.id ?? null,
                    },
                })
            );
        }
        setAttachments([]);
    };
    const cancelEdit = () => {
        setEditMessage(null);
        setMessage("");
    };
    const updateMessage = () => {
        if (!message.trim() || !ws || !user || !editMessage) return;

        ws.send(
            JSON.stringify({
                type: "chat-activity",
                data: {
                    action: "update",
                    chatId,
                    senderId: user.id,
                    messageId: editMessage.id,
                    message: message.trim(),
                },
            })
        );

        setMessage("");
        setEditMessage(null);
    };

    const isMessageChanged = editMessage && editMessage.message !== message;
    const canSubmit =
        (message.trim() || (!message.trim() && attachments.length !== 0)) &&
        (!editMessage || isMessageChanged);

    return (
        <div className="flex flex-col border-t h-auto gap-2">
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
            />
            {previewAttachments && previewAttachments.length > 0 && (
                <div className="px-4 py-3 border-b">
                    <div className="flex flex-wrap gap-2">
                        {previewAttachments.map((att, idx) => (
                            <div
                                key={idx}
                                className="relative group bg-accent rounded-lg border max-w-xs"
                            >
                                <div className="relative">
                                    <Image
                                        src={att.url}
                                        alt={att.file.name}
                                        className="max-w-auto max-h-20 object-cover rounded"
                                        width={80}
                                        height={80}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {editMessage && (
                <div className="px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <span className="text-xs font-medium">
                                Edit Message
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-blue-100"
                            onClick={cancelEdit}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            )}

            {replyingTo && (
                <div className="px-4 py-3 border-b">
                    <div className="flex items-center">
                        <div className="w-full">
                            <span className="text-xs">
                                Reply to{" "}
                                {replyingTo.sender.id === user?.id
                                    ? "yourself"
                                    : replyingTo.sender.name}
                            </span>
                            <p className="text-muted-foreground text-sm line-clamp-1">
                                {replyingTo.message}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-red-100"
                            onClick={() => setReplyingTo(null)}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Input + send button */}
            <div className="flex items-center gap-2 p-4">
                {!editMessage && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-10 w-10 px-4 rounded-full"
                        onClick={handleImageUpload}
                    >
                        <ImageIcon className="w-4 h-4" />
                    </Button>
                )}
                <div className="flex-1 flex items-center relative">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        placeholder={
                            editMessage
                                ? "Edit your message..."
                                : "Type a message..."
                        }
                        className={`min-h-[44px] max-h-24 resize-none pr-20 rounded transition-colors ${
                            editMessage ? "ring-2 ring-primary" : ""
                        }`}
                        onChange={handleTyping}
                        onKeyDown={handleKeyDown}
                        rows={4}
                    />
                </div>
                <Button
                    size="sm"
                    className="h-10 w-10 px-4 bg-primary rounded-full border "
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    title={editMessage ? "Save changes" : "Send message"}
                >
                    {editMessage ? (
                        <Check size={18} />
                    ) : (
                        <Send size={16} className="ml-0.5" />
                    )}
                </Button>
            </div>
        </div>
    );
}
