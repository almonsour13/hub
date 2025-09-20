"use client";
import Sidebar from "@/components/hub/side-bar";
import AppLayout from "@/components/layout/app-layout";
import CreateHubModal from "@/components/modal/create-hub-modal";
import JoinHubModal from "@/components/modal/join-hub-modal";
import { useState } from "react";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [showCreateHubModal, setShowCreateHubModal] = useState(false);
    const [showJoinHubModal, setShowJoinHubModal] = useState(false);
    
    return (
        <AppLayout>
            <div className="flex h-screen">
                <Sidebar
                    setShowCreateHubModal={setShowCreateHubModal}
                    setShowJoinHubModal={setShowJoinHubModal}
                />
                <div className="flex flex-col flex-1 relative">{children}</div>
            </div>
            <CreateHubModal
                showCreateHubModal={showCreateHubModal}
                setShowCreateHubModal={setShowCreateHubModal}
            />
            <JoinHubModal
                showJoinHubModal={showJoinHubModal}
                setShowJoinHubModal={setShowJoinHubModal}
            />
        </AppLayout>
    );
}
