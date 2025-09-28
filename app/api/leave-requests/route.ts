import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { getAllLeaveRequests } from "@/lib/mongodb/operations";

export async function GET(request: NextRequest) {
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

		const requests = await getAllLeaveRequests();

		// Serialize MongoDB documents to plain JSON-friendly objects
		const transformed = (requests || []).map((r: any) => ({
			id: r._id?.toString?.() || r._id,
			employee_id: r.employee_id?.toString?.() || r.employee_id,
			leave_type: r.leave_type,
			start_date:
				r.start_date instanceof Date
					? r.start_date.toISOString()
					: r.start_date,
			end_date:
				r.end_date instanceof Date
					? r.end_date.toISOString()
					: r.end_date,
			days_requested: r.days_requested,
			status: r.status,
			reason: r.reason,
			approved_by: r.approved_by?.toString?.() || r.approved_by || null,
			approved_at:
				r.approved_at instanceof Date
					? r.approved_at.toISOString()
					: r.approved_at || null,
			created_at:
				r.created_at instanceof Date
					? r.created_at.toISOString()
					: r.created_at,
			updated_at:
				r.updated_at instanceof Date
					? r.updated_at.toISOString()
					: r.updated_at,
			admin_notes: r.admin_notes || "",
			employee: r.employee
				? {
						id: r.employee.id,
						full_name: r.employee.full_name,
						email: r.employee.email,
						department: r.employee.department,
						position: r.employee.position,
						profile_photo: r.employee.profile_photo,
				  }
				: null,
		}));

		return NextResponse.json(transformed);
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
