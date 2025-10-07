"use client";

import type React from "react";

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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
	createUser,
	updateEmployee,
	deleteEmployee,
} from "@/app/actions/admin";

interface Employee {
	id: string;
	full_name: string;
	email: string;
	role: "admin" | "hr" | "employee";
	department: string;
	position: string;
	phone: string;
	hire_date: string;
	address: string;
}

interface EmployeeManagementProps {
	currentUserRole: "admin" | "hr";
}

export function EmployeeManagement({
	currentUserRole,
}: EmployeeManagementProps) {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editingEmployee, setEditingEmployee] = useState<Employee | null>(
		null
	);
	const [formData, setFormData] = useState({
		full_name: "",
		email: "",
		role: "employee" as "admin" | "hr" | "employee",
		department: "",
		position: "",
		phone: "",
		hire_date: "",
		address: "",
	});

	useEffect(() => {
		fetchEmployees();
	}, []);

	const fetchEmployees = async () => {
		try {
			const response = await fetch("/api/employees");
			if (response.ok) {
				const data = await response.json();
				setEmployees(data);
			}
		} catch (error) {
			console.error("Error fetching employees:", error);
			toast("Failed to fetch employees");
		} finally {
			setLoading(false);
		}
	};

	const handleAddEmployee = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const result = await createUser(formData);
			if (result.success) {
				toast("Employee added successfully. Verification email sent.");
				setIsAddDialogOpen(false);
				setFormData({
					full_name: "",
					email: "",
					role: "employee",
					department: "",
					position: "",
					phone: "",
					hire_date: "",
					address: "",
				});
				fetchEmployees();
			} else {
				toast("Failed to add employee");
			}
		} catch (error) {
			toast("Failed to add employee");
		} finally {
			setLoading(false);
		}
	};

	const handleEditEmployee = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingEmployee) return;

		setLoading(true);
		try {
			const result = await updateEmployee(editingEmployee.id, formData);
			if (result.success) {
				toast("Employee updated successfully");
				setIsEditDialogOpen(false);
				setEditingEmployee(null);
				fetchEmployees();
			} else {
				toast("Failed to update employee");
			}
		} catch (error) {
			toast("Failed to update employee");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteEmployee = async (
		employeeId: string,
		employeeRole: string
	) => {
		if (employeeRole === "hr" && currentUserRole !== "admin") {
			toast("Only admin can remove HR users");
			return;
		}

		if (!confirm("Are you sure you want to delete this employee?")) return;

		setLoading(true);
		try {
			const result = await deleteEmployee(employeeId);
			if (result.success) {
				toast("Employee deleted successfully");
				fetchEmployees();
			} else {
				toast("Failed to delete employee");
			}
		} catch (error) {
			toast("Failed to delete employee");
		} finally {
			setLoading(false);
		}
	};

	const openEditDialog = (employee: Employee) => {
		setEditingEmployee(employee);
		setFormData({
			full_name: employee.full_name,
			email: employee.email,
			role: employee.role,
			department: employee.department,
			position: employee.position,
			phone: employee.phone,
			hire_date: employee.hire_date,
			address: employee.address,
		});
		setIsEditDialogOpen(true);
	};

	const canDeleteEmployee = (employee: Employee) => {
		if (currentUserRole === "admin") return true;
		if (currentUserRole === "hr" && employee.role === "employee")
			return true;
		return false;
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-slate-100 text-slate-800";
			case "hr":
				return "bg-slate-100 text-slate-800";
			case "employee":
				return "bg-slate-100 text-slate-800";
			default:
				return "bg-slate-100 text-slate-800";
		}
	};

	if (loading && employees.length === 0) {
		return (
			<div className='flex items-center justify-center h-64'>
				Loading employees...
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-2xl font-bold tracking-tight text-slate-900'>
						Employee Management
					</h2>
					<p className='text-slate-600'>
						Manage employees, roles, and permissions
					</p>
				</div>
				<Dialog
					open={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 rounded-2xl px-8 py-3">
							<UserPlus className='mr-2 h-4 w-4' />
							Add Employee
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-2xl'>
						<DialogHeader>
							<DialogTitle>Add New Employee</DialogTitle>
							<DialogDescription>
								Create a new employee account. They will receive
								an email verification link.
							</DialogDescription>
						</DialogHeader>
						<form
							onSubmit={handleAddEmployee}
							className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='full_name'>Full Name</Label>
									<Input
										id='full_name'
										value={formData.full_name}
										onChange={(e) =>
											setFormData({
												...formData,
												full_name: e.target.value,
											})
										}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='email'>Email</Label>
									<Input
										id='email'
										type='email'
										value={formData.email}
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
										}
										required
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='role'>Role</Label>
									<Select
										value={formData.role}
										onValueChange={(
											value: "admin" | "hr" | "employee"
										) =>
											setFormData({
												...formData,
												role: value,
											})
										}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='employee'>
												Employee
											</SelectItem>
											<SelectItem value='hr'>
												HR
											</SelectItem>
											{currentUserRole === "admin" && (
												<SelectItem value='admin'>
													Admin
												</SelectItem>
											)}
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='department'>
										Department
									</Label>
									<Input
										id='department'
										value={formData.department}
										onChange={(e) =>
											setFormData({
												...formData,
												department: e.target.value,
											})
										}
										required
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='position'>Position</Label>
									<Input
										id='position'
										value={formData.position}
										onChange={(e) =>
											setFormData({
												...formData,
												position: e.target.value,
											})
										}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='phone'>Phone</Label>
									<Input
										id='phone'
										value={formData.phone}
										onChange={(e) =>
											setFormData({
												...formData,
												phone: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='hire_date'>Hire Date</Label>
									<Input
										id='hire_date'
										type='date'
										value={formData.hire_date}
										onChange={(e) =>
											setFormData({
												...formData,
												hire_date: e.target.value,
											})
										}
										required
									/>
								</div>
								<div className='space-y-2'>
									<Label htmlFor='address'>Address</Label>
									<Input
										id='address'
										value={formData.address}
										onChange={(e) =>
											setFormData({
												...formData,
												address: e.target.value,
											})
										}
									/>
								</div>
							</div>
							<div className='flex justify-end space-x-2'>
								<Button
									type='button'
									variant='outline'
									onClick={() => setIsAddDialogOpen(false)}>
									Cancel
								</Button>
								<Button type='submit' disabled={loading}>
									{loading ? "Adding..." : "Add Employee"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 hover:shadow-2xl transition-all duration-500">
				<CardHeader className="bg-gradient-to-r from-slate-50/50 to-slate-100/30 border-b border-slate-200/50 rounded-t-3xl p-8">
					<CardTitle className="text-slate-900">All Employees</CardTitle>
					<CardDescription className="text-slate-600">
						View and manage all employees in the organization
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='overflow-x-auto'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Department</TableHead>
									<TableHead>Position</TableHead>
									<TableHead>Hire Date</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{employees.map((employee) => (
									<TableRow key={employee.id} className="hover:bg-white/60 transition-all duration-300 border-b border-slate-200/50">
										<TableCell className='font-medium'>
											{employee.full_name}
										</TableCell>
										<TableCell>{employee.email}</TableCell>
										<TableCell>
											<Badge
												className={getRoleColor(
													employee.role
												)}>
												{employee.role.toUpperCase()}
											</Badge>
										</TableCell>
										<TableCell>
											{employee.department}
										</TableCell>
										<TableCell>
											{employee.position}
										</TableCell>
										<TableCell>
											{new Date(
												employee.hire_date
											).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<div className='flex space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() =>
														openEditDialog(employee)
													}
													className="h-8 px-3 bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-800"
												>
													<Edit className='h-4 w-4 mr-1' />
													Edit
												</Button>
												{canDeleteEmployee(
													employee
												) && (
													<Button
														variant='outline'
														size='sm'
														onClick={() =>
															handleDeleteEmployee(
																employee.id,
																employee.role
															)
														}
														className="h-8 px-3 bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-800"
													>
														<Trash2 className='h-4 w-4 mr-1' />
														Delete
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className='max-w-2xl'>
					<DialogHeader>
						<DialogTitle>Edit Employee</DialogTitle>
						<DialogDescription>
							Update employee information and role
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEditEmployee} className='space-y-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit_full_name'>
									Full Name
								</Label>
								<Input
									id='edit_full_name'
									value={formData.full_name}
									onChange={(e) =>
										setFormData({
											...formData,
											full_name: e.target.value,
										})
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit_email'>Email</Label>
								<Input
									id='edit_email'
									type='email'
									value={formData.email}
									onChange={(e) =>
										setFormData({
											...formData,
											email: e.target.value,
										})
									}
									required
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit_role'>Role</Label>
								<Select
									value={formData.role}
									onValueChange={(
										value: "admin" | "hr" | "employee"
									) =>
										setFormData({
											...formData,
											role: value,
										})
									}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='employee'>
											Employee
										</SelectItem>
										<SelectItem value='hr'>HR</SelectItem>
										{currentUserRole === "admin" && (
											<SelectItem value='admin'>
												Admin
											</SelectItem>
										)}
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit_department'>
									Department
								</Label>
								<Input
									id='edit_department'
									value={formData.department}
									onChange={(e) =>
										setFormData({
											...formData,
											department: e.target.value,
										})
									}
									required
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit_position'>Position</Label>
								<Input
									id='edit_position'
									value={formData.position}
									onChange={(e) =>
										setFormData({
											...formData,
											position: e.target.value,
										})
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit_phone'>Phone</Label>
								<Input
									id='edit_phone'
									value={formData.phone}
									onChange={(e) =>
										setFormData({
											...formData,
											phone: e.target.value,
										})
									}
								/>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='edit_hire_date'>
									Hire Date
								</Label>
								<Input
									id='edit_hire_date'
									type='date'
									value={formData.hire_date}
									onChange={(e) =>
										setFormData({
											...formData,
											hire_date: e.target.value,
										})
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='edit_address'>Address</Label>
								<Input
									id='edit_address'
									value={formData.address}
									onChange={(e) =>
										setFormData({
											...formData,
											address: e.target.value,
										})
									}
								/>
							</div>
						</div>
						<div className='flex justify-end space-x-2'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsEditDialogOpen(false)}>
								Cancel
							</Button>
							<Button type='submit' disabled={loading}>
								{loading ? "Updating..." : "Update Employee"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
