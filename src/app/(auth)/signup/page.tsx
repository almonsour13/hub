"use client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUpUser } from "@/hook/use-auth";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
    const { mutate: signUp, isPending, error, isError } = useSignUpUser();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await signUp(form);
        
        const signInResult = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
            callbackUrl: "/hub",
        });

        if (signInResult?.error) {
            console.error("Sign in failed:", signInResult.error);
            // Optionally show a UI error message here
        }
        setForm({
            name: "",
            email: "",
            password: "",
        });
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Sign Up</CardTitle>
                    <CardDescription>
                        Create your account to get started
                    </CardDescription>
                </CardHeader>
                {isError && <p>{error.message}</p>}
                <CardContent className="space-y-4">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your name"
                                required
                                value={form.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                value={form.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                required
                                value={form.password}
                                onChange={handleInputChange}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            {isPending ? "Signing up..." : "Sign Up"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={() =>
                            signIn("google", { callbackUrl: "/hub" })
                        }
                        className="w-full"
                        variant="outline"
                    >
                        Continue with Google
                    </Button>

                    <div className="text-center text-sm">
                        {"Don't"} have an account?{" "}
                        <Link
                            href="/signin"
                            className="text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
