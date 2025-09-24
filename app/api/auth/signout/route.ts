import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth/auth";

export async function POST(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			// Still clear cookie even if token header missing
			cookies().set("auth-token", "", { path: "/", maxAge: 0 });
			return NextResponse.json({ success: true });
		}

		const token = authHeader.substring(7);
		await deleteSession(token);

		cookies().set("auth-token", "", { path: "/", maxAge: 0 });
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(" Sign out API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
