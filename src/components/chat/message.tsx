"use client";
import { useWebSocket } from "@/context/websocket-context";
import { useJumpToMessageHandler } from "@/hook/use-jump-to-message-handler";
import { useMessageVisibility } from "@/hook/use-message-receipt";
import { authSession } from "@/lib/session";
import { Message } from "@/store/use-chat-messages";
import { useMessageEditStore } from "@/store/use-message-edit";
import { useMessageReplyStore } from "@/store/use-message-reply";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronUp,
    Edit3,
    Pen,
    Pin,
    PinOff,
    Reply,
    Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ShowImageModal } from "../modal/show-image-modal";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { getBubbleRounding } from "@/util/message-bubble-rounding";

interface MessageBubbleProps {
    message: Message;
    prevMessage: Message | null;
    nextMessage: Message | null;
    showTimestamp: boolean;
}

export default function MessageBubble({
    message,
    prevMessage,
    nextMessage,
    showTimestamp,
}: MessageBubbleProps) {
    const { editMessage } = useMessageEditStore();
    const [showEditHistory, setShowEditHistory] = useState(false);
    const { user } = authSession();
    const sender = message.sender;
    const messageRef = useMessageVisibility(message);
    const { jumpToMessage } = useJumpToMessageHandler();

    if (!user) return null;

    const isSameSender = prevMessage?.sender?.id === message.sender?.id;
    const isNextSameSender = nextMessage?.sender?.id === message.sender?.id;

    const isOwnMessage = user?.id === sender.id;
    const isPinned = !!message.pinnedById;
    // const readReceipts =
    //     message.readReceipts?.filter(
    //         (receipt) => receipt.user.id !== message.senderId
    //     ) || [];

    const lastSeenBy = message.lastSeenBy || [];
   getBubbleRounding({
        message,
        nextMessage,
        prevMessage,
        isSameSender,
        isNextSameSender,
        showTimestamp,
    });
    return (
        <div
            id={message.id}
            ref={messageRef}
            className={`px-6 py-1a group/message transition-all duration-200 ${
                editMessage?.id === message.id &&
                "z-10 bg-muted/50 ring-2 ring-primary/20"
            } gap-4 flex relative items-start hover:bg-muted/50 py-0a5 py-0.5

             ${
                 !editMessage &&
                 message.pinnedById &&
                 message.status === 1 &&
                 "bg-amber-100 hover:bg-amber-100/50   dark:bg-amber-900/30 dark:hover:bg-amber-900/20"
             }
             ${!isSameSender && "mt-4"}
    `}
        >
            {isOwnMessage && (
                <div className="absolute left-0 top-0 h-full w-0.5 bg-primary"></div>
            )}
            <div className="w-8 flex-shrink-0">
                {(!isSameSender || showTimestamp) && (
                    <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs font-semibold">
                            {message.sender.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>
            <div className="relative group/message flex-1 flex flex-col gap-2 min-w-0">
                {(!isSameSender || showTimestamp) && (
                    <div className="flex items-center gap-3 text-xs">
                        {!isOwnMessage && (
                            <span className="font-medium">
                                {message.sender.name}
                            </span>
                        )}
                        {isOwnMessage && (
                            <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                Me
                            </span>
                        )}
                    </div>
                )}
                <div className="flex gap-1">
                    <div
                        className={`flex flex-col gap-2 ${
                            message.status === 1 && "bg-card"
                        } rounded p-2 px-3 border`}
                    >
                        {message.status === 1 ? (
                            <>
                                {(isPinned ||
                                    (message.edits &&
                                        message.edits.length > 0)) && (
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {isPinned && (
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs font-medium">
                                                <Pin className="w-3 h-3" />
                                                Pinned
                                            </div>
                                        )}
                                        {message.edits &&
                                            message.edits.length > 0 && (
                                                <button
                                                    onClick={() =>
                                                        setShowEditHistory(
                                                            !showEditHistory
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted-foreground/50 rounded text-xs font-medium  transition-colors"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                    Edited
                                                    {showEditHistory ? (
                                                        <ChevronUp className="w-3 h-3" />
                                                    ) : (
                                                        <ChevronDown className="w-3 h-3" />
                                                    )}
                                                </button>
                                            )}
                                    </div>
                                )}
                                {message.replyTo && (
                                    <div
                                        onClick={() =>
                                            message.replyTo &&
                                            jumpToMessage(
                                                message.chatId,
                                                message.replyTo.id
                                            )
                                        }
                                        className="cursor-pointer relative ml-2 max-w-md border-l-3 border-muted-foreground px-3 py-2 bg-card-foreground/10 rounded-sm"
                                    >
                                        <div className="flex items-center gap-2 text-xs mb-1 font-medium text-muted-foreground">
                                            <Reply className="w-3.5 h-3.5" />
                                            <span className="line-clamp-1">
                                                {isOwnMessage
                                                    ? "You"
                                                    : message.sender.name}{" "}
                                                replied to{" "}
                                                <span className="font-semibold">
                                                    {isOwnMessage
                                                        ? isOwnMessage
                                                            ? "yourself"
                                                            : "themselves"
                                                        : isOwnMessage
                                                        ? "you"
                                                        : message.replyTo.sender
                                                              .name}
                                                </span>
                                            </span>
                                        </div>
                                        <p
                                            className={`text-sm leading-relaxed line-clamp-2 ${
                                                message.replyTo.status === 2
                                                    ? "italic text-muted-foreground dark:text-slate-400"
                                                    : "text-slate-700 dark:text-slate-300"
                                            }`}
                                        >
                                            {message.replyTo.status !== 2
                                                ? message.replyTo.message
                                                : "Message was deleted"}
                                        </p>

                                        {message.replyTo.attachments && (
                                            <div className="flex gap-2 items-center">
                                                {message.replyTo.attachments
                                                    .slice(0, 2)
                                                    .map((attachment, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="rounded border  bg-muted overflow-hidden"
                                                        >
                                                            <Image
                                                                src={
                                                                    attachment.url
                                                                }
                                                                alt={
                                                                    attachment.name
                                                                }
                                                                className="max-h-12 object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {showEditHistory && message.edits && (
                                    <div className="space-y-2">
                                        {message.edits.map((edit) => (
                                            <div
                                                key={edit.id}
                                                className="ml-2 border-l-3 p-2 py-2 bg-muted-foreground/10 rounded to-transparent"
                                            >
                                                <div className="text-sm text-muted-foreground">
                                                    {edit.prevMessage}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {message.type === 1 ? (
                                    <div className="relative flex">
                                        <div className="max-w-md text-sm leading-relaxed">
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <span className="whitespace-pre-wrap break-words leading-relaxed">
                                                    {message.message}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    message.type === 2 && (
                                        <div className="flex flex-col gap-2 flex-wrap">
                                            {message.message && (
                                                <div className="max-w-md text-sm leading-relaxed">
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <span className="whitespace-pre-wrap break-words leading-relaxed">
                                                            {message.message}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-2 flex-wrap">
                                                {message.attachments &&
                                                    message.attachments.map(
                                                        (attachment, idx) => (
                                                            <ShowImageModal
                                                                key={idx}
                                                                attachment={
                                                                    attachment
                                                                }
                                                            />
                                                        )
                                                    )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </>
                        ) : (
                            <>
                                <div className="relative flex">
                                    <div className="max-w-md text-sm leading-relaxed">
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <span className="whitespace-pre-wrap font-light break-words leading-relaxed italic text-muted-foreground ">
                                                This message was deleted.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <AnimatePresence>
                        {lastSeenBy && lastSeenBy.length > 0 && (
                            <motion.div
                                className="flex items-end gap-1"
                                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                    duration: 0.3,
                                }}
                            >
                                <div className="flex gap-2 items-center">
                                    <AnimatePresence mode="popLayout">
                                        {lastSeenBy
                                            .slice(0, 3)
                                            .map((usr, index) => (
                                                <motion.div
                                                    key={usr.id}
                                                    layout
                                                    initial={{
                                                        opacity: 0,
                                                        scale: 0.3,
                                                        y: 10,
                                                        filter: "blur(4px)",
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                        y: 0,
                                                        filter: "blur(0px)",
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        scale: 0.3,
                                                        y: -10,
                                                        filter: "blur(4px)",
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 30,
                                                        mass: 0.8,
                                                        delay: index * 0.05,
                                                    }}
                                                    className="flex gap-1 items-center"
                                                >
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.1,
                                                        }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 400,
                                                        }}
                                                    >
                                                        <Avatar className="w-4 h-4 border">
                                                            <AvatarFallback className="text-[8px] font-medium">
                                                                {usr.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </motion.div>
                                                    <motion.span
                                                        className="text-popover-foreground font-medium text-[10px]"
                                                        initial={{
                                                            opacity: 0,
                                                            x: -5,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            x: 0,
                                                        }}
                                                        transition={{
                                                            delay:
                                                                index * 0.05 +
                                                                0.1,
                                                        }}
                                                    >
                                                        {usr.id === user.id
                                                            ? "You"
                                                            : usr.name}
                                                        {index <
                                                            Math.min(
                                                                lastSeenBy.length,
                                                                3
                                                            ) -
                                                                1 && (
                                                            <span className="teaxt-muted-foreground/50">
                                                                ,
                                                            </span>
                                                        )}
                                                    </motion.span>
                                                </motion.div>
                                            ))}
                                    </AnimatePresence>
                                    {lastSeenBy.length > 3 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="flex items-center"
                                        >
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                +{lastSeenBy.length - 3} more
                                            </span>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {message.sendStatus && (
                    <span className="text-xs -mt-1 text-muted-foreground italic font-mono">
                        {message.sendStatus}
                    </span>
                )}
            </div>
            {message.status === 1 &&
                !editMessage &&
                message.sendStatus !== "sending" && (
                    <ActionButton message={message} userId={user?.id} />
                )}
        </div>
    );
}
interface ActionButtonProps {
    message: Message;
    userId: string;
}

const ActionButton = ({ message }: ActionButtonProps) => {
    const { ws } = useWebSocket();
    const { user } = authSession();
    const { setReplyingTo } = useMessageReplyStore();
    const { setEditMessage } = useMessageEditStore();

    const handleRemove = () => {
        if (!ws || !user || ws.readyState !== WebSocket.OPEN || !message)
            return;
        ws.send(
            JSON.stringify({
                type: "chat-activity",
                data: {
                    action: "remove",
                    chatId: message.chatId,
                    senderId: user.id,
                    messageId: message.id,
                },
            })
        );
    };

    const handlePin = (action: string) => {
        if (!ws || !user || ws.readyState !== WebSocket.OPEN || !message)
            return;
        ws.send(
            JSON.stringify({
                type: "chat-activity",
                data: {
                    action: action,
                    chatId: message.chatId,
                    senderId: user.id,
                    messageId: message.id,
                },
            })
        );
    };
    const isOwnMessage = message.senderId === user?.id;
    const isPinned = !!message.pinnedById;

    return (
        <div className="flex items-center gap-1 bg-card rounded p-1 px-3 border">
            {/* Reply button */}
            <button
                onClick={() => setReplyingTo(message)}
                className="flex items-center gap-2 p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded text-xs"
                title="Reply to message"
            >
                <Reply size={12} />
                <span className="font-medium">Reply</span>
            </button>

            {/* Pin/Unpin button */}
            <button
                onClick={() => handlePin(isPinned ? "unpin" : "pin")}
                className={`flex items-center gap-2 p-1.5 transition-colors rounded text-xs ${
                    isPinned
                        ? "text-amber-600 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                title={isPinned ? "Unpin message" : "Pin message"}
            >
                {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
                <span className="font-medium">
                    {isPinned ? "Unpin" : "Pin"}
                </span>
            </button>

            {isOwnMessage && (
                <>
                    <button
                        onClick={() => setEditMessage(message)}
                        className="flex items-center gap-2 p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded text-xs"
                        title="Edit message"
                    >
                        <Pen size={12} />
                        <span className="font-medium">Edit</span>
                    </button>
                    <button
                        onClick={handleRemove}
                        className="flex items-center gap-2 p-1.5 hover:bg-destructive/10 hover:text-destructive transition-colors rounded text-xs"
                        title="Delete message"
                    >
                        <Trash2 size={12} />
                        <span className="font-medium">Delete</span>
                    </button>
                </>
            )}
        </div>
    );
};
