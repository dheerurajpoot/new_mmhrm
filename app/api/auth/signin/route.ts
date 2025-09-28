import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateUser, createSession } from "@/lib/auth/auth";

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();
		console.log(email, password);

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		// Authenticate user
		const authResult = await authenticateUser(email, password);
		if (!authResult.success) {
			return NextResponse.json(
				{ error: authResult.error },
				{ status: 401 }
			);
		}

		// Create session
		const sessionResult = await createSession(authResult.user!.id);
		if (!sessionResult.success) {
			return NextResponse.json(
				{ error: sessionResult.error },
				{ status: 500 }
			);
		}

		console.log("Session result:", sessionResult);
		// Set cookie using Next cookies() API to ensure persistence
		if (sessionResult.token) {
			cookies().set("auth-token", sessionResult.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 60 * 60 * 24 * 7,
				path: "/",
			});
		}
		return NextResponse.json({
			success: true,
			user: authResult.user,
			token: sessionResult.token,
		});
	} catch (error) {
		console.error("Sign in API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
