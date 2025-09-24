"use client";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { ProtectedRoute } from "@/components/shared/protected-route";

export default function AdminPage() {
	return (
		<ProtectedRoute requiredRole="admin">
			<AdminDashboard />
		</ProtectedRoute>
	);
}
