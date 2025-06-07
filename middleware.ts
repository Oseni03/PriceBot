import { NextRequest, NextResponse } from "next/server";

type AuthPath = "/auth/sign-in" | "/auth/sign-up";
const authPaths: AuthPath[] = ["/auth/sign-in", "/auth/sign-up"];

const isProtectedRoute = (pathname: string): boolean => {
	if (!pathname || typeof pathname !== "string") return false;
	return pathname.startsWith("/builder") || pathname.startsWith("/dashboard");
};

export async function middleware(request: NextRequest) {
	try {
		const { pathname } = request.nextUrl;

		// Validate pathname
		if (!pathname) {
			throw new Error("Invalid pathname");
		}

		// Get Firebase auth token from cookie
		const hasAuthToken = request.cookies.has("firebaseAuthToken");

		// Check if the path is an auth path
		const isAuthPath = authPaths.some((path) => pathname === path);

		// If the path is protected and no token exists, redirect to login
		if (isProtectedRoute(pathname) && !hasAuthToken) {
			const url = new URL("/auth/sign-in", request.url);
			url.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(url);
		}

		// If there's a token and trying to access an auth page, redirect to dashboard
		if (isAuthPath && hasAuthToken) {
			return NextResponse.redirect(
				new URL("/dashboard/chat", request.url)
			);
		}

		// Redirect specific paths to "/dashboard/chat"
		if (["/dashboard", "/builder"].includes(pathname)) {
			return NextResponse.redirect(
				new URL("/dashboard/chat", request.url)
			);
		}

		return NextResponse.next();
	} catch (error) {
		console.error("Middleware error:", error);
		return NextResponse.next();
	}
}

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
