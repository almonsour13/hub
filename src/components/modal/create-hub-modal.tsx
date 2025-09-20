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
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { authSession } from "@/lib/session";
import { toast } from "sonner";
import { useCreateHub } from "@/hook/use-hub";

interface CreateHubProps {
    showCreateHubModal: boolean;
    setShowCreateHubModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateHubModal({
    showCreateHubModal,
    setShowCreateHubModal,
}: CreateHubProps) {
    const { user } = authSession();
    const [form, setForm] = useState({
        name: "",
        description: "",
    });

    const { mutate: createHub, isPending } = useCreateHub();

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.id) return;

        createHub(
            { userId: user.id, ...form },
            {
                onSuccess: (result) => {
                    setShowCreateHubModal(false);
                    toast.success(
                        result.message || "Hub created successfully!"
                    );
                    setForm({ name: "", description: "" });
                },
                onError: (error: any) => {
                    toast.error(error.message || "Failed to create hub.");
                },
            }
        );
    };

    return (
        <Dialog open={showCreateHubModal} onOpenChange={setShowCreateHubModal}>
            <DialogContent className="sm:max-w-[500px]">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Hub</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to set up a new hub. You
                            can update these later.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5">
                        {/* Hub Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="hub-name">Hub Name</Label>
                            <Input
                                id="hub-name"
                                name="name"
                                placeholder="Enter hub name"
                                required
                                value={form.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Hub Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="hub-description">Description</Label>
                            <Textarea
                                id="hub-description"
                                name="description"
                                placeholder="Describe the purpose of this hub"
                                value={form.description}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
