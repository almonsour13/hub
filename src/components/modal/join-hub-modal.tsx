"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJoinHub } from "@/hook/use-hub";
import { useAuthSession } from "@/lib/session";
import { useState } from "react";
import { toast } from "sonner";

interface CreateHubProps {
    showJoinHubModal: boolean;
    setShowJoinHubModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function JoinHubModal({
    showJoinHubModal,
    setShowJoinHubModal,
}: CreateHubProps) {
    const { user } = useAuthSession();
    const [form, setForm] = useState({
        code: "",
    });

    const { mutate: joinHub, isPending } = useJoinHub();

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.id) return;

        joinHub(
            { userId: user.id, ...form },
            {
                onSuccess: (result) => {
                    setShowJoinHubModal(false);
                    toast.success(
                        result.message || "Hub created successfully!"
                    );
                    setForm({ code: "" });
                },
                onError: () => {
                    toast.error("Failed to create hub.");
                },
            }
        );
    };

    return (
        <Dialog open={showJoinHubModal} onOpenChange={setShowJoinHubModal}>
            <DialogContent className="sm:max-w-[500px]">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            Join Hub
                        </DialogTitle>
                        <DialogDescription>
                            Enter the hub code provided by the hub administrator
                            to join an existing hub.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5">
                        {/* Hub Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="hub-code">Hub Code</Label>
                            <Input
                                id="hub-code"
                                name="code"
                                placeholder="Enter hub code (e.g., abc123)"
                                value={form.code}
                                onChange={handleInputChange}
                                className="font-mono"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Hub codes are case-insensitive and typically 6
                                characters long
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Joining..." : "Joine"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
