"use client";
import { HRDashboard } from "@/components/hr/hr-dashboard";
import { ProtectedRoute } from "@/components/shared/protected-route";

export default function HRPage() {
	return (
		<ProtectedRoute requiredRole="hr">
			<HRDashboard />
		</ProtectedRoute>
	);
}
