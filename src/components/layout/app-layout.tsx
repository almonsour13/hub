import { useGlobalMessageHandler } from "@/hook/use-global-message-handler";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
    useGlobalMessageHandler()
    return (
        // <WebSocketProvider>
            <div className="min-h-screen w-full flex bg-background">
                <div className="flex-1 flex flex-col">
                    {children}
                </div>
            </div>
        // </WebSocketProvider>
    );
}
