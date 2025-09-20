"use client";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/lib/session";
import Link from "next/link";

export default function Home() {
    const { user } = useAuthSession();
    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 h-14 w-full flex items-center  border-b px-4">
                <div className="mx-auto w-full max-w-7xl flex justify-between items-center">
                    <div className="">
                        <h1>Vibecall</h1>
                    </div>
                    <div className="">
                        {user ? (
                            <div className="">
                                <Link href="/hub" className="block">
                                    <Button className="cursor-pointer">
                                        Open Hub
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link href="/signin" className="block">
                                    <Button className="cursor-pointer">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/signup" className="block">
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer bg-transparent"
                                    >
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
