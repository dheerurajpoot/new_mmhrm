"use client";
import { EmployeeDashboard } from "@/components/employee/employee-dashboard";
import { ProtectedRoute } from "@/components/shared/protected-route";

export default function EmployeePage() {
	return (
		<ProtectedRoute requiredRole='employee'>
			<EmployeeDashboard />
		</ProtectedRoute>
	);
}
