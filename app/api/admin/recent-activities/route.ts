import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server";
import {
	getProfilesCollection,
	getUsersCollection,
	getLeaveRequestsCollection,
	getTeamsCollection,
	getTimeEntriesCollection,
} from "@/lib/mongodb/collections";

export async function GET(request: NextRequest) {
	try {
		const user = await getServerUser();
		if (!user || !["admin", "hr"].includes(user.role)) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const activities: any[] = [];

		// Helper function to get employee data from either collection
		const getEmployeeData = async (employeeId: any): Promise<any> => {
			try {
				const profilesCollection = await getProfilesCollection();
				let employee = await profilesCollection.findOne({
					_id: employeeId,
				});

				if (!employee) {
					const usersCollection = await getUsersCollection();
					const userEmployee = await usersCollection.findOne({
						_id: employeeId,
					});
					if (userEmployee) {
						// Convert User to Profile-like format
						employee = {
							...userEmployee,
							user_id: userEmployee._id, // Add user_id field for compatibility
						};
					}
				}

				return employee;
			} catch (error) {
				console.error("Error fetching employee data:", error);
				return null;
			}
		};

		try {
			// Get recent leave requests
			const leaveRequestsCollection = await getLeaveRequestsCollection();
			const recentLeaveRequests = await leaveRequestsCollection
				.find({})
				.sort({ created_at: -1 })
				.limit(10)
				.toArray();

			// Get recent teams
			const teamsCollection = await getTeamsCollection();
			const recentTeams = await teamsCollection
				.find({})
				.sort({ created_at: -1 })
				.limit(5)
				.toArray();

			// Get recent employees - try profiles first, then users
			const profilesCollection = await getProfilesCollection();
			let recentEmployees: any[] = await profilesCollection
				.find({})
				.sort({ created_at: -1 })
				.limit(5)
				.toArray();

			// If profiles collection is empty, try users collection
			if (recentEmployees.length === 0) {
				const usersCollection = await getUsersCollection();
				recentEmployees = await usersCollection
					.find({})
					.sort({ created_at: -1 })
					.limit(5)
					.toArray();
			}

			// Get recent time entries
			const timeEntriesCollection = await getTimeEntriesCollection();
			const recentTimeEntries = await timeEntriesCollection
				.find({})
				.sort({ created_at: -1 })
				.limit(5)
				.toArray();

			// Process leave requests (all recent ones, not just pending)
			for (const leaveRequest of recentLeaveRequests) {
				const employee = await getEmployeeData(
					leaveRequest.employee_id
				);
				if (employee) {
					activities.push({
						id: `leave-request-${leaveRequest._id}`,
						type: "leave_request",
						title: "Leave Request Submitted",
						description: `${
							employee.full_name || employee.email
						} submitted a ${leaveRequest.leave_type} request for ${
							leaveRequest.days_requested || 1
						} days`,
						details: {
							leaveType: leaveRequest.leave_type,
							startDate: leaveRequest.start_date,
							endDate: leaveRequest.end_date,
							daysRequested: leaveRequest.days_requested || 1,
							status: leaveRequest.status,
							reason: leaveRequest.reason,
						},
						user: {
							name: employee.full_name || employee.email,
							email: employee.email,
							profile_photo: employee.profile_photo,
							role: employee.role,
						},
						timestamp: leaveRequest.created_at || new Date(),
						status: leaveRequest.status,
					});
				}
			}

			// Process leave approvals/rejections (only processed ones)
			for (const leaveRequest of recentLeaveRequests.filter(
				(lr) => lr.status !== "pending" && lr.approved_at
			)) {
				const employee = await getEmployeeData(
					leaveRequest.employee_id
				);
				const approver = leaveRequest.approved_by
					? await getEmployeeData(leaveRequest.approved_by)
					: null;

				if (employee && approver) {
					activities.push({
						id: `leave-${leaveRequest.status}-${leaveRequest._id}`,
						type: "leave_approval",
						title: `Leave Request ${
							leaveRequest.status === "approved"
								? "Approved"
								: "Rejected"
						}`,
						description: `${approver.full_name || approver.email} ${
							leaveRequest.status
						} ${employee.full_name || employee.email}'s ${
							leaveRequest.leave_type
						} request`,
						details: {
							leaveType: leaveRequest.leave_type,
							startDate: leaveRequest.start_date,
							endDate: leaveRequest.end_date,
							daysRequested: leaveRequest.days_requested,
							status: leaveRequest.status,
							reason: leaveRequest.reason,
						},
						user: {
							name: approver.full_name || approver.email,
							email: approver.email,
							profile_photo: approver.profile_photo,
							role: approver.role,
						},
						targetUser: {
							name: employee.full_name || employee.email,
							email: employee.email,
							profile_photo: employee.profile_photo,
							role: employee.role,
						},
						timestamp: leaveRequest.approved_at,
						status: leaveRequest.status,
					});
				}
			}

			// Process new teams
			for (const team of recentTeams) {
				const leader = team.leader_id
					? await getEmployeeData(team.leader_id)
					: null;

				activities.push({
					id: `team-${team._id}`,
					type: "team_created",
					title: "New Team Created",
					description: leader
						? `${leader.full_name || leader.email} created team "${
								team.name
						  }"`
						: `Team "${team.name}" was created`,
					details: {
						teamName: team.name,
						leaderId: team.leader_id,
					},
					user: leader
						? {
								name: leader.full_name || leader.email,
								email: leader.email,
								profile_photo: leader.profile_photo,
								role: leader.role,
						  }
						: null,
					timestamp: team.created_at || new Date(),
					status: "created",
				});
			}

			// Only show employee registrations if they are truly recent (within last 7 days)
			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			for (const employee of recentEmployees) {
				const employeeCreatedAt = new Date(
					employee.created_at || employee.updated_at || new Date()
				);

				// Only show if employee was created within the last 7 days
				if (employeeCreatedAt > sevenDaysAgo) {
					activities.push({
						id: `employee-${employee._id}`,
						type: "employee_registered",
						title: "New Employee Registered",
						description: `${
							employee.full_name || employee.email
						} joined as ${employee.role}`,
						details: {
							role: employee.role,
							department: employee.department || "Not specified",
							position: employee.position || "Not specified",
						},
						user: {
							name: employee.full_name || employee.email,
							email: employee.email,
							profile_photo: employee.profile_photo,
							role: employee.role,
						},
						timestamp: employeeCreatedAt,
						status: "registered",
					});
				}
			}

			// Process time entries (clock in/out) - create separate activities for clock in and clock out
			for (const timeEntry of recentTimeEntries) {
				const employee = await getEmployeeData(timeEntry.employee_id);

				if (employee) {
					// Clock In Activity - send raw timestamp for client-side formatting
					activities.push({
						id: `clock-in-${timeEntry._id}`,
						type: "clock_in",
						title: "Clock In",
						description: `${
							employee.full_name || employee.email
						} clocked in`,
						details: {
							clockIn: timeEntry.clock_in,
							clockOut: timeEntry.clock_out,
							breakDuration: timeEntry.break_duration,
							totalHours: timeEntry.total_hours,
							date: timeEntry.date,
							action: "clock_in",
							// Include raw timestamp for client-side formatting
							rawTimestamp: timeEntry.clock_in,
						},
						user: {
							name: employee.full_name || employee.email,
							email: employee.email,
							profile_photo: employee.profile_photo,
							role: employee.role,
						},
						timestamp: timeEntry.clock_in,
						status: "clocked_in",
					});

					// Clock Out Activity (if exists) - send raw timestamp for client-side formatting
					if (timeEntry.clock_out) {
						activities.push({
							id: `clock-out-${timeEntry._id}`,
							type: "clock_out",
							title: "Clock Out",
							description: `${
								employee.full_name || employee.email
							} clocked out`,
							details: {
								clockIn: timeEntry.clock_in,
								clockOut: timeEntry.clock_out,
								breakDuration: timeEntry.break_duration,
								totalHours: timeEntry.total_hours,
								date: timeEntry.date,
								action: "clock_out",
								// Include raw timestamp for client-side formatting
								rawTimestamp: timeEntry.clock_out,
							},
							user: {
								name: employee.full_name || employee.email,
								email: employee.email,
								profile_photo: employee.profile_photo,
								role: employee.role,
							},
							timestamp: timeEntry.clock_out,
							status: "clocked_out",
						});
					}
				}
			}

			// Sort all activities by timestamp (most recent first) and limit to 10
			activities.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() -
					new Date(a.timestamp).getTime()
			);

			return NextResponse.json(activities.slice(0, 10));
		} catch (dbError) {
			console.error("Database error:", dbError);
			// Return empty array instead of mock data
			return NextResponse.json([]);
		}
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}