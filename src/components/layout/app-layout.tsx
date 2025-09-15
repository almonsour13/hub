import { WebSocketProvider } from "@/context/websocket-context";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <WebSocketProvider>
            <div className="min-h-screen w-full flex bg-background">
                <div className="flex-1 flex flex-col bg-sidebar rounded-xl">
                    {children}
                </div>
            </div>
        </WebSocketProvider>
    );
}
