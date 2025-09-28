import nodemailer from "nodemailer";
import crypto from "crypto";
import { getUsersCollection } from "@/lib/mongodb/collections";

export function generateVerificationToken(): string {
	return crypto.randomBytes(32).toString("hex");
}

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: Number.parseInt(process.env.SMTP_PORT || "587"),
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export async function sendEmail({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}) {
	try {
		await transporter.sendMail({
			from: `"MM Admin" <${process.env.FROM_EMAIL}>`,
			to,
			subject,
			html,
		});
		return { success: true };
	} catch (error) {
		console.error("Email sending error:", error);
		return { success: false, error };
	}
}

// Helper function to get the base URL from environment variables
export function getBaseUrl(): string {
	return (
		process.env.NEXT_PUBLIC_BASE_URL ||
		process.env.NEXTAUTH_URL ||
		"http://localhost:3000"
	);
}

export async function getAdminAndHREmails(): Promise<string> {
	try {
		// Try to get from database first
		const profilesCollection = await getUsersCollection();

		const adminAndHRProfiles = await profilesCollection
			.find({
				role: { $in: ["admin", "hr"] },
			})
			.toArray();

		const emails = adminAndHRProfiles
			.map((profile: any) => profile.email)
			.filter((email: string) => email && email.trim());

		// Return emails as comma-separated string
		return emails.join(", ");
	} catch (error) {
		console.error("[Email Service] Error getting admin/HR emails:", error);
		return "";
	}
}
