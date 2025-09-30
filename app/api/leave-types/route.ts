import { type NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import { getLeaveTypesCollection } from "@/lib/mongodb/collections";

export async function GET(request: NextRequest) {
	try {
		const user = await getServerUser();
		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Allow all authenticated users to access leave types
		let leaveTypes: any[] = [];

		try {
			const collection = await getLeaveTypesCollection();
			const defaults = [
				{
					name: "Annual Leave",
					description: "General purpose leave",
					max_days_per_year: 25,
					carry_forward: false,
				},
				{
					name: "Sick Leave",
					description: "Illness or recovery",
					max_days_per_year: 12,
					carry_forward: true,
				},
				{
					name: "Personal Leave",
					description: "Personal matters",
					max_days_per_year: 5,
					carry_forward: false,
				},
				{
					name: "Maternity Leave",
					description: "Maternity and childcare",
					max_days_per_year: 90,
					carry_forward: false,
				},
				{
					name: "Emergency Leave",
					description: "Emergency situations",
					max_days_per_year: 3,
					carry_forward: false,
				},
			];

			// Seed defaults if empty
			const count = await collection.countDocuments({});
			if (count === 0) {
				console.log("Seeding default leave types...");
				const inserted = await collection.insertMany(
					defaults.map((d) => ({
						...d,
						created_at: new Date(),
						updated_at: new Date(),
					}))
				);
				console.log("Inserted leave types:", inserted);
			}

			const docs = await collection.find({}).toArray();
			leaveTypes = docs.map((d) => ({
				id: (d as any)._id?.toString?.() || (d as any)._id,
				name: d.name,
				description: d.description,
				max_days_per_year: d.max_days_per_year,
				carry_forward: d.carry_forward,
			}));
			console.log("Database leave types:", leaveTypes);
		} catch (dbError) {
			console.error("Database error:", dbError);
			// Fallback to mock data for testing when database is not available
			leaveTypes = [
				{
					_id: "1",
					name: "Casual leave",
					description: "General purpose leave",
					max_days_per_year: 12,
					carry_forward: false,
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					_id: "2",
					name: "Sick leave",
					description: "Illness or recovery",
					max_days_per_year: 10,
					carry_forward: true,
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					_id: "3",
					name: "Medical leave",
					description: "Medical procedures",
					max_days_per_year: 7,
					carry_forward: false,
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					_id: "4",
					name: "Marriage leave",
					description: "Marriage ceremony",
					max_days_per_year: 7,
					carry_forward: false,
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					_id: "5",
					name: "Halfday leave",
					description: "Half-day absence",
					max_days_per_year: 24,
					carry_forward: false,
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					_id: "6",
					name: "Shortday leave",
					description: "Short absence",
					max_days_per_year: 24,
					carry_forward: false,
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					_id: "7",
					name: "Mensuration leave",
					description: "Period leave",
					max_days_per_year: 12,
					carry_forward: false,
					created_at: new Date(),
					updated_at: new Date(),
				},
				{
					_id: "8",
					name: "Workfrom home",
					description: "WFH days",
					max_days_per_year: 60,
					carry_forward: false,
					created_at: new Date(),
					updated_at: new Date(),
				},
			];
		}

		// Transform the data to match the expected format
		const transformedLeaveTypes = leaveTypes.map((type: any) => ({
			id: type._id?.toString?.() || type._id,
			name: type.name || "",
			description: type.description || "",
			max_days_per_year: type.max_days_per_year || type.days_per_year || 0,
			carry_forward: type.carry_forward || false,
			created_at: type.created_at || new Date(),
			updated_at: type.updated_at || new Date(),
		}));

		console.log("Transformed leave types:", transformedLeaveTypes);
		return NextResponse.json(transformedLeaveTypes);
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
