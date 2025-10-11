import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
	getLeaveRequestsCollection,
	getLeaveBalancesCollection,
	getUsersCollection,
} from "@/lib/mongodb/collections";
import { getServerUser } from "@/lib/auth/server";
import { sendEmail } from "@/lib/services/email";
import { leaveApprovalTemplate } from "@/lib/services/mail-templates";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await getServerUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (!["admin", "hr"].includes(user.role)) {
			return NextResponse.json(
				{ error: "Access denied" },
				{ status: 403 }
			);
		}

		const requestId = params.id;
		const body = await request.json();

		if (!ObjectId.isValid(requestId)) {
			return NextResponse.json(
				{ error: "Invalid request ID" },
				{ status: 400 }
			);
		}

		const leaveRequestsCollection = await getLeaveRequestsCollection();

		const updatePayload: any = {
			...body,
			updated_at: new Date(),
		};

		// Automatically set approved_by to current user when status is being updated
		if (body.status === "approved" || body.status === "rejected") {
			updatePayload.approved_by = new ObjectId(user._id!.toString());
		}

		if (body.status === "approved") {
			updatePayload.approved_at = new Date();
		}

		const result = await leaveRequestsCollection.findOneAndUpdate(
			{ _id: new ObjectId(requestId) },
			{ $set: updatePayload },
			{ returnDocument: "after" }
		);

		if (!result) {
			return NextResponse.json(
				{ error: "Leave request not found" },
				{ status: 404 }
			);
		}

		// If approved, update leave balance
		if (body.status === "approved") {
			const leaveBalancesCollection = await getLeaveBalancesCollection();

			await leaveBalancesCollection.updateOne(
				{
					employee_id: result.employee_id,
					leave_type: result.leave_type,
					year: new Date(result.start_date).getFullYear(),
				},
				{
					$inc: { used_days: result.days_requested },
					$set: { updated_at: new Date() },
				}
			);

			// Recalculate remaining days
			await leaveBalancesCollection.updateOne(
				{
					employee_id: result.employee_id,
					leave_type: result.leave_type,
					year: new Date(result.start_date).getFullYear(),
				},
				[
					{
						$set: {
							remaining_days: {
								$subtract: ["$total_days", "$used_days"],
							},
						},
					},
				]
			);
		}

		// Send email notification to employee about status change
		try {
			if (body.status === "approved" || body.status === "rejected") {
				const profilesCollection = await getUsersCollection();
				const employeeProfile = await profilesCollection.findOne({
					_id: result.employee_id,
				});

				if (employeeProfile) {
					const approverProfile = await profilesCollection.findOne({
						_id: new ObjectId(user._id!.toString()),
					});

					const emailHtml = leaveApprovalTemplate(
						employeeProfile.full_name ||
							employeeProfile.email ||
							"Employee",
						{
							leaveType: result.leave_type,
							startDate: result.start_date.toISOString(),
							endDate: result.end_date.toISOString(),
							daysRequested: result.days_requested,
							status: body.status,
							adminNotes: body.admin_notes,
							approvedBy:
								approverProfile?.full_name ||
								approverProfile?.email ||
								"Admin",
						}
					);

					await sendEmail({
						to: employeeProfile.email,
						subject: `Leave Request ${
							body.status === "approved"
								? "Approved"
								: "Status Update"
						}`,
						html: emailHtml,
					});
				} else {
					console.log(
						"Employee profile not found, skipping email notification"
					);
				}
			}
		} catch (emailError) {
			console.error(
				"Failed to send leave status notification:",
				emailError
			);
			// Don't fail the request if email fails
		}

		// Trigger real-time notification for leave status change
		if (body.status === "approved" || body.status === "rejected") {
			try {
				// This will be handled by the client-side realtime system
				// The notification will be triggered when the client polls for updates
				console.log(`Leave request ${body.status}: ${result.leave_type} for ${result.days_requested} days`);
			} catch (notificationError) {
				console.error("Failed to trigger leave status notification:", notificationError);
			}
		}

		// Serialize for client safety
		const safe = {
			id: (result as any)._id?.toString?.() || (result as any)._id,
			employee_id:
				(result as any).employee_id?.toString?.() ||
				(result as any).employee_id,
			leave_type: (result as any).leave_type,
			start_date:
				(result as any).start_date instanceof Date
					? (result as any).start_date.toISOString()
					: (result as any).start_date,
			end_date:
				(result as any).end_date instanceof Date
					? (result as any).end_date.toISOString()
					: (result as any).end_date,
			days_requested: (result as any).days_requested,
			status: (result as any).status,
			reason: (result as any).reason,
			approved_by:
				(result as any).approved_by?.toString?.() ||
				(result as any).approved_by ||
				null,
			approved_at:
				(result as any).approved_at instanceof Date
					? (result as any).approved_at.toISOString()
					: (result as any).approved_at || null,
			created_at:
				(result as any).created_at instanceof Date
					? (result as any).created_at.toISOString()
					: (result as any).created_at,
			updated_at:
				(result as any).updated_at instanceof Date
					? (result as any).updated_at.toISOString()
					: (result as any).updated_at,
			admin_notes: (result as any).admin_notes || "",
		};

		return NextResponse.json({ success: true, data: safe });
	} catch (error) {
		console.error("Error updating leave request:", error);
		return NextResponse.json(
			{ error: "Failed to update leave request" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const requestId = params.id;

		if (!ObjectId.isValid(requestId)) {
			return NextResponse.json(
				{ error: "Invalid request ID" },
				{ status: 400 }
			);
		}

		const leaveRequestsCollection = await getLeaveRequestsCollection();

		const result = await leaveRequestsCollection.deleteOne({
			_id: new ObjectId(requestId),
		});

		if (result.deletedCount === 0) {
			return NextResponse.json(
				{ error: "Leave request not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Leave request deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting leave request:", error);
		return NextResponse.json(
			{ error: "Failed to delete leave request" },
			{ status: 500 }
		);
	}
}
