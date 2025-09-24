"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { createUser as createAuthUser } from "@/lib/auth/auth";
import {
	getUsersCollection,
	getEmployeeFinancesCollection,
	getPayrollRecordsCollection,
	getLeaveTypesCollection,
	getLeaveBalancesCollection,
	getLeaveRequestsCollection,
} from "@/lib/mongodb/collections";

export async function createUser(userData: {
	email: string;
	full_name: string;
	role: "admin" | "hr" | "employee";
	department?: string;
	position?: string;
	phone?: string;
	address?: string;
	birth_date?: string;
}) {
	try {
		console.log("Creating user with MongoDB:", userData.email);

		// Create user with authentication
		const result = await createAuthUser({
			email: userData.email,
			password: "temp123", // Temporary password - user should change on first login
			full_name: userData.full_name,
			role: userData.role,
			department: userData.department,
			position: userData.position,
			phone: userData.phone,
			address: userData.address,
			birth_date: userData.birth_date,
		});

		if (!result.success) {
			throw new Error(result.error);
		}

		console.log("User created successfully:", result.user?._id);

		// Revalidate the admin page to show updated data
		revalidatePath("/admin");

		return { success: true, user: result.user };
	} catch (error) {
		console.error("Error in createUser:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function updateEmployee(
	employeeId: string,
	userData: {
		full_name: string;
		email: string;
		role: "admin" | "hr" | "employee";
		department?: string;
		position?: string;
		phone?: string;
		address?: string;
		hire_date?: string;
	}
) {
	try {
		const usersCollection = await getUsersCollection();

		const updateData = {
			...userData,
			hire_date: userData.hire_date
				? new Date(userData.hire_date)
				: undefined,
			updated_at: new Date(),
		};

		const result = await usersCollection.updateOne(
			{ _id: new ObjectId(employeeId) },
			{ $set: updateData }
		);

		if (result.matchedCount === 0) {
			throw new Error("Employee not found");
		}

		revalidatePath("/admin");
		return { success: true };
	} catch (error) {
		console.error("Error updating employee:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function deleteEmployee(employeeId: string) {
	try {
		const usersCollection = await getUsersCollection();

		// Delete user (this will cascade to related collections via application logic)
		const result = await usersCollection.deleteOne({
			_id: new ObjectId(employeeId),
		});

		if (result.deletedCount === 0) {
			throw new Error("Employee not found");
		}

		// Clean up related data
		const employeeFinancesCollection =
			await getEmployeeFinancesCollection();
		const payrollRecordsCollection = await getPayrollRecordsCollection();
		const leaveBalancesCollection = await getLeaveBalancesCollection();
		const leaveRequestsCollection = await getLeaveRequestsCollection();

		await Promise.all([
			employeeFinancesCollection.deleteMany({
				employee_id: new ObjectId(employeeId),
			}),
			payrollRecordsCollection.deleteMany({
				employee_id: new ObjectId(employeeId),
			}),
			leaveBalancesCollection.deleteMany({
				employee_id: new ObjectId(employeeId),
			}),
			leaveRequestsCollection.deleteMany({
				employee_id: new ObjectId(employeeId),
			}),
		]);

		revalidatePath("/admin");
		return { success: true };
	} catch (error) {
		console.error("Error deleting employee:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function updateEmployeeFinances(
	employeeId: string,
	financeData: {
		base_salary?: number;
		hourly_rate?: number;
		pay_frequency?: string;
		bank_account?: string;
		tax_id?: string;
		currency?: string;
	}
) {
	try {
		// Validate ObjectId
		if (!employeeId || !ObjectId.isValid(employeeId)) {
			throw new Error("Invalid employee ID");
		}

		const employeeFinancesCollection =
			await getEmployeeFinancesCollection();

		const updateData = {
			employee_id: new ObjectId(employeeId),
			...financeData,
			currency: financeData.currency || "USD",
			pay_frequency: financeData.pay_frequency || "monthly",
			updated_at: new Date(),
		};

		const result = await employeeFinancesCollection.updateOne(
			{ employee_id: new ObjectId(employeeId) },
			{
				$set: updateData,
				$setOnInsert: { created_at: new Date() },
			},
			{ upsert: true }
		);

		revalidatePath("/admin");
		revalidatePath("/hr");
		revalidatePath("/employee");
		return { success: true, data: result };
	} catch (error) {
		console.error("Error updating employee finances:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function createPayrollRecord(payrollData: {
	employee_id: string;
	pay_period_start: string;
	pay_period_end: string;
	gross_pay: number;
	deductions: number;
	net_pay: number;
	overtime_hours?: number;
	overtime_pay?: number;
	bonus?: number;
	status: "pending" | "paid" | "cancelled";
}) {
	try {
		const payrollRecordsCollection = await getPayrollRecordsCollection();

		const newRecord = {
			employee_id: new ObjectId(payrollData.employee_id),
			pay_period_start: new Date(payrollData.pay_period_start),
			pay_period_end: new Date(payrollData.pay_period_end),
			gross_pay: payrollData.gross_pay,
			deductions: payrollData.deductions,
			net_pay: payrollData.net_pay,
			overtime_hours: payrollData.overtime_hours || 0,
			overtime_pay: payrollData.overtime_pay || 0,
			bonus: payrollData.bonus || 0,
			status: payrollData.status,
			created_at: new Date(),
			updated_at: new Date(),
		};

		const result = await payrollRecordsCollection.insertOne(newRecord);

		revalidatePath("/admin");
		revalidatePath("/hr");
		revalidatePath("/employee");
		return {
			success: true,
			data: { ...newRecord, _id: result.insertedId },
		};
	} catch (error) {
		console.error("Error creating payroll record:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function updatePayrollRecord(
	recordId: string,
	payrollData: {
		pay_period_start?: string;
		pay_period_end?: string;
		gross_pay?: number;
		deductions?: number;
		net_pay?: number;
		overtime_hours?: number;
		overtime_pay?: number;
		bonus?: number;
		status?: "pending" | "paid" | "cancelled";
	}
) {
	try {
		const payrollRecordsCollection = await getPayrollRecordsCollection();

		const updateData: any = {
			...payrollData,
			updated_at: new Date(),
		};

		if (payrollData.pay_period_start) {
			updateData.pay_period_start = new Date(
				payrollData.pay_period_start
			);
		}
		if (payrollData.pay_period_end) {
			updateData.pay_period_end = new Date(payrollData.pay_period_end);
		}

		const result = await payrollRecordsCollection.updateOne(
			{ _id: new ObjectId(recordId) },
			{ $set: updateData }
		);

		if (result.matchedCount === 0) {
			throw new Error("Payroll record not found");
		}

		revalidatePath("/admin");
		revalidatePath("/hr");
		revalidatePath("/employee");
		return { success: true, data: result };
	} catch (error) {
		console.error("Error updating payroll record:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function deletePayrollRecord(recordId: string) {
	try {
		const payrollRecordsCollection = await getPayrollRecordsCollection();

		const result = await payrollRecordsCollection.deleteOne({
			_id: new ObjectId(recordId),
		});

		if (result.deletedCount === 0) {
			throw new Error("Payroll record not found");
		}

		revalidatePath("/admin");
		revalidatePath("/hr");
		return { success: true };
	} catch (error) {
		console.error("Error deleting payroll record:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function createLeaveType(leaveTypeData: {
	name: string;
	description?: string;
	max_days_per_year: number;
	carry_forward: boolean;
}) {
	try {
		const leaveTypesCollection = await getLeaveTypesCollection();

		const newLeaveType = {
			...leaveTypeData,
			created_at: new Date(),
			updated_at: new Date(),
		};

		const result = await leaveTypesCollection.insertOne(newLeaveType);

		revalidatePath("/admin");
		revalidatePath("/hr");
		return {
			success: true,
			data: { ...newLeaveType, _id: result.insertedId },
		};
	} catch (error) {
		console.error("Error creating leave type:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function updateLeaveBalance(
	employeeId: string,
	leaveType:
		| "annual"
		| "sick"
		| "personal"
		| "maternity"
		| "paternity"
		| "emergency",
	balanceData: {
		total_days: number;
		used_days?: number;
		remaining_days?: number;
		year: number;
	}
) {
	try {
		const leaveBalancesCollection = await getLeaveBalancesCollection();

		const remaining = balanceData.total_days - (balanceData.used_days || 0);

		const updateData = {
			employee_id: new ObjectId(employeeId),
			leave_type: leaveType,
			year: balanceData.year,
			total_days: balanceData.total_days,
			used_days: balanceData.used_days || 0,
			remaining_days: remaining,
			updated_at: new Date(),
		};

		const result = await leaveBalancesCollection.updateOne(
			{
				employee_id: new ObjectId(employeeId),
				leave_type: leaveType,
				year: balanceData.year,
			},
			{
				$set: updateData,
				$setOnInsert: { created_at: new Date() },
			},
			{ upsert: true }
		);

		revalidatePath("/admin");
		revalidatePath("/hr");
		revalidatePath("/employee");
		return { success: true, data: result };
	} catch (error) {
		console.error("Error updating leave balance:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function updateLeaveRequest(
	requestId: string,
	updateData: {
		status?: "pending" | "approved" | "rejected";
		approved_by?: string;
		admin_notes?: string;
	}
) {
	try {
		const leaveRequestsCollection = await getLeaveRequestsCollection();

		const updatePayload: any = {
			...updateData,
			updated_at: new Date(),
		};

		if (updateData.approved_by) {
			updatePayload.approved_by = new ObjectId(updateData.approved_by);
		}

		if (updateData.status === "approved") {
			updatePayload.approved_at = new Date();
		}

		const result = await leaveRequestsCollection.findOneAndUpdate(
			{ _id: new ObjectId(requestId) },
			{ $set: updatePayload },
			{ returnDocument: "after" }
		);

		if (!result) {
			throw new Error("Leave request not found");
		}

		// If approved, update leave balance
		if (updateData.status === "approved") {
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

		revalidatePath("/admin");
		revalidatePath("/hr");
		revalidatePath("/employee");
		return { success: true, data: result };
	} catch (error) {
		console.error("Error updating leave request:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function deleteLeaveRequest(requestId: string) {
	try {
		const leaveRequestsCollection = await getLeaveRequestsCollection();

		const result = await leaveRequestsCollection.deleteOne({
			_id: new ObjectId(requestId),
		});

		if (result.deletedCount === 0) {
			throw new Error("Leave request not found");
		}

		revalidatePath("/admin");
		revalidatePath("/hr");
		return { success: true };
	} catch (error) {
		console.error(" Error deleting leave request:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function createLeaveRequest(requestData: {
	employee_id: string;
	leave_type: string;
	start_date: string;
	end_date: string;
	reason: string;
	days_requested: number;
}) {
	try {
		const leaveRequestsCollection = await getLeaveRequestsCollection();

		const newRequest = {
			employee_id: new ObjectId(requestData.employee_id),
			leave_type: requestData.leave_type as any,
			start_date: new Date(requestData.start_date),
			end_date: new Date(requestData.end_date),
			days_requested: requestData.days_requested,
			reason: requestData.reason,
			status: "pending" as const,
			created_at: new Date(),
			updated_at: new Date(),
		};

		const result = await leaveRequestsCollection.insertOne(newRequest);

		revalidatePath("/admin");
		revalidatePath("/hr");
		revalidatePath("/employee");
		return {
			success: true,
			data: { ...newRequest, _id: result.insertedId },
		};
	} catch (error) {
		console.error("Error creating leave request:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
