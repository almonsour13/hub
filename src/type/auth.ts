export interface SignUpData {
    name: string;
    email: string;
    password: string;
}
export interface SignInData {
    email: string;
    password: string;
}
export interface GoogleSignInData {
    email: string;
    name?: string | null;
    image?: string | null;
    providerId: string;
}
export interface AuthResponse {
    success: boolean;
    message: string;
    error?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        password?:string
    };
}