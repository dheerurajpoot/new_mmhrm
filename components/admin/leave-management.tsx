"use client";

import type React from "react";
import { toast } from "sonner";
import { DeleteConfirmationModal, type DeleteItem } from "@/components/ui/delete-confirmation-modal";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { SimpleSelect } from "@/components/ui/simple-select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	Calendar,
	Check,
	X,
	Edit,
	Plus,
	Trash2,
	Loader2,
	Search,
	Users,
	Clock,
	TrendingUp,
	MoreHorizontal,
	Filter,
	Download,
	Plane,
	Stethoscope,
	Heart,
	Zap,
	HeartHandshake,
	Briefcase,
	Mail,
	Phone,
	MapPin,
	UserCheck,
} from "lucide-react";
import {
	updateLeaveBalance,
	createLeaveRequest,
	createLeaveType,
} from "@/app/actions/admin";

interface Employee {
	id: string;
	full_name: string;
	email: string;
	department: string;
	position: string;
	profile_photo?: string;
}

interface LeaveBalance {
	id: string;
	employee_id: string;
	leave_type: string;
	year: number;
	total_days: number;
	used_days: number;
	remaining_days: number;
	employee: Employee;
}

interface LeaveRequest {
	id: string;
	employee_id: string;
	leave_type: string;
	start_date: string;
	end_date: string;
	days_requested: number;
	status: "pending" | "approved" | "rejected";
	reason: string;
	approved_by?: string;
	approved_at?: string;
	admin_notes?: string;
	employee: Employee;
}

interface LeaveType {
	id: string;
	name: string;
	description: string;
	max_days_per_year: number;
	carry_forward: boolean;
}

export function LeaveManagement() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
	const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
	const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [isLeaveUpdating, setIsLeaveUpdating] = useState<
		Record<string, boolean>
	>({});
	const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
	const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
	const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editingBalance, setEditingBalance] = useState<LeaveBalance | null>(
		null
	);
	const [editingType, setEditingType] = useState<LeaveType | null>(null);
	const [deletingItem, setDeletingItem] = useState<{
		type: "request" | "balance" | "type";
		id: string;
		data: any;
	} | null>(null);

	// New delete modal state
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [leaveToDelete, setLeaveToDelete] = useState<DeleteItem | null>(null);

	const [balanceFormData, setBalanceFormData] = useState({
		employee_id: "",
		leave_type: "",
		year: new Date().getFullYear(),
		total_days: "",
		used_days: "",
	});

	const [requestFormData, setRequestFormData] = useState({
		employee_id: "",
		leave_type: "",
		start_date: "",
		end_date: "",
		reason: "",
		days_requested: "",
	});

	const [typeFormData, setTypeFormData] = useState({
		name: "",
		description: "",
		max_days_per_year: "",
		carry_forward: false,
	});

	const [requestUpdateData, setRequestUpdateData] = useState({
		status: "" as "pending" | "approved" | "rejected" | "",
		admin_notes: "",
	});

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [employeesRes, balancesRes, requestsRes, typesRes] =
				await Promise.all([
					fetch("/api/employees"),
					fetch("/api/leave-balances"),
					fetch("/api/leave-requests"),
					fetch("/api/leave-types"),
				]);

			if (employeesRes.ok) {
				const employeesData = await employeesRes.json();
				const mappedEmployees: Employee[] = (employeesData || []).map(
					(u: any) => ({
						id: u._id?.toString?.() || u._id || u.id,
						full_name: u.full_name || u.name || "",
						email: u.email,
						department: u.department || "",
						position: u.position || "",
						profile_photo: u.profile_photo || "",
					})
				);
				setEmployees(mappedEmployees);
			}

			if (balancesRes.ok) {
				const balancesData = await balancesRes.json();
				// Data is already populated with employee information from the API
				const mappedBalances: LeaveBalance[] = (balancesData || []).map(
					(b: any) => ({
						id: b._id?.toString?.() || b._id || b.id,
						employee_id:
							b.employee_id?.toString?.() || b.employee_id,
						leave_type: b.leave_type,
						year: b.year,
						total_days: b.total_days,
						used_days: b.used_days,
						remaining_days: b.remaining_days,
						employee: b.employee || null,
					})
				);
				setLeaveBalances(mappedBalances);
			}

			if (requestsRes.ok) {
				const requestsData = await requestsRes.json();
				// Data is already populated with employee information from the API
				const mappedRequests: LeaveRequest[] = (requestsData || []).map(
					(r: any) => ({
						id: r._id?.toString?.() || r._id || r.id,
						employee_id:
							r.employee_id?.toString?.() || r.employee_id,
						leave_type: r.leave_type,
						start_date: r.start_date,
						end_date: r.end_date,
						days_requested: r.days_requested,
						status: r.status,
						reason: r.reason,
						approved_by:
							r.approved_by?.toString?.() || r.approved_by,
						approved_at: r.approved_at,
						admin_notes: r.admin_notes,
						employee: r.employee || null,
					})
				);
				setLeaveRequests(mappedRequests);
			}

			if (typesRes.ok) {
				const typesData = await typesRes.json();
				setLeaveTypes(typesData);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Failed to fetch leave data");
		} finally {
			setLoading(false);
		}
	};

	const handleBalanceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const result = await updateLeaveBalance(
				balanceFormData.employee_id,
				balanceFormData.leave_type as any,
				{
					total_days: Number.parseInt(balanceFormData.total_days),
					used_days: Number.parseInt(balanceFormData.used_days) || 0,
					year: balanceFormData.year,
				}
			);

			if (result.success) {
				toast.success("Leave balance updated successfully");
				setIsBalanceDialogOpen(false);
				resetBalanceForm();
				fetchData();
			} else {
				toast.error(result.error || "Failed to update leave balance");
			}
		} catch (error) {
			toast.error("Failed to update leave balance");
		} finally {
			setLoading(false);
		}
	};

	const handleRequestSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const result = await createLeaveRequest({
				employee_id: requestFormData.employee_id,
				leave_type: requestFormData.leave_type,
				start_date: requestFormData.start_date,
				end_date: requestFormData.end_date,
				reason: requestFormData.reason,
				days_requested: Number.parseInt(requestFormData.days_requested),
			});

			if (result.success) {
				toast.success("Leave request created successfully");
				setIsRequestDialogOpen(false);
				resetRequestForm();
				fetchData();
			} else {
				toast.error(result.error || "Failed to create leave request");
			}
		} catch (error) {
			toast.error("Failed to create leave request");
		} finally {
			setLoading(false);
		}
	};

	const handleTypeSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (editingType) {
				// Update existing type
				const response = await fetch(
					`/api/leave-types/${editingType.id}`,
					{
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name: typeFormData.name,
							description: typeFormData.description,
							max_days_per_year: Number.parseInt(
								typeFormData.max_days_per_year
							),
							carry_forward: typeFormData.carry_forward,
						}),
					}
				);

				if (response.ok) {
					toast.success("Leave type updated successfully");
					setIsTypeDialogOpen(false);
					resetTypeForm();
					fetchData();
				} else {
					toast.error("Failed to update leave type");
				}
			} else {
				// Create new type
				const result = await createLeaveType({
					name: typeFormData.name,
					description: typeFormData.description,
					max_days_per_year: Number.parseInt(
						typeFormData.max_days_per_year
					),
					carry_forward: typeFormData.carry_forward,
				});

				if (result.success) {
					toast.success("Leave type created successfully");
					setIsTypeDialogOpen(false);
					resetTypeForm();
					fetchData();
				} else {
					toast.error(result.error || "Failed to create leave type");
				}
			}
		} catch (error) {
			toast.error("Failed to save leave type");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteType = async (typeId: string) => {
		try {
			console.log("Deleting leave type with ID:", typeId);
			const response = await fetch(`/api/leave-types/${typeId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Leave type deleted successfully");
				fetchData();
			} else {
				const errorData = await response.json();
				console.error("Delete failed:", errorData);
				toast.error(errorData.error || "Failed to delete leave type");
			}
		} catch (error) {
			console.error("Delete error:", error);
			toast.error("Failed to delete leave type");
		}
	};

	const handleDeleteBalance = async (balanceId: string) => {
		try {
			const response = await fetch(`/api/leave-balances/${balanceId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Leave balance deleted successfully");
				fetchData();
			} else {
				toast.error("Failed to delete leave balance");
			}
		} catch (error) {
			toast.error("Failed to delete leave balance");
		}
	};

	const handleDeleteRequest = async (requestId: string) => {
		try {
			const response = await fetch(`/api/leave-requests/${requestId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Leave request deleted successfully");
				fetchData();
			} else {
				toast.error("Failed to delete leave request");
			}
		} catch (error) {
			toast.error("Failed to delete leave request");
		}
	};

	// New delete modal functions
	const openDeleteModal = (request: LeaveRequest) => {
		setLeaveToDelete({
			id: request.id,
			type: 'leave',
			data: request
		});
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!leaveToDelete) return;

		try {
			const response = await fetch(`/api/leave-requests/${leaveToDelete.id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setLeaveRequests(prev => prev.filter(r => r.id !== leaveToDelete.id));
				toast.success("Leave request deleted successfully");
				setIsDeleteModalOpen(false);
				setLeaveToDelete(null);
			} else {
				toast.error("Failed to delete leave request");
			}
		} catch (error) {
			toast.error("Failed to delete leave request");
		}
	};

	const handleDeleteConfirmOld = async () => {
		if (!deletingItem) return;

		try {
			let endpoint = "";
			let successMessage = "";

			switch (deletingItem.type) {
				case "request":
					endpoint = `/api/leave-requests/${deletingItem.id}`;
					successMessage = "Leave request deleted successfully";
					break;
				case "balance":
					endpoint = `/api/leave-balances/${deletingItem.id}`;
					successMessage = "Leave balance deleted successfully";
					break;
				case "type":
					endpoint = `/api/leave-types/${deletingItem.id}`;
					successMessage = "Leave type deleted successfully";
					break;
			}

			const response = await fetch(endpoint, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success(successMessage);
				fetchData();
				setIsDeleteDialogOpen(false);
				setDeletingItem(null);
			} else {
				toast.error("Failed to delete item");
			}
		} catch (error) {
			toast.error("Failed to delete item");
		}
	};

	const openTypeDialog = (type?: LeaveType) => {
		if (type) {
			setEditingType(type);
			setTypeFormData({
				name: type.name,
				description: type.description,
				max_days_per_year: type.max_days_per_year.toString(),
				carry_forward: type.carry_forward,
			});
		} else {
			setEditingType(null);
			resetTypeForm();
		}
		setIsTypeDialogOpen(true);
	};

	const openDeleteDialog = (
		type: "request" | "balance" | "type",
		id: string,
		data: any
	) => {
		setDeletingItem({ type, id, data });
		setIsDeleteDialogOpen(true);
	};

	const handleRequestUpdate = async (
		requestId: string,
		status: "approved" | "rejected"
	) => {
		setIsLeaveUpdating((prev) => ({ ...prev, [requestId]: true }));
		try {
			const response = await fetch(`/api/leave-requests/${requestId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					status,
					admin_notes: requestUpdateData.admin_notes,
				}),
			});

			if (response.ok) {
				toast.success(`Leave request ${status} successfully`);
				fetchData();
			} else {
				const errorData = await response.json();
				toast.error(
					errorData.error || "Failed to update leave request"
				);
			}
		} catch (error) {
			toast.error("Failed to update leave request");
		} finally {
			setIsLeaveUpdating((prev) => ({ ...prev, [requestId]: false }));
		}
	};

	const resetBalanceForm = () => {
		setBalanceFormData({
			employee_id: "",
			leave_type: "",
			year: new Date().getFullYear(),
			total_days: "",
			used_days: "",
		});
		setEditingBalance(null);
	};

	const resetRequestForm = () => {
		setRequestFormData({
			employee_id: "",
			leave_type: "",
			start_date: "",
			end_date: "",
			reason: "",
			days_requested: "",
		});
	};

	const resetTypeForm = () => {
		setTypeFormData({
			name: "",
			description: "",
			max_days_per_year: "",
			carry_forward: false,
		});
	};

	const openBalanceDialog = (balance?: LeaveBalance) => {
		if (balance) {
			setEditingBalance(balance);
			setBalanceFormData({
				employee_id: balance.employee_id,
				leave_type: balance.leave_type,
				year: balance.year,
				total_days: balance.total_days.toString(),
				used_days: balance.used_days.toString(),
			});
		} else {
			resetBalanceForm();
		}
		setIsBalanceDialogOpen(true);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "approved":
				return "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300";
			case "rejected":
				return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300";
			case "pending":
				return "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300";
			default:
				return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300";
		}
	};

	const getLeaveStats = () => {
		const totalEmployees = employees.length;
		const totalRequests = leaveRequests.length;
		const pendingRequests = leaveRequests.filter(
			(r) => r.status === "pending"
		).length;
		const approvedRequests = leaveRequests.filter(
			(r) => r.status === "approved"
		).length;
		const totalLeaveTypes = leaveTypes.length;
		const totalBalances = leaveBalances.length;

		return {
			totalEmployees,
			totalRequests,
			pendingRequests,
			approvedRequests,
			totalLeaveTypes,
			totalBalances,
		};
	};

	const getLeaveTypeStyle = (leaveType: string) => {
		switch (leaveType.toLowerCase()) {
			case "annual":
			case "vacation":
				return {
					bg: "bg-gradient-to-br from-blue-50 via-white to-blue-50/30",
					border: "border-blue-100",
					hoverBorder: "hover:border-blue-200",
					iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
					dotBg: "bg-blue-500",
					icon: <Plane className='w-5 h-5 text-white' />,
					textColor: "text-blue-900",
					accentColor: "text-blue-600",
				};
			case "sick":
				return {
					bg: "bg-gradient-to-br from-red-50 via-white to-red-50/30",
					border: "border-red-100",
					hoverBorder: "hover:border-red-200",
					iconBg: "bg-gradient-to-br from-red-500 to-red-600",
					dotBg: "bg-red-500",
					icon: <Stethoscope className='w-5 h-5 text-white' />,
					textColor: "text-red-900",
					accentColor: "text-red-600",
				};
			case "personal":
				return {
					bg: "bg-gradient-to-br from-purple-50 via-white to-purple-50/30",
					border: "border-purple-100",
					hoverBorder: "hover:border-purple-200",
					iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
					dotBg: "bg-purple-500",
					icon: <Heart className='w-5 h-5 text-white' />,
					textColor: "text-purple-900",
					accentColor: "text-purple-600",
				};
			case "emergency":
				return {
					bg: "bg-gradient-to-br from-orange-50 via-white to-orange-50/30",
					border: "border-orange-100",
					hoverBorder: "hover:border-orange-200",
					iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
					dotBg: "bg-orange-500",
					icon: <Zap className='w-5 h-5 text-white' />,
					textColor: "text-orange-900",
					accentColor: "text-orange-600",
				};
			case "maternity":
				return {
					bg: "bg-gradient-to-br from-pink-50 via-white to-pink-50/30",
					border: "border-pink-100",
					hoverBorder: "hover:border-pink-200",
					iconBg: "bg-gradient-to-br from-pink-500 to-pink-600",
					dotBg: "bg-pink-500",
					icon: <HeartHandshake className='w-5 h-5 text-white' />,
					textColor: "text-pink-900",
					accentColor: "text-pink-600",
				};
			case "paternity":
				return {
					bg: "bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30",
					border: "border-indigo-100",
					hoverBorder: "hover:border-indigo-200",
					iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
					dotBg: "bg-indigo-500",
					icon: <HeartHandshake className='w-5 h-5 text-white' />,
					textColor: "text-indigo-900",
					accentColor: "text-indigo-600",
				};
			case "compensatory":
			case "comp":
				return {
					bg: "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30",
					border: "border-emerald-100",
					hoverBorder: "hover:border-emerald-200",
					iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
					dotBg: "bg-emerald-500",
					icon: <Clock className='w-5 h-5 text-white' />,
					textColor: "text-emerald-900",
					accentColor: "text-emerald-600",
				};
			case "study":
			case "education":
				return {
					bg: "bg-gradient-to-br from-amber-50 via-white to-amber-50/30",
					border: "border-amber-100",
					hoverBorder: "hover:border-amber-200",
					iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
					dotBg: "bg-amber-500",
					icon: <TrendingUp className='w-5 h-5 text-white' />,
					textColor: "text-amber-900",
					accentColor: "text-amber-600",
				};
			default:
				return {
					bg: "bg-gradient-to-br from-slate-50 via-white to-slate-50/30",
					border: "border-slate-100",
					hoverBorder: "hover:border-slate-200",
					iconBg: "bg-gradient-to-br from-slate-500 to-slate-600",
					dotBg: "bg-slate-500",
					icon: <Calendar className='w-5 h-5 text-white' />,
					textColor: "text-slate-900",
					accentColor: "text-slate-600",
				};
		}
	};

	const filteredLeaveRequests = leaveRequests.filter(
		(request) =>
			request.employee?.full_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			request.employee?.email
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			request.employee?.department
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			request.employee?.position
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			request.leave_type
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			request.reason.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const filteredLeaveBalances = leaveBalances.filter(
		(balance) =>
			balance.employee?.full_name
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			balance.employee?.email
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			balance.employee?.department
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			balance.employee?.position
				?.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			balance.leave_type.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const filteredLeaveTypes = leaveTypes.filter(
		(type) =>
			type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			type.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const calculateDays = () => {
		if (requestFormData.start_date && requestFormData.end_date) {
			const start = new Date(requestFormData.start_date);
			const end = new Date(requestFormData.end_date);
			const diffTime = Math.abs(end.getTime() - start.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
			setRequestFormData({
				...requestFormData,
				days_requested: diffDays.toString(),
			});
		}
	};

	if (loading && leaveBalances.length === 0) {
		return (
			<div className='space-y-6'>
				{/* Stats Cards Skeleton */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
					{[...Array(4)].map((_, i) => (
						<Card key={i} className='animate-pulse'>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div className='space-y-2'>
										<div className='h-4 bg-gray-200 rounded w-20'></div>
										<div className='h-8 bg-gray-200 rounded w-16'></div>
									</div>
									<div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Main Content Skeleton */}
				<Card className='animate-pulse'>
					<CardContent className='p-6'>
						<div className='space-y-4'>
							<div className='h-4 bg-gray-200 rounded w-1/4'></div>
							<div className='h-10 bg-gray-200 rounded'></div>
							<div className='space-y-3'>
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className='h-20 bg-gray-200 rounded'></div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const stats = getLeaveStats();

	return (
		<div className='space-y-8'>
			{/* Modern Leave Statistics with Glassmorphism */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<Card className='group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20'>
					<div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/20 to-slate-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
					<CardContent className='relative p-8'>
						<div className='flex items-center justify-between'>
							<div className='flex-1 space-y-3'>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
									<p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
										Total Employees
									</p>
								</div>
								<p className='text-4xl font-bold text-slate-900 tracking-tight'>
									{stats.totalEmployees}
								</p>
								<p className='text-sm text-slate-500 font-medium'>
									All employees
								</p>
							</div>
							<div className="relative">
								<div className='w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
									<Users className='w-8 h-8 text-white' />
								</div>
								<div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-slate-400/20 to-slate-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className='group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20'>
					<div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/20 to-slate-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
					<CardContent className='relative p-8'>
						<div className='flex items-center justify-between'>
							<div className='flex-1 space-y-3'>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
									<p className='text-sm font-bold text-slate-600 uppercase tracking-wider'>
										Leave Requests
									</p>
								</div>
								<p className='text-4xl font-bold text-slate-900 tracking-tight'>
									{stats.totalRequests}
								</p>
								<p className='text-sm text-slate-500 font-medium'>
									Total requests
								</p>
							</div>
							<div className="relative">
								<div className='w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
									<Calendar className='w-8 h-8 text-white' />
								</div>
								<div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-slate-400/20 to-slate-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className='group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 border-slate-200'>
					<CardContent className='p-6'>
						<div className='flex items-center justify-between'>
							<div className='flex-1'>
								<p className='text-sm font-medium text-slate-700 mb-2'>
									Pending
								</p>
								<p className='text-3xl font-bold text-slate-900'>
									{stats.pendingRequests}
								</p>
								<p className='text-xs text-slate-600 mt-1'>
									Awaiting approval
								</p>
							</div>
							<div className='w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg'>
								<Clock className='w-7 h-7 text-white' />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className='group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 border-slate-200'>
					<CardContent className='p-6'>
						<div className='flex items-center justify-between'>
							<div className='flex-1'>
								<p className='text-sm font-medium text-slate-700 mb-2'>
									Leave Types
								</p>
								<p className='text-3xl font-bold text-slate-900'>
									{stats.totalLeaveTypes}
								</p>
								<p className='text-xs text-slate-600 mt-1'>
									Available types
								</p>
							</div>
							<div className='w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg'>
								<TrendingUp className='w-7 h-7 text-white' />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Leave Management Card */}
			<Card className='border-0 shadow-lg bg-gradient-to-br from-slate-50 via-white to-slate-50/30 border-slate-100'>
				<CardHeader className='bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center'>
							<Calendar className='w-5 h-5 text-white' />
						</div>
						<div>
							<CardTitle className='text-slate-900'>
								Leave Management
							</CardTitle>
							<CardDescription className='text-slate-600'>
								Manage employee leave balances, requests, and
								types
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className='p-0'>
					<Tabs defaultValue='requests' className='w-full'>
						<div className='p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50/50 to-white'>
							<TabsList className='grid w-full grid-cols-3'>
								<TabsTrigger
									value='requests'
									className='flex items-center gap-2'>
									<Calendar className='w-4 h-4' />
									Leave Requests
								</TabsTrigger>
								<TabsTrigger
									value='balances'
									className='flex items-center gap-2'>
									<UserCheck className='w-4 h-4' />
									Leave Balances
								</TabsTrigger>
								<TabsTrigger
									value='types'
									className='flex items-center gap-2'>
									<TrendingUp className='w-4 h-4' />
									Leave Types
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value='requests' className='p-6'>
							{/* Search and Actions */}
							<div className='flex flex-col lg:flex-row gap-4 mb-6'>
								<div className='flex-1'>
									<div className='relative'>
										<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
										<Input
											placeholder='Search leave requests by employee, leave type, or reason...'
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
											className='pl-10 bg-white border-slate-200 focus:border-slate-400'
										/>
									</div>
								</div>
								<Dialog
									open={isRequestDialogOpen}
									onOpenChange={setIsRequestDialogOpen}>
									<DialogTrigger asChild>
										<Button
											onClick={() =>
												setIsRequestDialogOpen(true)
											}
											className='bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300'>
											<Plus className='mr-2 h-4 w-4' />
											Create Leave Request
										</Button>
									</DialogTrigger>
									<DialogContent className='max-w-2xl'>
										<DialogHeader>
											<DialogTitle>
												Create Leave Request
											</DialogTitle>
											<DialogDescription>
												Create a new leave request for
												an employee
											</DialogDescription>
										</DialogHeader>
										<form
											onSubmit={handleRequestSubmit}
											className='space-y-4'>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='request_employee_id'>
														Employee
													</Label>
													<SearchableSelect
														options={employees.map(
															(employee) => ({
																value: employee.id,
																label:
																	employee.full_name ||
																	employee.email,
																description:
																	employee.position ||
																	employee.department,
																profile_photo:
																	employee.profile_photo,
																email: employee.email,
															})
														)}
														value={
															requestFormData.employee_id
														}
														onValueChange={(
															value
														) =>
															setRequestFormData({
																...requestFormData,
																employee_id:
																	value,
															})
														}
														placeholder='Select employee'
														searchPlaceholder='Search employees...'
														emptyMessage='No employees found.'
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='request_leave_type'>
														Leave Type
													</Label>
													<SimpleSelect
														options={leaveTypes.map(
															(type) => ({
																value: type.name,
																label: type.name,
															})
														)}
														value={
															requestFormData.leave_type
														}
														onValueChange={(
															value
														) =>
															setRequestFormData({
																...requestFormData,
																leave_type:
																	value,
															})
														}
														placeholder='Select leave type'
													/>
												</div>
											</div>
											<div className='grid grid-cols-3 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='start_date'>
														Start Date
													</Label>
													<Input
														id='start_date'
														type='date'
														value={
															requestFormData.start_date
														}
														onChange={(e) => {
															setRequestFormData({
																...requestFormData,
																start_date:
																	e.target
																		.value,
															});
															setTimeout(
																calculateDays,
																100
															);
														}}
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='end_date'>
														End Date
													</Label>
													<Input
														id='end_date'
														type='date'
														value={
															requestFormData.end_date
														}
														onChange={(e) => {
															setRequestFormData({
																...requestFormData,
																end_date:
																	e.target
																		.value,
															});
															setTimeout(
																calculateDays,
																100
															);
														}}
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='days_requested'>
														Days Requested
													</Label>
													<Input
														id='days_requested'
														type='number'
														value={
															requestFormData.days_requested
														}
														onChange={(e) =>
															setRequestFormData({
																...requestFormData,
																days_requested:
																	e.target
																		.value,
															})
														}
														required
													/>
												</div>
											</div>
											<div className='space-y-2'>
												<Label htmlFor='reason'>
													Reason
												</Label>
												<Textarea
													id='reason'
													value={
														requestFormData.reason
													}
													onChange={(e) =>
														setRequestFormData({
															...requestFormData,
															reason: e.target
																.value,
														})
													}
													required
												/>
											</div>
											<div className='flex justify-end space-x-2'>
												<Button
													type='button'
													variant='outline'
													onClick={() =>
														setIsRequestDialogOpen(
															false
														)
													}>
													Cancel
												</Button>
												<Button
													type='submit'
													disabled={loading}>
													{loading
														? "Creating..."
														: "Create Request"}
												</Button>
											</div>
										</form>
									</DialogContent>
								</Dialog>
							</div>

							{/* Leave Requests List */}
							<div className='overflow-hidden'>
								{filteredLeaveRequests.length > 0 ? (
									<div className='divide-y divide-slate-200'>
										{filteredLeaveRequests.map(
											(request, index) => (
												<div
													key={request.id}
													className={`p-6 hover:bg-slate-50/50 transition-colors ${index % 2 === 0
															? "bg-white"
															: "bg-slate-50/30"
														}`}>
													<div className='flex items-center justify-between md:flex-row flex-col gap-4 items-start'>
														{/* Employee Info */}
														<div className='flex items-center gap-4'>
															<Avatar className='w-12 h-12 border-2 border-slate-200'>
																<AvatarImage
																	src={
																		request
																			.employee
																			?.profile_photo ||
																		""
																	}
																/>
																<AvatarFallback className='bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold'>
																	{request.employee?.full_name?.charAt(
																		0
																	) ||
																		request.employee?.email?.charAt(
																			0
																		) ||
																		"?"}
																</AvatarFallback>
															</Avatar>

															<div className='space-y-1'>
																<div className='flex items-center gap-2'>
																	<h3 className='font-semibold text-slate-900'>
																		{request
																			.employee
																			?.full_name ||
																			"Unknown Employee"}
																	</h3>
																	<Badge
																		className={`${getStatusColor(
																			request.status
																		)} border-0 shadow-sm`}>
																		{request.status.toUpperCase()}
																	</Badge>
																</div>

																<div className='flex items-center gap-4 text-sm text-slate-600'>
																	<div className='flex items-center gap-1'>
																		{
																			getLeaveTypeStyle(
																				request.leave_type
																			)
																				.icon
																		}
																		<span className='capitalize'>
																			{
																				request.leave_type
																			}
																		</span>
																	</div>
																	<div className='flex items-center gap-1'>
																		<Calendar className='w-3 h-3' />
																		<span>
																			{new Date(
																				request.start_date
																			).toLocaleDateString()}{" "}
																			-{" "}
																			{new Date(
																				request.end_date
																			).toLocaleDateString()}
																		</span>
																	</div>
																	<div className='flex items-center gap-1'>
																		<Clock className='w-3 h-3' />
																		<span>
																			{
																				request.days_requested
																			}{" "}
																			days
																		</span>
																	</div>
																</div>
															</div>
														</div>

														{/* Request Details */}
														<div className='flex items-center gap-6 md:flex-row flex-col gap-4 items-start'>
															<div className='text-center max-w-xs sm:text-left'>
																<p className='text-xs text-slate-500 mb-1'>
																	Reason
																</p>
																<p className='text-sm text-slate-900 line-clamp-2'>
																	{
																		request.reason
																	}
																</p>
															</div>

															<div className='flex items-center gap-2'>
																{request.status ===
																	"pending" && (
																		<>
																			<Button
																				variant='outline'
																				size='sm'
																				disabled={
																					isLeaveUpdating[
																					request
																						.id
																					]
																				}
                                                                                onClick={() => {
                                                                                    // Dispatch realtime notification for panel
                                                                                    try {
                                                                                        const { triggerDataUpdate } = require("@/components/shared/realtime-provider");
                                                                                        triggerDataUpdate("leave_approved", `Leave approved for ${request.employee_name || "employee"}`, "admin");
                                                                                    } catch {}
                                                                                    handleRequestUpdate(
                                                                                        request.id,
                                                                                        "approved"
                                                                                    )
                                                                                }}
																				className='bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'>
																				{isLeaveUpdating[
																					request
																						.id
																				] ? (
																					<Loader2 className='h-4 w-4 animate-spin' />
																				) : (
																					<Check className='h-4 w-4' />
																				)}
																			</Button>
																			<Button
																				variant='outline'
																				size='sm'
																				disabled={
																					isLeaveUpdating[
																					request
																						.id
																					]
																				}
                                                                                onClick={() => {
                                                                                    try {
                                                                                        const { triggerDataUpdate } = require("@/components/shared/realtime-provider");
                                                                                        triggerDataUpdate("leave_rejected", `Leave rejected for ${request.employee_name || "employee"}`, "admin");
                                                                                    } catch {}
                                                                                    handleRequestUpdate(
                                                                                        request.id,
                                                                                        "rejected"
                                                                                    )
                                                                                }}
																				className='bg-red-50 hover:bg-red-100 text-red-700 border-red-200'>
																				{isLeaveUpdating[
																					request
																						.id
																				] ? (
																					<Loader2 className='h-4 w-4 animate-spin' />
																				) : (
																					<X className='h-4 w-4' />
																				)}
																			</Button>
																		</>
																	)}

																{/* Edit Button */}
																<Button
																	variant='outline'
																	size='sm'
																	onClick={() =>
																		setIsRequestDialogOpen(
																			true
																		)
																	}
																	className='h-8 px-3 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800'>
																	<Edit className='w-4 h-4 mr-1' />
																	
																</Button>

																{/* Delete Button */}
																<Button
																	variant='outline'
																	size='sm'
																	onClick={() => openDeleteModal(request)}
																	className='h-8 px-3 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800'>
																	<Trash2 className='w-4 h-4 mr-1' />
																	
																</Button>
															</div>
														</div>
													</div>
												</div>
											)
										)}
									</div>
								) : (
									<div className='text-center py-12'>
										<div className='w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4'>
											<Calendar className='w-8 h-8 text-slate-500' />
										</div>
										<p className='text-slate-600 font-medium'>
											No leave requests found
										</p>
										<p className='text-sm text-slate-400 mt-2'>
											{searchTerm
												? "Try adjusting your search criteria."
												: "Get started by creating leave requests for employees."}
										</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value='balances' className='p-6'>
							{/* Search and Actions */}
							<div className='flex flex-col lg:flex-row gap-4 mb-6'>
								<div className='flex-1'>
									<div className='relative'>
										<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
										<Input
											placeholder='Search leave balances by employee or leave type...'
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
											className='pl-10 bg-white border-slate-200 focus:border-slate-400'
										/>
									</div>
								</div>
								<div>
									<Button
										onClick={() => openBalanceDialog()}
										className='bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300'>
										<Calendar className='mr-2 h-4 w-4' />
										Update Leave Balance
									</Button>
								</div>
								<Dialog
									open={isBalanceDialogOpen}
									onOpenChange={setIsBalanceDialogOpen}>
									<DialogTrigger asChild>

									</DialogTrigger>
									<DialogContent className='max-w-2xl'>
										<DialogHeader>
											<DialogTitle>
												{editingBalance
													? "Edit"
													: "Add"}{" "}
												Leave Balance
											</DialogTitle>
											<DialogDescription>
												{editingBalance
													? "Update"
													: "Set"}{" "}
												leave balance for an employee
											</DialogDescription>
										</DialogHeader>
										<form
											onSubmit={handleBalanceSubmit}
											className='space-y-4'>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='balance_employee_id'>
														Employee
													</Label>
													<SearchableSelect
														options={employees.map(
															(employee) => ({
																value: employee.id,
																label:
																	employee.full_name ||
																	employee.email,
																description:
																	employee.position ||
																	employee.department,
																profile_photo:
																	employee.profile_photo,
																email: employee.email,
															})
														)}
														value={
															balanceFormData.employee_id
														}
														onValueChange={(
															value
														) =>
															setBalanceFormData({
																...balanceFormData,
																employee_id:
																	value,
															})
														}
														placeholder='Select employee'
														searchPlaceholder='Search employees...'
														emptyMessage='No employees found.'
														disabled={
															!!editingBalance
														}
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='balance_leave_type'>
														Leave Type
													</Label>
													<SimpleSelect
														options={leaveTypes.map(
															(type) => ({
																value: type.name,
																label: type.name,
															})
														)}
														value={
															balanceFormData.leave_type
														}
														onValueChange={(
															value
														) =>
															setBalanceFormData({
																...balanceFormData,
																leave_type:
																	value,
															})
														}
														placeholder='Select leave type'
														disabled={
															!!editingBalance
														}
													/>
												</div>
											</div>
											<div className='grid grid-cols-3 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='year'>
														Year
													</Label>
													<Input
														id='year'
														type='number'
														value={
															balanceFormData.year
														}
														onChange={(e) =>
															setBalanceFormData({
																...balanceFormData,
																year: Number.parseInt(
																	e.target
																		.value
																),
															})
														}
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='total_days'>
														Total Days
													</Label>
													<Input
														id='total_days'
														type='number'
														value={
															balanceFormData.total_days
														}
														onChange={(e) =>
															setBalanceFormData({
																...balanceFormData,
																total_days:
																	e.target
																		.value,
															})
														}
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='used_days'>
														Used Days
													</Label>
													<Input
														id='used_days'
														type='number'
														value={
															balanceFormData.used_days
														}
														onChange={(e) =>
															setBalanceFormData({
																...balanceFormData,
																used_days:
																	e.target
																		.value,
															})
														}
													/>
												</div>
											</div>
											<div className='flex justify-end space-x-2'>
												<Button
													type='button'
													variant='outline'
													onClick={() =>
														setIsBalanceDialogOpen(
															false
														)
													}>
													Cancel
												</Button>
												<Button
													type='submit'
													disabled={loading}>
													{loading
														? "Saving..."
														: editingBalance
															? "Update"
															: "Add"}{" "}
													Balance
												</Button>
											</div>
										</form>
									</DialogContent>
								</Dialog>
							</div>

							{/* Leave Balances List */}
							<div className='overflow-hidden'>
								{filteredLeaveBalances.length > 0 ? (
									<div className='divide-y divide-slate-200'>
										{filteredLeaveBalances.map(
											(balance, index) => (
												<div
													key={balance.id}
													className={`p-6 hover:bg-slate-50/50 transition-colors ${index % 2 === 0
															? "bg-white"
															: "bg-slate-50/30"
														}`}>
													<div className='flex items-center justify-between md:flex-row flex-col gap-4 items-start'>
														{/* Employee Info */}
														<div className='flex items-center gap-4'>
															<Avatar className='w-12 h-12 border-2 border-slate-200'>
																<AvatarImage
																	src={
																		balance
																			.employee
																			?.profile_photo ||
																		""
																	}
																/>
																<AvatarFallback className='bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold'>
																	{balance.employee?.full_name?.charAt(
																		0
																	) ||
																		balance.employee?.email?.charAt(
																			0
																		) ||
																		"?"}
																</AvatarFallback>
															</Avatar>

															<div className='space-y-1'>
																<div className='flex items-center gap-2'>
																	<h3 className='font-semibold text-slate-900'>
																		{balance
																			.employee
																			?.full_name ||
																			"Unknown Employee"}
																	</h3>
																	<Badge className='bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 border-0 shadow-sm'>
																		{
																			balance.year
																		}
																	</Badge>
																</div>

																<div className='flex items-center gap-4 text-sm text-slate-600'>
																	<div className='flex items-center gap-1'>
																		{
																			getLeaveTypeStyle(
																				balance.leave_type
																			)
																				.icon
																		}
																		<span className='capitalize'>
																			{
																				balance.leave_type
																			}
																		</span>
																	</div>
																	<div className='flex items-center gap-1'>
																		<Briefcase className='w-3 h-3' />
																		<span>
																			{balance
																				.employee
																				?.position ||
																				"No position"}
																		</span>
																	</div>
																</div>
															</div>
														</div>

														{/* Balance Info */}
														<div className='flex items-center gap-6'>
															<div className='text-center'>
																<p className='text-xs text-slate-500 mb-1'>
																	Total Days
																</p>
																<p className='font-semibold text-slate-900'>
																	{
																		balance.total_days
																	}
																</p>
															</div>
															<div className='text-center'>
																<p className='text-xs text-slate-500 mb-1'>
																	Used Days
																</p>
																<p className='font-semibold text-amber-600'>
																	{
																		balance.used_days
																	}
																</p>
															</div>
															<div className='text-center'>
																<p className='text-xs text-slate-500 mb-1'>
																	Remaining
																</p>
																<p className='font-semibold text-emerald-600 text-lg'>
																	{
																		balance.remaining_days
																	}
																</p>
															</div>

															{/* Edit Button */}
															<Button
																variant='outline'
																size='sm'
																onClick={() =>
																	openBalanceDialog(
																		balance
																	)
																}
																className='h-8 px-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800'>
																<Edit className='w-4 h-4' />
																
															</Button>

															{/* Delete Button */}
															<Button
																variant='outline'
																size='sm'
																onClick={() =>
																	openDeleteDialog(
																		"balance",
																		balance.id,
																		balance
																	)
																}
																className='h-8 px-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800'>
																<Trash2 className='w-4 h-4' />
																
															</Button>
														</div>
													</div>
												</div>
											)
										)}
									</div>
								) : (
									<div className='text-center py-12'>
										<div className='w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4'>
											<UserCheck className='w-8 h-8 text-slate-500' />
										</div>
										<p className='text-slate-600 font-medium'>
											No leave balances found
										</p>
										<p className='text-sm text-slate-400 mt-2'>
											{searchTerm
												? "Try adjusting your search criteria."
												: "Get started by adding leave balances for employees."}
										</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value='types' className='p-6'>
							{/* Search and Actions */}
							<div className='flex flex-col lg:flex-row gap-4 mb-6'>
								<div className='flex-1'>
									<div className='relative'>
										<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
										<Input
											placeholder='Search leave types by name or description...'
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
											className='pl-10 bg-white border-slate-200 focus:border-slate-400'
										/>
									</div>
								</div>
								<div>
								<Button
											onClick={() => openTypeDialog()}
											className='bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300'>
											<Plus className='mr-2 h-4 w-4' />
											Add Leave Type
										</Button>
								</div>
								<Dialog
									open={isTypeDialogOpen}
									onOpenChange={setIsTypeDialogOpen}>
									<DialogTrigger asChild>
										
									</DialogTrigger>
									<DialogContent className='max-w-2xl'>
										<DialogHeader>
											<DialogTitle>
												{editingType
													? "Edit Leave Type"
													: "Add Leave Type"}
											</DialogTitle>
											<DialogDescription>
												{editingType
													? "Update the leave type details"
													: "Create a new leave type for the organization"}
											</DialogDescription>
										</DialogHeader>
										<form
											onSubmit={handleTypeSubmit}
											className='space-y-4'>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='type_name'>
														Name
													</Label>
													<Input
														id='type_name'
														value={
															typeFormData.name
														}
														onChange={(e) =>
															setTypeFormData({
																...typeFormData,
																name: e.target
																	.value,
															})
														}
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='max_days'>
														Max Days Per Year
													</Label>
													<Input
														id='max_days'
														type='number'
														value={
															typeFormData.max_days_per_year
														}
														onChange={(e) =>
															setTypeFormData({
																...typeFormData,
																max_days_per_year:
																	e.target
																		.value,
															})
														}
														required
													/>
												</div>
											</div>
											<div className='space-y-2'>
												<Label htmlFor='description'>
													Description
												</Label>
												<Textarea
													id='description'
													value={
														typeFormData.description
													}
													onChange={(e) =>
														setTypeFormData({
															...typeFormData,
															description:
																e.target.value,
														})
													}
												/>
											</div>
											<div className='flex items-center space-x-2'>
												<input
													type='checkbox'
													id='carry_forward'
													checked={
														typeFormData.carry_forward
													}
													onChange={(e) =>
														setTypeFormData({
															...typeFormData,
															carry_forward:
																e.target
																	.checked,
														})
													}
												/>
												<Label htmlFor='carry_forward'>
													Allow carry forward to next
													year
												</Label>
											</div>
											<div className='flex justify-end space-x-2'>
												<Button
													type='button'
													variant='outline'
													onClick={() =>
														setIsTypeDialogOpen(
															false
														)
													}>
													Cancel
												</Button>
												<Button
													type='submit'
													disabled={loading}>
													{loading
														? editingType
															? "Updating..."
															: "Creating..."
														: editingType
															? "Update Leave Type"
															: "Create Leave Type"}
												</Button>
											</div>
										</form>
									</DialogContent>
								</Dialog>
							</div>

							{/* Leave Types List */}
							<div className='overflow-hidden'>
								{filteredLeaveTypes.length > 0 ? (
									<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
										{filteredLeaveTypes.map((type) => {
											const style = getLeaveTypeStyle(
												type.name
											);
											return (
												<Card
													key={type.id}
													className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${style.bg} ${style.border} ${style.hoverBorder}`}>
													<CardContent className='p-6'>
														<div className='flex items-start justify-between mb-4'>
															<div className='flex items-center gap-4'>
																<div
																	className={`w-14 h-14 ${style.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
																	{style.icon}
																</div>
																<div className='flex-1'>
																	<h3
																		className={`font-bold text-lg ${style.textColor} mb-1`}>
																		{
																			type.name
																		}
																	</h3>
																	<div className='flex items-center gap-2'>
																		<div
																			className={`w-2 h-2 rounded-full ${style.dotBg}`}></div>
																		<p
																			className={`text-sm font-medium ${style.accentColor}`}>
																			{
																				type.max_days_per_year
																			}{" "}
																			days/year
																		</p>
																	</div>
																</div>
															</div>

															<div>
																{/* Edit Button */}
																<Button
																	variant='outline'
																	size='sm'
																	onClick={() =>
																		openTypeDialog(
																			type
																		)
																	}
																	className='h-8 px-3 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800'>
																	<Edit className='w-4 h-4 mr-1' />
																	Edit
																</Button>

																{/* Delete Button */}
																<Button
																	variant='outline'
																	size='sm'
																	onClick={() =>
																		openDeleteDialog(
																			"type",
																			type.id,
																			type
																		)
																	}
																	className='h-8 px-3 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800'>
																	<Trash2 className='w-4 h-4 mr-1' />
																	Delete
																</Button>
															</div>
														</div>

														<div className='space-y-4'>
															<div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/40'>
																<p
																	className={`text-xs font-medium ${style.accentColor} mb-2 uppercase tracking-wide`}>
																	Description
																</p>
																<p
																	className={`text-sm ${style.textColor} line-clamp-3 leading-relaxed`}>
																	{type.description ||
																		"No description provided for this leave type."}
																</p>
															</div>

															<div className='flex items-center justify-between'>
																<div className='flex items-center gap-3'>
																	<div
																		className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center`}>
																		<Calendar className='w-4 h-4 text-white' />
																	</div>
																	<div>
																		<p
																			className={`text-xs font-medium ${style.accentColor} uppercase tracking-wide`}>
																			Carry
																			Forward
																		</p>
																		<Badge
																			className={`${type.carry_forward
																					? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300"
																					: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
																				} border-0 shadow-sm font-medium`}>
																			{type.carry_forward
																				? "✓ Allowed"
																				: "✗ Not Allowed"}
																		</Badge>
																	</div>
																</div>
															</div>
														</div>
													</CardContent>
												</Card>
											);
										})}
									</div>
								) : (
									<div className='text-center py-12'>
										<div className='w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4'>
											<TrendingUp className='w-8 h-8 text-slate-500' />
										</div>
										<p className='text-slate-600 font-medium'>
											No leave types found
										</p>
										<p className='text-sm text-slate-400 mt-2'>
											{searchTerm
												? "Try adjusting your search criteria."
												: "Get started by creating leave types for your organization."}
										</p>
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle className='text-red-600'>
							{deletingItem?.type === "request" &&
								"Delete Leave Request"}
							{deletingItem?.type === "balance" &&
								"Delete Leave Balance"}
							{deletingItem?.type === "type" &&
								"Delete Leave Type"}
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this item? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>

					{deletingItem && (
						<div className='space-y-4'>
							{deletingItem.type === "request" && (
								<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
									<h4 className='font-semibold text-red-800 mb-3'>
										Leave Request Details
									</h4>
									<div className='grid grid-cols-2 gap-4 text-sm'>
										<div>
											<strong className='text-red-700'>
												Employee:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.employee
													?.full_name || "Unknown"}
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Leave Type:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.leave_type}
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Duration:
											</strong>
											<p className='text-red-600'>
												{
													deletingItem.data
														.days_requested
												}{" "}
												days
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Status:
											</strong>
											<p className='text-red-600 capitalize'>
												{deletingItem.data.status}
											</p>
										</div>
										<div className='col-span-2'>
											<strong className='text-red-700'>
												Reason:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.reason}
											</p>
										</div>
									</div>
								</div>
							)}

							{deletingItem.type === "balance" && (
								<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
									<h4 className='font-semibold text-red-800 mb-3'>
										Leave Balance Details
									</h4>
									<div className='grid grid-cols-2 gap-4 text-sm'>
										<div>
											<strong className='text-red-700'>
												Employee:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.employee
													?.full_name || "Unknown"}
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Leave Type:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.leave_type}
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Year:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.year}
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Total Days:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.total_days}
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Used Days:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.used_days}
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Remaining:
											</strong>
											<p className='text-red-600'>
												{
													deletingItem.data
														.remaining_days
												}
											</p>
										</div>
									</div>
								</div>
							)}

							{deletingItem.type === "type" && (
								<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
									<h4 className='font-semibold text-red-800 mb-3'>
										Leave Type Details
									</h4>
									<div className='grid grid-cols-2 gap-4 text-sm'>
										<div>
											<strong className='text-red-700'>
												Name:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.name}
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Max Days/Year:
											</strong>
											<p className='text-red-600'>
												{
													deletingItem.data
														.max_days_per_year
												}
											</p>
										</div>
										<div>
											<strong className='text-red-700'>
												Carry Forward:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data.carry_forward
													? "Yes"
													: "No"}
											</p>
										</div>
										<div className='col-span-2'>
											<strong className='text-red-700'>
												Description:
											</strong>
											<p className='text-red-600'>
												{deletingItem.data
													.description ||
													"No description"}
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					<div className='flex justify-end space-x-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => setIsDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							type='button'
							onClick={handleDeleteConfirm}
							className='bg-red-600 hover:bg-red-700 text-white'>
							<Trash2 className='w-4 h-4 mr-2' />
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setLeaveToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
				item={leaveToDelete}
				loading={false}
			/>
		</div>
	);
}
