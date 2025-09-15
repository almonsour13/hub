"use client";
import AppLayout from "@/components/layout/app-layout";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <AppLayout>
            <div className="">{children}</div>
        </AppLayout>
    );
}
