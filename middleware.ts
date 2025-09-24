import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const token = request.cookies.get("auth-token")?.value || null;
	const isProtected =
		pathname.startsWith("/admin") ||
		pathname.startsWith("/hr") ||
		pathname.startsWith("/employee");
	// // If no token and accessing protected, redirect to login
	if (!token && isProtected) {
		const url = request.nextUrl.clone();
		url.pathname = "/auth/login";
		return NextResponse.redirect(url);
	}
}

export const config = {
	matcher: [
		"/",
		"/auth",
		"/admin",
		"/hr",
		"/employee",
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
