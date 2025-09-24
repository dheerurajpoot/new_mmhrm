import { type NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");
		let token: string | null = null;
		if (authHeader && authHeader.startsWith("Bearer ")) {
			token = authHeader.substring(7);
		} else {
			token = cookies().get("auth-token")?.value || null;
		}

		if (!token) {
			return NextResponse.json(
				{ error: "No token provided" },
				{ status: 401 }
			);
		}

		const sessionResult = await verifySession(token);

		if (!sessionResult.success) {
			return NextResponse.json(
				{ error: sessionResult.error },
				{ status: 401 }
			);
		}

		return NextResponse.json({
			success: true,
			user: sessionResult.user,
		});
	} catch (error) {
		console.error(" Get user API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
