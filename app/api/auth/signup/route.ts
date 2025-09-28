import { type NextRequest, NextResponse } from "next/server";
import { createUser, createSession } from "@/lib/auth/auth";
import {
	getEmailVerificationTokensCollection,
	getUsersCollection,
} from "@/lib/mongodb/collections";
import {
	generateVerificationToken,
	getBaseUrl,
	sendEmail,
} from "@/lib/services/email";
import { verificationMailTemplate } from "@/lib/services/mail-templates";

export async function POST(request: NextRequest) {
	try {
		const { email, full_name } = await request.json();

		if (!email || !full_name) {
			return NextResponse.json(
				{ error: "Email and full name are required" },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Please enter a valid email address" },
				{ status: 400 }
			);
		}

		// Check if user already exists (without creating them)
		const usersCollection = await getUsersCollection();
		const existingUser = await usersCollection.findOne({ email });

		if (existingUser) {
			return NextResponse.json(
				{ error: "An account with this email already exists" },
				{ status: 400 }
			);
		}

		// Generate verification token
		const verificationToken = generateVerificationToken();
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

		// Clean up any existing verification tokens for this email
		const tokensCollection = await getEmailVerificationTokensCollection();
		await tokensCollection.deleteMany({ email });

		// Save verification token to database
		await tokensCollection.insertOne({
			email,
			token: verificationToken,
			full_name,
			role: "employee",
			expires_at: expiresAt,
			used: false,
			created_at: new Date(),
		});

		const verificationUrl = `${getBaseUrl()}/auth/verify-email?token=${verificationToken}`;

		const emailHtml = verificationMailTemplate(full_name, verificationUrl);
		// Send verification email
		const emailResult = await sendEmail({
			to: email,
			subject: "Verify Your Email - Complete Your Registration",
			html: emailHtml,
		});
		if (!emailResult) {
			return NextResponse.json({
				success: true,
				message: `Email service is not working properly. Please use this link to complete your registration: ${verificationUrl}`,
				verificationUrl: verificationUrl,
				token: verificationToken,
				emailError: emailResult,
			});
		}

		console.log(" Signup successful for user:", email);
		return NextResponse.json({
			success: true,
			message:
				"Verification email sent! Please check your inbox and click the link to complete your registration.",
		});
	} catch (error) {
		console.error(" Sign up API error:", error);
		console.error(" Error details:", {
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		});
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
