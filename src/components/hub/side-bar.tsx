import { Plus, Users } from "lucide-react";
import { Button } from "../ui/button";
import ChatList from "./chat-list";
import { signOut } from "next-auth/react";
import { authSession } from "@/lib/session";
import { useTheme } from "next-themes";

interface Sidebar {
    setShowCreateHubModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowJoinHubModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({
    setShowCreateHubModal,
    setShowJoinHubModal,
}: Sidebar) {
    const { user } = authSession();
    const {theme, setTheme} = useTheme();
    return (
        <div className=" w-64 h-screen flex flex-col border-border/50 border-r">
            <header className="shrink-0 px-4 py-4 ">
                {/* Action buttons */}
                <div className="flex gap-2 mb-4">
                    <Button
                        onClick={() => setShowCreateHubModal(true)}
                        size="sm"
                        className="flex-1 h-9 gap-2 bg-primary rounded shadow-sm transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        Create
                    </Button>
                    <Button
                        onClick={() => setShowJoinHubModal(true)}
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 gap-2 rounded border-border/50 hover:bg-accent/50 transition-all duration-200"
                    >
                        <Users className="w-4 h-4" />
                        Join
                    </Button>
                </div>
            </header>
            <ChatList />

            <div className="space-y-2 px-4">
                <Button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === "dark" ? "Light" : "Dark"}
                </Button>
                <Button
                    className="w-full justify-start px-2 text-left cursor-pointer"
                    size="lg"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <span className="text-left">Sign out</span>
                </Button>
                <div className="p-2 rounded bg-muted flex items-center justify-start">
                    {user?.name}
                </div>
            </div>
        </div>
    );
}
