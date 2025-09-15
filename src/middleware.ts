// // src/middleware.ts
// import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// export default withAuth(
//     function middleware(req) {
//         const { pathname } = req.nextUrl;
//         const token = req.nextauth.token; // this is the session token

//         // If user is authenticated and tries to go to signin or signup, redirect to /home
//         if (
//             token &&
//             (pathname.startsWith("/signin") || pathname.startsWith("/signup"))
//         ) {
//             return NextResponse.redirect(new URL("/hub", req.url));
//         }

//         // If user is NOT authenticated and tries to go to protected routes, redirect to signin
//         if (!token && pathname.startsWith("/hub")) {
//             return NextResponse.redirect(new URL("/signin", req.url));
//         }

//         return NextResponse.next();
//     },
//     {
//         callbacks: {
//             authorized: ({ token }) => !!token, // all protected routes require a token
//         },
//     }
// );

// // Configure which routes to check
// export const config = {
//     matcher: ["/hub/:path*", "/signin", "/signup"],
// };
export default function (NextResponse:NextResponse){
    
}