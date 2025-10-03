import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { getUsersCollection } from "@/lib/mongodb/collections";

export async function GET(request: NextRequest) {
	try {
		console.log("[Employee Search API] Starting request...");
		const user = await getServerUser();
		console.log("[Employee Search API] User:", user ? `${user.full_name} (${user.role})` : "Not authenticated");
		
		if (!user) {
			console.log("[Employee Search API] Unauthorized access");
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Allow all authenticated users (admin, hr, employee) to search employees
		let employees: any[] = [];

		try {
			console.log("[Employee Search API] Fetching from database...");
			// Fetch directly from users collection
			const usersCollection = await getUsersCollection();
			employees = await usersCollection.find({}).toArray();
			console.log("[Employee Search API] Found employees:", employees.length);

			// Convert User[] to Profile-like format
			employees = employees.map((user: any) => ({
				...user,
				user_id: user._id, // Add user_id field for compatibility
			}));
		} catch (dbError) {
			console.error("[Employee Search API] Database error:", dbError);
			// Return empty array instead of mock data
			employees = [];
		}

		// Transform the data to match the expected format
		const transformedEmployees = employees.map((emp: any) => ({
			id: emp._id?.toString?.() || emp._id,
			email: emp.email || "",
			full_name: emp.full_name || "",
			role: emp.role || "employee",
			department: emp.department || "",
			position: emp.position || "",
			phone: emp.phone || "",
			address: emp.address || "",
			profile_photo: emp.profile_photo || null,
			birth_date: emp.birth_date || null,
			hire_date: emp.hire_date || null,
			created_at: emp.created_at || new Date(),
			updated_at: emp.updated_at || new Date(),
		}));

		console.log("[Employee Search API] Returning transformed employees:", transformedEmployees.length);
		return NextResponse.json(transformedEmployees);
	} catch (error) {
		console.error("[Employee Search API] Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
