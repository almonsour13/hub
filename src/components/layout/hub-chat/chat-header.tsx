"use client";
import MessageSearchResult from "@/components/message-search-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchMessages } from "@/hook/use-messages";
import { useAuthSession } from "@/lib/session";
import { useChatInfoStore } from "@/store/use-chat-info";
import { Message } from "@/store/use-chat-messages";
import { Info, Pin, Search, Users, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// Utility function to highlight search terms in text

// Message result component

export default function ChatHeader() {
    const { user } = useAuthSession();
    const chatId = useParams().chatId as string;
    const { toggle } = useChatInfoStore();
    const [search, setSearch] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const {
        mutate: searchMessages,
        isPending: isLoading,
    } = useSearchMessages();

    // Debounced search function
    const debouncedSearch = useCallback(
        (query: string) => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                if (!user || !chatId || !query.trim()) {
                    setMessages([]);
                    return;
                }

                searchMessages(
                    {
                        chatId,
                        userId: user.id,
                        query: query.trim(),
                    },
                    {
                        onSuccess: (result) => {
                            if (result.success && result.messages) {
                                setMessages(result.messages);
                            }
                        },
                        onError: (error) => {
                            console.error("Search failed:", error);
                            setMessages([]);
                        },
                    }
                );
            }, 400);
        },
        [user, chatId, searchMessages]
    );

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    };

    const clearSearch = () => {
        setSearch("");
        setMessages([]);
        setIsSearchOpen(false);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
    };
    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className="relative">
            {/* Main Header */}
            <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="grid h-full grid-cols-3 items-center px-6">
                    {/* Chat Info Section */}
                    <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-semibold text-foreground">
                                General Chat
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                12 members online
                            </p>
                        </div>
                    </div>

                    {/* Search Input (centered) */}
                    <div className="flex justify-center">
                        <div
                            className="relative w-full max-w-md"
                            id="search-container"
                        >
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search messages..."
                                className="h-9 w-full pl-9 pr-10 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                value={search}
                                onChange={handleInput}
                                onFocus={() => setIsSearchOpen(true)}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 h-7 w-7 p-0 -translate-y-1/2 hover:bg-muted"
                                    onClick={clearSearch}
                                    title="Clear search"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex items-center justify-end space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-muted transition-colors"
                            title="View pinned messages"
                        >
                            <Pin className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-muted transition-colors"
                            title="Chat information"
                            onClick={toggle}
                        >
                            <Info className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && (search || isLoading) && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background border border-border rounded-b-lg shadow-lg z-50 max-h-96 overflow-hidden">
                    {isLoading && (
                        <div className="p-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                <span className="text-sm text-muted-foreground">
                                    Searching...
                                </span>
                            </div>
                        </div>
                    )}

                    {!isLoading && search && messages.length === 0 && (
                        <div className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                No messages found for {`"${search}"`}
                            </p>
                        </div>
                    )}

                    {!isLoading && messages.length > 0 && (
                        <>
                            <div className="p-3 border-b border-border bg-muted/30">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {messages.length} result
                                    {messages.length !== 1 ? "s" : ""} found
                                </p>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {messages.map((message) => (
                                    <MessageSearchResult
                                        key={message.id}
                                        message={message}
                                        searchTerm={search}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Backdrop */}
            {isSearchOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSearchOpen(false)}
                />
            )}
        </div>
    );
}
