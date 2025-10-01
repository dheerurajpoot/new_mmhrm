import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, User, Users, Calendar, DollarSign, Briefcase, FileText, Settings } from "lucide-react";

export interface DeleteItem {
	id: string;
	type: 'user' | 'team' | 'leave' | 'finance' | 'payroll' | 'department' | 'role' | 'project' | 'task';
	data: any;
}

interface DeleteConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	item: DeleteItem | null;
	loading?: boolean;
}

const getSectionConfig = (type: string) => {
	const configs = {
		user: {
			title: "Delete User",
			icon: User,
			description: "Are you sure you want to delete this user? This action cannot be undone.",
			primaryColor: "red",
			iconColor: "text-red-600",
			titleColor: "text-red-600",
			sectionName: "User Management"
		},
		team: {
			title: "Delete Team",
			icon: Users,
			description: "Are you sure you want to delete this team? This action cannot be undone.",
			primaryColor: "blue",
			iconColor: "text-blue-600",
			titleColor: "text-blue-600",
			sectionName: "Team Management"
		},
		leave: {
			title: "Delete Leave Request",
			icon: Calendar,
			description: "Are you sure you want to delete this leave request? This action cannot be undone.",
			primaryColor: "green",
			iconColor: "text-green-600",
			titleColor: "text-green-600",
			sectionName: "Leave Management"
		},
		finance: {
			title: "Delete Finance Record",
			icon: DollarSign,
			description: "Are you sure you want to delete this finance record? This action cannot be undone.",
			primaryColor: "emerald",
			iconColor: "text-emerald-600",
			titleColor: "text-emerald-600",
			sectionName: "Financial Management"
		},
		payroll: {
			title: "Delete Payroll Record",
			icon: DollarSign,
			description: "Are you sure you want to delete this payroll record? This action cannot be undone.",
			primaryColor: "purple",
			iconColor: "text-purple-600",
			titleColor: "text-purple-600",
			sectionName: "Payroll Management"
		},
		department: {
			title: "Delete Department",
			icon: Briefcase,
			description: "Are you sure you want to delete this department? This action cannot be undone.",
			primaryColor: "orange",
			iconColor: "text-orange-600",
			titleColor: "text-orange-600",
			sectionName: "Department Management"
		},
		role: {
			title: "Delete Role",
			icon: Settings,
			description: "Are you sure you want to delete this role? This action cannot be undone.",
			primaryColor: "indigo",
			iconColor: "text-indigo-600",
			titleColor: "text-indigo-600",
			sectionName: "Role Management"
		},
		project: {
			title: "Delete Project",
			icon: FileText,
			description: "Are you sure you want to delete this project? This action cannot be undone.",
			primaryColor: "teal",
			iconColor: "text-teal-600",
			titleColor: "text-teal-600",
			sectionName: "Project Management"
		},
		task: {
			title: "Delete Task",
			icon: FileText,
			description: "Are you sure you want to delete this task? This action cannot be undone.",
			primaryColor: "cyan",
			iconColor: "text-cyan-600",
			titleColor: "text-cyan-600",
			sectionName: "Task Management"
		}
	};
	
	return configs[type as keyof typeof configs] || configs.user;
};

const getColorClasses = (primaryColor: string) => {
	const colorMap = {
		red: {
			bg: "bg-red-50",
			border: "border-red-200",
			text: "text-red-700",
			title: "text-red-800",
			button: "bg-red-600 hover:bg-red-700"
		},
		blue: {
			bg: "bg-blue-50",
			border: "border-blue-200",
			text: "text-blue-700",
			title: "text-blue-800",
			button: "bg-blue-600 hover:bg-blue-700"
		},
		green: {
			bg: "bg-green-50",
			border: "border-green-200",
			text: "text-green-700",
			title: "text-green-800",
			button: "bg-green-600 hover:bg-green-700"
		},
		emerald: {
			bg: "bg-emerald-50",
			border: "border-emerald-200",
			text: "text-emerald-700",
			title: "text-emerald-800",
			button: "bg-emerald-600 hover:bg-emerald-700"
		},
		purple: {
			bg: "bg-purple-50",
			border: "border-purple-200",
			text: "text-purple-700",
			title: "text-purple-800",
			button: "bg-purple-600 hover:bg-purple-700"
		},
		orange: {
			bg: "bg-orange-50",
			border: "border-orange-200",
			text: "text-orange-700",
			title: "text-orange-800",
			button: "bg-orange-600 hover:bg-orange-700"
		},
		indigo: {
			bg: "bg-indigo-50",
			border: "border-indigo-200",
			text: "text-indigo-700",
			title: "text-indigo-800",
			button: "bg-indigo-600 hover:bg-indigo-700"
		},
		teal: {
			bg: "bg-teal-50",
			border: "border-teal-200",
			text: "text-teal-700",
			title: "text-teal-800",
			button: "bg-teal-600 hover:bg-teal-700"
		},
		cyan: {
			bg: "bg-cyan-50",
			border: "border-cyan-200",
			text: "text-cyan-700",
			title: "text-cyan-800",
			button: "bg-cyan-600 hover:bg-cyan-700"
		}
	};
	
	return colorMap[primaryColor as keyof typeof colorMap] || colorMap.red;
};

const renderItemDetails = (item: DeleteItem) => {
	if (!item?.data) return null;

	const { type, data } = item;

	switch (type) {
		case 'user':
			return (
				<div className="space-y-4">
					<div className="bg-slate-50 p-4 rounded-lg">
						<h4 className="font-semibold text-slate-900 mb-2">User Information</h4>
						<div className="space-y-1 text-sm">
							<p><strong>Name:</strong> {data.full_name || "Unknown"}</p>
							<p><strong>Email:</strong> {data.email || "N/A"}</p>
							<p><strong>Role:</strong> {data.role || "N/A"}</p>
							<p><strong>Department:</strong> {data.department || "N/A"}</p>
							<p><strong>Position:</strong> {data.position || "N/A"}</p>
							<p><strong>Status:</strong> {data.status || "N/A"}</p>
						</div>
					</div>
				</div>
			);

		case 'team':
			return (
				<div className="space-y-4">
					<div className="bg-slate-50 p-4 rounded-lg">
						<h4 className="font-semibold text-slate-900 mb-2">Team Information</h4>
						<div className="space-y-1 text-sm">
							<p><strong>Team Name:</strong> {data.name || "Unknown"}</p>
							<p><strong>Description:</strong> {data.description || "N/A"}</p>
							<p><strong>Team Lead:</strong> {data.team_lead || "N/A"}</p>
							<p><strong>Department:</strong> {data.department || "N/A"}</p>
							<p><strong>Members Count:</strong> {data.members?.length || 0}</p>
						</div>
					</div>
				</div>
			);

		case 'leave':
			return (
				<div className="space-y-4">
					<div className="bg-slate-50 p-4 rounded-lg">
						<h4 className="font-semibold text-slate-900 mb-2">Leave Request Information</h4>
						<div className="space-y-1 text-sm">
							<p><strong>Employee:</strong> {data.employee?.full_name || "Unknown"}</p>
							<p><strong>Leave Type:</strong> {data.leave_type || "N/A"}</p>
							<p><strong>Start Date:</strong> {data.start_date ? new Date(data.start_date).toLocaleDateString() : "N/A"}</p>
							<p><strong>End Date:</strong> {data.end_date ? new Date(data.end_date).toLocaleDateString() : "N/A"}</p>
							<p><strong>Duration:</strong> {data.duration || "N/A"} days</p>
							<p><strong>Status:</strong> {data.status || "N/A"}</p>
							<p><strong>Reason:</strong> {data.reason || "N/A"}</p>
						</div>
					</div>
				</div>
			);

		case 'finance':
			return (
				<div className="space-y-4">
					<div className="bg-slate-50 p-4 rounded-lg">
						<h4 className="font-semibold text-slate-900 mb-2">Employee Information</h4>
						<div className="space-y-1 text-sm">
							<p><strong>Name:</strong> {data.employee?.full_name || "Unknown"}</p>
							<p><strong>Email:</strong> {data.employee?.email || "N/A"}</p>
							<p><strong>Position:</strong> {data.employee?.position || "N/A"}</p>
							<p><strong>Department:</strong> {data.employee?.department || "N/A"}</p>
						</div>
					</div>
					<div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
						<h4 className="font-semibold text-emerald-800 mb-2">Financial Information to be Deleted</h4>
						<div className="space-y-1 text-sm text-emerald-700">
							<p><strong>Currency:</strong> {data.currency}</p>
							<p><strong>Base Salary:</strong> {data.base_salary ? `${data.currency} ${data.base_salary.toLocaleString()}` : "Not set"}</p>
							<p><strong>Hourly Rate:</strong> {data.hourly_rate ? `${data.currency} ${data.hourly_rate}` : "Not set"}</p>
							<p><strong>Pay Frequency:</strong> {data.pay_frequency}</p>
							<p><strong>Tax ID:</strong> {data.tax_id || "Not set"}</p>
							<p><strong>Bank Account:</strong> {data.bank_account || "Not set"}</p>
						</div>
					</div>
				</div>
			);

		case 'payroll':
			return (
				<div className="space-y-4">
					<div className="bg-slate-50 p-4 rounded-lg">
						<h4 className="font-semibold text-slate-900 mb-2">Employee Information</h4>
						<div className="space-y-1 text-sm">
							<p><strong>Name:</strong> {data.employee?.full_name || "Unknown"}</p>
							<p><strong>Email:</strong> {data.employee?.email || "N/A"}</p>
							<p><strong>Position:</strong> {data.employee?.position || "N/A"}</p>
							<p><strong>Department:</strong> {data.employee?.department || "N/A"}</p>
						</div>
					</div>
					<div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
						<h4 className="font-semibold text-purple-800 mb-2">Payroll Information to be Deleted</h4>
						<div className="space-y-1 text-sm text-purple-700">
							<p><strong>Pay Period:</strong> {data.pay_period_start ? new Date(data.pay_period_start).toLocaleDateString() : "N/A"} - {data.pay_period_end ? new Date(data.pay_period_end).toLocaleDateString() : "N/A"}</p>
							<p><strong>Gross Pay:</strong> {data.gross_pay ? `$${data.gross_pay.toLocaleString()}` : "Not set"}</p>
							<p><strong>Deductions:</strong> {data.deductions ? `$${data.deductions.toLocaleString()}` : "Not set"}</p>
							<p><strong>Net Pay:</strong> {data.net_pay ? `$${data.net_pay.toLocaleString()}` : "Not set"}</p>
							<p><strong>Overtime Hours:</strong> {data.overtime_hours || "Not set"}</p>
							<p><strong>Bonus:</strong> {data.bonus ? `$${data.bonus.toLocaleString()}` : "Not set"}</p>
							<p><strong>Status:</strong> {data.status || "Not set"}</p>
						</div>
					</div>
				</div>
			);

		default:
			return (
				<div className="bg-slate-50 p-4 rounded-lg">
					<h4 className="font-semibold text-slate-900 mb-2">Item Information</h4>
					<div className="space-y-1 text-sm">
						<p><strong>ID:</strong> {data.id || "N/A"}</p>
						<p><strong>Name:</strong> {data.name || data.title || "N/A"}</p>
						<p><strong>Type:</strong> {type}</p>
					</div>
				</div>
			);
	}
};

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	item,
	loading = false
}) => {
	if (!item) return null;

	const config = getSectionConfig(item.type);
	const colors = getColorClasses(config.primaryColor);
	const IconComponent = config.icon;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className={`flex items-center gap-2 ${config.titleColor}`}>
						<IconComponent className={`w-5 h-5 ${config.iconColor}`} />
						{config.title}
					</DialogTitle>
					<DialogDescription>
						{config.description}
					</DialogDescription>
				</DialogHeader>
				
				<div className="space-y-4">
					{/* Section Badge */}
					<div className="flex items-center gap-2">
						<div className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
							{config.sectionName}
						</div>
					</div>

					{/* Item Details */}
					{renderItemDetails(item)}

					{/* Warning */}
					<div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
						<div className="flex items-start gap-2">
							<div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
							<div className="text-sm text-amber-800">
								<p className="font-semibold">Warning:</p>
								<p>Deleting this {item.type} will permanently remove all associated data. This action cannot be undone.</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 mt-6">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={loading}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={loading}
						className={colors.button}
					>
						<Trash2 className="w-4 h-4 mr-2" />
						{loading ? "Deleting..." : `Delete ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
