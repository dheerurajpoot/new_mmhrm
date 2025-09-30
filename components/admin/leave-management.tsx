"use client";

import type React from "react";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, X, Edit, Plus, Trash2, Loader2 } from "lucide-react";
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
	const [loading, setLoading] = useState(true);
	const [isLeaveUpdating, setIsLeaveUpdating] = useState(false);
	const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
	const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
	const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
	const [editingBalance, setEditingBalance] = useState<LeaveBalance | null>(
		null
	);
	const [editingType, setEditingType] = useState<LeaveType | null>(null);

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
		const confirmed = window.confirm(
			"Are you sure you want to delete this leave type? This action cannot be undone."
		);
		if (!confirmed) return;

		try {
			const response = await fetch(`/api/leave-types/${typeId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Leave type deleted successfully");
				fetchData();
			} else {
				toast.error("Failed to delete leave type");
			}
		} catch (error) {
			toast.error("Failed to delete leave type");
		}
	};

	const handleDeleteBalance = async (balanceId: string) => {
		const confirmed = window.confirm(
			"Are you sure you want to delete this leave balance? This action cannot be undone."
		);
		if (!confirmed) return;

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
		const confirmed = window.confirm(
			"Are you sure you want to delete this leave request? This action cannot be undone."
		);
		if (!confirmed) return;

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

	const handleRequestUpdate = async (
		requestId: string,
		status: "approved" | "rejected"
	) => {
		setIsLeaveUpdating(true);
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
				setIsLeaveUpdating(false);
			} else {
				const errorData = await response.json();
				toast.error(
					errorData.error || "Failed to update leave request"
				);
				setIsLeaveUpdating(false);
			}
		} catch (error) {
			toast.error("Failed to update leave request");
			setIsLeaveUpdating(false);
		} finally {
			setIsLeaveUpdating(false);
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
				return "bg-blue-100 text-blue-800";
			case "rejected":
				return "bg-red-100 text-red-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

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
			<div className='flex items-center justify-center h-64'>
				Loading leave data...
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-2xl font-bold tracking-tight'>
						Leave Management
					</h2>
					<p className='text-muted-foreground'>
						Manage employee leave balances, requests, and types
					</p>
				</div>
			</div>

			<Tabs defaultValue='requests' className='space-y-4'>
				<TabsList>
					<TabsTrigger value='requests'>Leave Requests</TabsTrigger>
					<TabsTrigger value='balances'>Leave Balances</TabsTrigger>
					<TabsTrigger value='types'>Leave Types</TabsTrigger>
				</TabsList>

				<TabsContent value='requests' className='space-y-4'>
					<div className='flex justify-end'>
						<Dialog
							open={isRequestDialogOpen}
							onOpenChange={setIsRequestDialogOpen}>
							<DialogTrigger asChild>
								<Button
									onClick={() =>
										setIsRequestDialogOpen(true)
									}>
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
										Create a new leave request for an
										employee
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
												onValueChange={(value) =>
													setRequestFormData({
														...requestFormData,
														employee_id: value,
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
												onValueChange={(value) =>
													setRequestFormData({
														...requestFormData,
														leave_type: value,
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
															e.target.value,
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
												value={requestFormData.end_date}
												onChange={(e) => {
													setRequestFormData({
														...requestFormData,
														end_date:
															e.target.value,
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
															e.target.value,
													})
												}
												required
											/>
										</div>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='reason'>Reason</Label>
										<Textarea
											id='reason'
											value={requestFormData.reason}
											onChange={(e) =>
												setRequestFormData({
													...requestFormData,
													reason: e.target.value,
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
												setIsRequestDialogOpen(false)
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

					<Card>
						<CardHeader>
							<CardTitle>Leave Requests</CardTitle>
							<CardDescription>
								Review and manage employee leave requests
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='overflow-x-auto'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Employee</TableHead>
											<TableHead>Leave Type</TableHead>
											<TableHead>Dates</TableHead>
											<TableHead>Days</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Reason</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{leaveRequests.map((request) => (
											<TableRow key={request.id}>
												<TableCell>
													<div className='flex items-center gap-3'>
														<Avatar className='w-8 h-8'>
															<AvatarImage
																src={
																	request
																		.employee
																		?.profile_photo ||
																	""
																}
															/>
															<AvatarFallback className='text-xs'>
																{request.employee?.full_name?.charAt(
																	0
																) ||
																	request.employee?.email?.charAt(
																		0
																	) ||
																	"?"}
															</AvatarFallback>
														</Avatar>
														<div>
															<p className='font-medium'>
																{request
																	.employee
																	?.full_name ||
																	"Unknown Employee"}
															</p>
															<p className='text-sm text-gray-500'>
																{
																	request
																		.employee
																		?.position
																}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													{request.leave_type}
												</TableCell>
												<TableCell>
													{new Date(
														request.start_date
													).toLocaleDateString()}{" "}
													-{" "}
													{new Date(
														request.end_date
													).toLocaleDateString()}
												</TableCell>
												<TableCell>
													{request.days_requested}
												</TableCell>
												<TableCell>
													<Badge
														className={getStatusColor(
															request.status
														)}>
														{request.status.toUpperCase()}
													</Badge>
												</TableCell>
												<TableCell className='max-w-xs truncate'>
													{request.reason}
												</TableCell>
												<TableCell>
													<div className='flex space-x-2'>
														{request.status ===
															"pending" && (
															<>
																<Button
																	variant='outline'
																	size='sm'
																	onClick={() =>
																		handleRequestUpdate(
																			request.id,
																			"approved"
																		)
																	}>
																	{isLeaveUpdating ? (<Loader2 className='h-4 w-4 animate-spin' />) : (<Check className='h-4 w-4' />)}
																</Button>
																<Button
																	variant='outline'
																	size='sm'
																	onClick={() =>
																		handleRequestUpdate(
																			request.id,
																			"rejected"
																		)
																	}>
																	<X className='h-4 w-4' />
																</Button>
															</>
														)}
														<Button
															variant='outline'
															size='sm'
															onClick={() =>
																handleDeleteRequest(
																	request.id
																)
															}>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='balances' className='space-y-4'>
					<div className='flex justify-end'>
						<Dialog
							open={isBalanceDialogOpen}
							onOpenChange={setIsBalanceDialogOpen}>
							<DialogTrigger asChild>
								<Button onClick={() => openBalanceDialog()}>
									<Calendar className='mr-2 h-4 w-4' />
									Update Leave Balance
								</Button>
							</DialogTrigger>
							<DialogContent className='max-w-2xl'>
								<DialogHeader>
									<DialogTitle>
										{editingBalance ? "Edit" : "Add"} Leave
										Balance
									</DialogTitle>
									<DialogDescription>
										{editingBalance ? "Update" : "Set"}{" "}
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
												onValueChange={(value) =>
													setBalanceFormData({
														...balanceFormData,
														employee_id: value,
													})
												}
												placeholder='Select employee'
												searchPlaceholder='Search employees...'
												emptyMessage='No employees found.'
												disabled={!!editingBalance}
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
												onValueChange={(value) =>
													setBalanceFormData({
														...balanceFormData,
														leave_type: value,
													})
												}
												placeholder='Select leave type'
												disabled={!!editingBalance}
											/>
										</div>
									</div>
									<div className='grid grid-cols-3 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor='year'>Year</Label>
											<Input
												id='year'
												type='number'
												value={balanceFormData.year}
												onChange={(e) =>
													setBalanceFormData({
														...balanceFormData,
														year: Number.parseInt(
															e.target.value
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
															e.target.value,
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
															e.target.value,
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
												setIsBalanceDialogOpen(false)
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

					<Card>
						<CardHeader>
							<CardTitle>Leave Balances</CardTitle>
							<CardDescription>
								View and manage employee leave balances
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='overflow-x-auto'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Employee</TableHead>
											<TableHead>Leave Type</TableHead>
											<TableHead>Year</TableHead>
											<TableHead>Total Days</TableHead>
											<TableHead>Used Days</TableHead>
											<TableHead>
												Remaining Days
											</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{leaveBalances.map((balance) => (
											<TableRow key={balance.id}>
												<TableCell>
													<div className='flex items-center gap-3'>
														<Avatar className='w-8 h-8'>
															<AvatarImage
																src={
																	balance
																		.employee
																		?.profile_photo ||
																	""
																}
															/>
															<AvatarFallback className='text-xs'>
																{balance.employee?.full_name?.charAt(
																	0
																) ||
																	balance.employee?.email?.charAt(
																		0
																	) ||
																	"?"}
															</AvatarFallback>
														</Avatar>
														<div>
															<p className='font-medium'>
																{balance
																	.employee
																	?.full_name ||
																	"Unknown Employee"}
															</p>
															<p className='text-sm text-gray-500'>
																{
																	balance
																		.employee
																		?.position
																}
															</p>
														</div>
													</div>
												</TableCell>
												<TableCell>
													{balance.leave_type}
												</TableCell>
												<TableCell>
													{balance.year}
												</TableCell>
												<TableCell>
													{balance.total_days}
												</TableCell>
												<TableCell>
													{balance.used_days}
												</TableCell>
												<TableCell className='font-medium'>
													{balance.remaining_days}
												</TableCell>
												<TableCell>
													<div className='flex space-x-2'>
														<Button
															variant='outline'
															size='sm'
															onClick={() =>
																openBalanceDialog(
																	balance
																)
															}>
															<Edit className='h-4 w-4' />
														</Button>
														<Button
															variant='outline'
															size='sm'
															onClick={() =>
																handleDeleteBalance(
																	balance.id
																)
															}>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='types' className='space-y-4'>
					<div className='flex justify-end'>
						<Dialog
							open={isTypeDialogOpen}
							onOpenChange={setIsTypeDialogOpen}>
							<DialogTrigger asChild>
								<Button onClick={() => openTypeDialog()}>
									<Plus className='mr-2 h-4 w-4' />
									Add Leave Type
								</Button>
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
												value={typeFormData.name}
												onChange={(e) =>
													setTypeFormData({
														...typeFormData,
														name: e.target.value,
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
															e.target.value,
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
											value={typeFormData.description}
											onChange={(e) =>
												setTypeFormData({
													...typeFormData,
													description: e.target.value,
												})
											}
										/>
									</div>
									<div className='flex items-center space-x-2'>
										<input
											type='checkbox'
											id='carry_forward'
											checked={typeFormData.carry_forward}
											onChange={(e) =>
												setTypeFormData({
													...typeFormData,
													carry_forward:
														e.target.checked,
												})
											}
										/>
										<Label htmlFor='carry_forward'>
											Allow carry forward to next year
										</Label>
									</div>
									<div className='flex justify-end space-x-2'>
										<Button
											type='button'
											variant='outline'
											onClick={() =>
												setIsTypeDialogOpen(false)
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

					<Card>
						<CardHeader>
							<CardTitle>Leave Types</CardTitle>
							<CardDescription>
								Manage different types of leave available to
								employees
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='overflow-x-auto'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Description</TableHead>
											<TableHead>Max Days/Year</TableHead>
											<TableHead>Carry Forward</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{leaveTypes.map((type, index) => (
											<TableRow key={index}>
												<TableCell className='font-medium'>
													{type.name}
												</TableCell>
												<TableCell>
													{type.description}
												</TableCell>
												<TableCell>
													{type.max_days_per_year}
												</TableCell>
												<TableCell>
													<Badge
														variant={
															type.carry_forward
																? "default"
																: "secondary"
														}>
														{type.carry_forward
															? "Yes"
															: "No"}
													</Badge>
												</TableCell>
												<TableCell>
													<div className='flex items-center space-x-2'>
														<Button
															variant='outline'
															size='sm'
															onClick={() =>
																openTypeDialog(
																	type
																)
															}>
															<Edit className='h-4 w-4' />
														</Button>
														<Button
															variant='outline'
															size='sm'
															onClick={() =>
																handleDeleteType(
																	type.id
																)
															}>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
