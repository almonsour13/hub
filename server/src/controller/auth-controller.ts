import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ error: "Name, email, and password are required" });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res
                .status(409)
                .json({ error: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                provider: "credentials",
                emailVerified: null, // Will be verified later if needed
            },
        });

        // Remove password before sending response
        const { password: _, ...userWithoutPassword } = newUser;

        return res.status(201).json({
            message: "User created successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const signin = async (req: Request, res: Response) => {
    try {
        const { email, password, credentials = "credentials" } = req.body;

        console.log("📩 Signin attempt:", { email });

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            console.log("❌ No user found with email:", email);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log("❌ Invalid password for email:", email);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Strip password before sending response
        const { password: _, ...userWithoutPassword } = user;
        console.log(password);
        console.log("✅ User signed in:", userWithoutPassword);

        return res.status(200).json({
            message: "Signin successful",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("❌ Error signing in:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const googleSignin = async (req: Request, res: Response) => {
    try {
        const { email, name, image, provider, providerId } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    image,
                    provider,
                    providerId,
                    emailVerified: new Date(),
                },
            });
        }
        
        console.log("✅ User signed in:", user);
        return res.status(200).json({
            message: "Signin successful",
            user:user,
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { register, signin, googleSignin };
