import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerUser } from "@/lib/auth/server";
import {
	getLeaveRequestsCollection,
	getUsersCollection,
} from "@/lib/mongodb/collections";
import { getAdminAndHREmails, sendEmail } from "@/lib/services/email";
import { leaveRequestNotificationTemplate } from "@/lib/services/mail-templates";

export async function GET(request: NextRequest) {
	try {
		const user = await getServerUser();
		if (!user)
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);

		const collection = await getLeaveRequestsCollection();
		const docs = await collection
			.find({ employee_id: new ObjectId(user._id!.toString()) })
			.sort({ created_at: -1 })
			.toArray();

		const payload = docs.map((r: any) => ({
			id: (r as any)._id?.toString?.() || (r as any)._id,
			employee_id: r.employee_id.toString(),
			leave_type: r.leave_type,
			start_date: r.start_date,
			end_date: r.end_date,
			days_requested: r.days_requested,
			status: r.status,
			reason: r.reason,
			approved_by: r.approved_by?.toString?.() || r.approved_by,
			approved_at: r.approved_at,
			created_at: r.created_at,
		}));

		return NextResponse.json(payload);
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const user = await getServerUser();
		if (!user)
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);

		const { leave_type, start_date, end_date, days_requested, reason } =
			await request.json();
		if (!leave_type || !start_date || !end_date || !days_requested) {
			return NextResponse.json(
				{ error: "Missing fields" },
				{ status: 400 }
			);
		}

		const collection = await getLeaveRequestsCollection();
		const doc = {
			employee_id: new ObjectId(user._id!.toString()),
			leave_type,
			start_date: new Date(start_date),
			end_date: new Date(end_date),
			days_requested: Number(days_requested),
			reason: reason || "",
			status: "pending" as const,
			created_at: new Date(),
			updated_at: new Date(),
		};

		const result = await collection.insertOne(doc);

		// Send email notification to admins/HR
		try {
			const profilesCollection = await getUsersCollection();
			const employeeProfile = await profilesCollection.findOne({
				_id: new ObjectId(user._id!.toString()),
			});

			if (employeeProfile) {
				const adminEmails = await getAdminAndHREmails();

				const employeeName =
					employeeProfile.full_name ||
					employeeProfile.email ||
					"Unknown Employee";

				const emailHtml = leaveRequestNotificationTemplate(
					employeeName,
					employeeProfile.email,
					{
						leaveType: leave_type,
						startDate: start_date,
						endDate: end_date,
						daysRequested: Number(days_requested),
						reason: reason || undefined,
					}
				);
				await sendEmail({
					to: adminEmails,
					subject: `New Leave Request from ${employeeName}`,
					html: emailHtml,
				});
			} else {
				console.log(
					"Employee profile not found, skipping email notification"
				);
			}
		} catch (emailError) {
			console.error(
				"Failed to send leave request notification:",
				emailError
			);
		}

		return NextResponse.json({
			success: true,
			id: result.insertedId.toString(),
		});
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
