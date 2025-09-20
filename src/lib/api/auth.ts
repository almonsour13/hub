import { AuthResponse, GoogleSignInData, SignInData, SignUpData } from "@/type/auth";

export const signInUserAPI = async (
    data: SignInData
): Promise<AuthResponse> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER}/api/auth/signin`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        // If response is not ok, throw with backend error or fallback message
        if (!response.ok) {
            let errorMessage = "Sign in failed";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // fallback if response is not JSON (like HTML error page)
                errorMessage = await response.text();
            }
            throw new Error(errorMessage);
        }

        // ✅ always return parsed JSON
        return response.json();
    } catch (error: any) {
        console.error("Sign in error:", error.message);
        throw error;
    }
};
export const signUpUserAPI = async (
    data: SignUpData
) => {
    console.log("dta:", data);
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/auth/signup`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sign up failed");
    }

    return response.json();
};

export async function googleSignInAPI(
    data: GoogleSignInData
): Promise<AuthResponse> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/auth/google-signin`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sign up failed");
    }

    return response.json();
}
