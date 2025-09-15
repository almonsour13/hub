import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { googleSignInAPI, signInUserAPI } from "@/lib/api/auth";
import { User } from "@/type/user";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "select_account", // always ask to choose account
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const result = await signInUserAPI({
                    email: credentials.email,
                    password: credentials.password,
                });
                if (result.user) {
                    console.log(result.user);
                    return {
                        id: (result.user as User).id,
                        name: (result.user as User).name,
                        email: (result.user as User).email,
                    };
                }
                throw new Error(result.error || "Invalid credentials");
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                const result = await googleSignInAPI({
                    email: user.email!,
                    name: user.name,
                    image: user.image,
                    providerId: account.providerAccountId,
                });

                if (result.user) {
                    user.id = (result.user as User).id;
                    user.name = (result.user as User).name;
                    return true;
                }

                console.error("Google sign-in failed:", result.error);
                return false;
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            // Expose the ID inside session
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };
