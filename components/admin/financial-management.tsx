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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Edit, Plus, Trash2, Calculator, Search, TrendingUp, Banknote, CreditCard, Receipt, Users, MoreHorizontal, Filter, Download, PiggyBank, Shield, Crown, Briefcase, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
	updateEmployeeFinances,
	createPayrollRecord,
	updatePayrollRecord,
	deletePayrollRecord,
} from "@/app/actions/admin";

interface Employee {
	id: string;
	full_name: string;
	email: string;
	department: string;
	position: string;
	profile_photo?: string;
}

interface EmployeeFinance {
	id: string;
	employee_id: string;
	base_salary: number;
	hourly_rate: number;
	pay_frequency: string;
	bank_account: string;
	tax_id: string;
	currency: string;
	employee: Employee;
}

interface PayrollRecord {
	id: string;
	employee_id: string;
	pay_period_start: string;
	pay_period_end: string;
	gross_pay: number;
	deductions: number;
	net_pay: number;
	overtime_hours: number;
	overtime_pay: number;
	bonus: number;
	status: string;
	currency: string;
	employee: Employee;
}

export function FinancialManagement() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [employeeFinances, setEmployeeFinances] = useState<EmployeeFinance[]>(
		[]
	);
	const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [isFinanceDialogOpen, setIsFinanceDialogOpen] = useState(false);
	const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
	const [editingFinance, setEditingFinance] =
		useState<EmployeeFinance | null>(null);
	const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(
		null
	);
	const [selectedEmployee, setSelectedEmployee] = useState<string>("");

	// New delete modal state for Employee Finances
	const [isFinanceDeleteModalOpen, setIsFinanceDeleteModalOpen] = useState(false);
	const [financeToDelete, setFinanceToDelete] = useState<EmployeeFinance | null>(null);
	const [isPayrollDeleteModalOpen, setIsPayrollDeleteModalOpen] = useState(false);
	const [payrollToDelete, setPayrollToDelete] = useState<PayrollRecord | null>(null);

	const [financeFormData, setFinanceFormData] = useState({
		employee_id: "",
		base_salary: "",
		hourly_rate: "",
		pay_frequency: "monthly",
		bank_account: "",
		tax_id: "",
		currency: "USD",
	});

	const [payrollFormData, setPayrollFormData] = useState({
		employee_id: "",
		pay_period_start: "",
		pay_period_end: "",
		gross_pay: "",
		deductions: "",
		net_pay: "",
		overtime_hours: "",
		overtime_pay: "",
		bonus: "",
		status: "pending",
	});

	useEffect(() => {
		fetchData();
	}, []);

	// Helper function to format currency
	const formatCurrency = (amount: number, currency: string = "USD") => {
		const currencySymbols: { [key: string]: string } = {
			"USD": "$",
			"INR": "₹",
			"EUR": "€",
			"GBP": "£",
			"JPY": "¥",
			"CAD": "C$",
			"AUD": "A$"
		}
		
		const symbol = currencySymbols[currency] || currency
		return `${symbol} ${amount.toLocaleString()}`
	}

	const fetchData = async () => {
		try {
			const [employeesRes, financesRes, payrollRes] = await Promise.all([
				fetch("/api/employees"),
				fetch("/api/finances"),
				fetch("/api/payroll"),
			]);

			if (employeesRes.ok) {
				const employeesData = await employeesRes.json();
				// Normalize Mongo docs to component Employee shape
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
			} else {
				console.error(
					"Failed to load employees:",
					employeesRes.status,
					employeesRes.statusText
				);
				setEmployees([]);
			}

			if (financesRes.ok) {
				const financesData = await financesRes.json();
				// Data is already populated with employee information from the API
				const mappedFinances: EmployeeFinance[] = (
					financesData || []
				).map((f: any) => ({
					id: f._id?.toString?.() || f._id || f.id,
					employee_id: f.employee_id?.toString?.() || f.employee_id,
					base_salary: f.base_salary ?? 0,
					hourly_rate: f.hourly_rate ?? 0,
					pay_frequency: f.pay_frequency || "monthly",
					bank_account: f.bank_account || "",
					tax_id: f.tax_id || "",
					currency: f.currency || "USD",
					employee: f.employee || null,
				}));
				setEmployeeFinances(mappedFinances);
			}

			if (payrollRes.ok) {
				const payrollData = await payrollRes.json();
				// Data is already populated with employee information from the API
				const mappedPayrollRecords = (payrollData || []).map(
					(p: any) => ({
						...p,
						id: p._id?.toString?.() || p._id || p.id,
						employee_id:
							p.employee_id?.toString?.() || p.employee_id,
						employee: p.employee || null,
						currency: p.currency || "USD",
					})
				);
				setPayrollRecords(mappedPayrollRecords);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			toast("Failed to fetch financial data");
		} finally {
			setLoading(false);
		}
	};

	const handleFinanceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const employeeId = editingFinance
			? editingFinance.employee_id
			: financeFormData.employee_id;

		if (!employeeId) {
			toast.error("Please select an employee");
			return;
		}

		setLoading(true);

		try {
			const result = await updateEmployeeFinances(employeeId, {
				base_salary:
					Number.parseFloat(financeFormData.base_salary) || 0,
				hourly_rate:
					Number.parseFloat(financeFormData.hourly_rate) || 0,
				pay_frequency: financeFormData.pay_frequency,
				bank_account: financeFormData.bank_account,
				tax_id: financeFormData.tax_id,
				currency: financeFormData.currency,
			});

			if (result.success) {
				toast.success("Employee finances updated successfully");
				setIsFinanceDialogOpen(false);
				setEditingFinance(null);
				resetFinanceForm();
				fetchData();
			} else {
				toast.error("Failed to update finances");
			}
		} catch (error) {
			toast.error("Failed to update finances");
		} finally {
			setLoading(false);
		}
	};

	const handlePayrollSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Get employee's currency from their finance record
			const employeeFinance = employeeFinances.find(
				f => f.employee_id === (editingPayroll ? editingPayroll.employee_id : payrollFormData.employee_id)
			);
			const currency = employeeFinance?.currency || "USD";

			const payrollData = {
				employee_id: editingPayroll
					? editingPayroll.employee_id
					: payrollFormData.employee_id,
				pay_period_start: payrollFormData.pay_period_start,
				pay_period_end: payrollFormData.pay_period_end,
				gross_pay: Number.parseFloat(payrollFormData.gross_pay) || 0,
				deductions: Number.parseFloat(payrollFormData.deductions) || 0,
				net_pay: Number.parseFloat(payrollFormData.net_pay) || 0,
				overtime_hours:
					Number.parseFloat(payrollFormData.overtime_hours) || 0,
				overtime_pay:
					Number.parseFloat(payrollFormData.overtime_pay) || 0,
				bonus: Number.parseFloat(payrollFormData.bonus) || 0,
				status: payrollFormData.status as
					| "pending"
					| "paid"
					| "cancelled",
				currency: currency,
			};

			const result = editingPayroll
				? await updatePayrollRecord(editingPayroll.id, payrollData)
				: await createPayrollRecord(payrollData);

			if (result.success) {
				toast.success("Success", {
					description: `Payroll record ${editingPayroll ? "updated" : "created"
						} successfully`,
				});
				setIsPayrollDialogOpen(false);
				setEditingPayroll(null);
				resetPayrollForm();
				fetchData();
			} else {
				toast.error("Failed to save payroll record");
			}
		} catch (error) {
			toast.error("Failed to save payroll record");
		} finally {
			setLoading(false);
		}
	};

	const handleDeletePayroll = async (recordId: string) => {
		setLoading(true);
		try {
			const result = await deletePayrollRecord(recordId);
			if (result.success) {
				toast.success("Payroll record deleted successfully");
				fetchData();
			} else {
				toast.error("Failed to delete payroll record");
			}
		} catch (error) {
			toast.error("Failed to delete payroll record");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteFinance = async (financeId: string) => {
		setLoading(true);
		try {
			const response = await fetch(`/api/finances/${financeId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				toast.success("Finance record deleted successfully");
				fetchData();
			} else {
				toast.error("Failed to delete finance record");
			}
		} catch (error) {
			toast.error("Failed to delete finance record");
		} finally {
			setLoading(false);
		}
	};

	const openFinanceDialog = (finance?: EmployeeFinance) => {
		if (finance) {
			setEditingFinance(finance);
			setFinanceFormData({
				employee_id: finance.employee_id,
				base_salary: finance.base_salary?.toString() || "",
				hourly_rate: finance.hourly_rate?.toString() || "",
				pay_frequency: finance.pay_frequency || "monthly",
				bank_account: finance.bank_account || "",
				tax_id: finance.tax_id || "",
				currency: finance.currency || "USD",
			});
		} else {
			setEditingFinance(null);
			resetFinanceForm();
		}
		setIsFinanceDialogOpen(true);
	};

	const openPayrollDialog = (payroll?: PayrollRecord) => {
		if (payroll) {
			setEditingPayroll(payroll);
			setPayrollFormData({
				employee_id: payroll.employee_id,
				pay_period_start: payroll.pay_period_start,
				pay_period_end: payroll.pay_period_end,
				gross_pay: payroll.gross_pay?.toString() || "",
				deductions: payroll.deductions?.toString() || "",
				net_pay: payroll.net_pay?.toString() || "",
				overtime_hours: payroll.overtime_hours?.toString() || "",
				overtime_pay: payroll.overtime_pay?.toString() || "",
				bonus: payroll.bonus?.toString() || "",
				status: payroll.status || "pending",
			});
		} else {
			setEditingPayroll(null);
			resetPayrollForm();
		}
		setIsPayrollDialogOpen(true);
	};

	// New function to open finance delete modal
	const openFinanceDeleteModal = (finance: EmployeeFinance) => {
		setFinanceToDelete(finance);
		setIsFinanceDeleteModalOpen(true);
	};

	// New function to handle finance deletion
	const handleFinanceDeleteConfirm = async () => {
		if (!financeToDelete) return;
		
		setLoading(true);
		try {
			const response = await fetch(`/api/employee-finances/${financeToDelete.id}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success("Finance record deleted successfully");
				fetchData();
				setIsFinanceDeleteModalOpen(false);
				setFinanceToDelete(null);
			} else {
				toast.error("Failed to delete finance record");
			}
		} catch (error) {
			toast.error("Failed to delete finance record");
		} finally {
			setLoading(false);
		}
	};

	// New function to open payroll delete modal
	const openPayrollDeleteModal = (payroll: PayrollRecord) => {
		setPayrollToDelete(payroll);
		setIsPayrollDeleteModalOpen(true);
	};

	// New function to handle payroll deletion
	const handlePayrollDeleteConfirm = async () => {
		if (!payrollToDelete) return;
		
		setLoading(true);
		try {
			const response = await fetch(`/api/payroll/${payrollToDelete.id}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				toast.success("Payroll record deleted successfully");
				fetchData();
				setIsPayrollDeleteModalOpen(false);
				setPayrollToDelete(null);
			} else {
				toast.error("Failed to delete payroll record");
			}
		} catch (error) {
			console.error("Error deleting payroll record:", error);
			toast.error("Failed to delete payroll record");
		} finally {
			setLoading(false);
		}
	};

	const resetFinanceForm = () => {
		setFinanceFormData({
			employee_id: "",
			base_salary: "",
			hourly_rate: "",
			pay_frequency: "monthly",
			bank_account: "",
			tax_id: "",
			currency: "USD",
		});
	};

	const resetPayrollForm = () => {
		setPayrollFormData({
			employee_id: "",
			pay_period_start: "",
			pay_period_end: "",
			gross_pay: "",
			deductions: "",
			net_pay: "",
			overtime_hours: "",
			overtime_pay: "",
			bonus: "",
			status: "pending",
		});
	};

	const calculateNetPay = () => {
		const gross = Number.parseFloat(payrollFormData.gross_pay) || 0;
		const deductions = Number.parseFloat(payrollFormData.deductions) || 0;
		const overtime = Number.parseFloat(payrollFormData.overtime_pay) || 0;
		const bonus = Number.parseFloat(payrollFormData.bonus) || 0;
		const netPay = gross + overtime + bonus - deductions;
		setPayrollFormData({ ...payrollFormData, net_pay: netPay.toString() });
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "paid":
				return "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300";
			case "pending":
				return "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300";
			case "processing":
				return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300";
			default:
				return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300";
		}
	};

	const getFinancialStats = () => {
		const totalEmployees = employees.length;
		const employeesWithFinances = employeeFinances.length;
		const totalPayrollRecords = payrollRecords.length;
		const totalGrossPay = payrollRecords.reduce((sum, record) => sum + record.gross_pay, 0);
		const totalNetPay = payrollRecords.reduce((sum, record) => sum + record.net_pay, 0);
		const averageSalary = employeeFinances.length > 0
			? employeeFinances.reduce((sum, finance) => sum + finance.base_salary, 0) / employeeFinances.length
			: 0;

		return {
			totalEmployees,
			employeesWithFinances,
			totalPayrollRecords,
			totalGrossPay,
			totalNetPay,
			averageSalary
		};
	};

	const filteredEmployeeFinances = employeeFinances.filter(finance =>
		finance.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		finance.employee?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		finance.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		finance.employee?.position?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Check if any employee has an hourly rate
	const hasAnyHourlyRate = employeeFinances.some(finance => finance.hourly_rate && finance.hourly_rate > 0);

	const filteredPayrollRecords = payrollRecords.filter(record =>
		record.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		record.employee?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
		record.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		record.employee?.position?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading && employeeFinances.length === 0) {
		return (
			<div className="space-y-6">
				{/* Stats Cards Skeleton */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(4)].map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="space-y-2">
										<div className="h-4 bg-gray-200 rounded w-20"></div>
										<div className="h-8 bg-gray-200 rounded w-16"></div>
									</div>
									<div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Main Content Skeleton */}
				<Card className="animate-pulse">
					<CardContent className="p-6">
						<div className="space-y-4">
							<div className="h-4 bg-gray-200 rounded w-1/4"></div>
							<div className="h-10 bg-gray-200 rounded"></div>
							<div className="space-y-3">
								{[...Array(3)].map((_, i) => (
									<div key={i} className="h-20 bg-gray-200 rounded"></div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const stats = getFinancialStats();

	return (
		<div className="space-y-8">
			{/* Financial Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border-blue-100">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-blue-700 mb-2">Total Employees</p>
								<p className="text-3xl font-bold text-blue-900">{stats.totalEmployees}</p>
								<p className="text-xs text-blue-600 mt-1">All employees</p>
							</div>
							<div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
								<Users className="w-7 h-7 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-100">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-emerald-700 mb-2">With Finances</p>
								<p className="text-3xl font-bold text-emerald-900">{stats.employeesWithFinances}</p>
								<p className="text-xs text-emerald-600 mt-1">Financial records</p>
							</div>
							<div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
								<PiggyBank className="w-7 h-7 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 via-white to-purple-50/30 border-purple-100">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-purple-700 mb-2">Payroll Records</p>
								<p className="text-3xl font-bold text-purple-900">{stats.totalPayrollRecords}</p>
								<p className="text-xs text-purple-600 mt-1">Total records</p>
							</div>
							<div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
								<Receipt className="w-7 h-7 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-100">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-amber-700 mb-2">Avg Salary</p>
								<p className="text-3xl font-bold text-amber-900">${Math.round(stats.averageSalary).toLocaleString()}</p>
								<p className="text-xs text-amber-600 mt-1">Per employee</p>
							</div>
							<div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
								<TrendingUp className="w-7 h-7 text-white" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Financial Management Card */}
			<Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 via-white to-slate-50/30 border-slate-100">
				<CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
								<DollarSign className="w-5 h-5 text-white" />
							</div>
							<div>
								<CardTitle className="text-slate-900">Financial Management</CardTitle>
								<CardDescription className="text-slate-600">Manage employee finances, payroll, and compensation</CardDescription>
							</div>
						</div>
						<div className="flex gap-2 flex-shrink-0">
							<Button
								onClick={() => openFinanceDialog()}
								className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2"
							>
								<Plus className="w-4 h-4 mr-2" />
								Create Finance
							</Button>
							<Button
								onClick={() => openPayrollDialog()}
								className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2"
							>
								<Plus className="w-4 h-4 mr-2" />
								Create Payroll
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<Tabs defaultValue='finances' className="w-full">
						<div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50/50 to-white">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value='finances' className="flex items-center gap-2">
									<PiggyBank className="w-4 h-4" />
									Employee Finances
								</TabsTrigger>
								<TabsTrigger value='payroll' className="flex items-center gap-2">
									<Receipt className="w-4 h-4" />
									Payroll Records
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value='finances' className="p-6">
							{/* Search and Actions */}
							<div className="flex flex-col lg:flex-row gap-4 mb-6">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
										<Input
											placeholder="Search employees by name, email, department, or position..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10 bg-white border-slate-200 focus:border-slate-400"
										/>
									</div>
								</div>
								<Dialog open={isFinanceDialogOpen} onOpenChange={setIsFinanceDialogOpen}>
									
									<DialogContent className='max-w-2xl'>
										<DialogHeader>
											<DialogTitle>
												{editingFinance ? "Edit" : "Add"}{" "}
												Employee Finances
											</DialogTitle>
											<DialogDescription>
												{editingFinance ? "Update" : "Set up"}{" "}
												financial information for the employee
											</DialogDescription>
										</DialogHeader>
										<form
											onSubmit={handleFinanceSubmit}
											className='space-y-4'>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='employee_id'>
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
															financeFormData.employee_id
														}
														onValueChange={(value) =>
															setFinanceFormData({
																...financeFormData,
																employee_id: value,
															})
														}
														placeholder={
															employees.length === 0
																? "No employees available"
																: "Select employee"
														}
														searchPlaceholder='Search employees...'
														emptyMessage={
															employees.length === 0
																? "No employees found. Please check your authentication."
																: "No employees found."
														}
														disabled={
															!!editingFinance ||
															employees.length === 0
														}
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='currency'>
														Currency
													</Label>
													<SimpleSelect
														options={[
															{
																value: "USD",
																label: "USD",
															},
															{
																value: "EUR",
																label: "EUR",
															},
															{
																value: "GBP",
																label: "GBP",
															},
															{
																value: "INR",
																label: "INR",
															},
														]}
														value={financeFormData.currency}
														onValueChange={(value) =>
															setFinanceFormData({
																...financeFormData,
																currency: value,
															})
														}
														placeholder='Select currency'
													/>
												</div>
											</div>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='base_salary'>
														Base Salary
													</Label>
													<Input
														id='base_salary'
														type='number'
														step='0.01'
														value={
															financeFormData.base_salary
														}
														onChange={(e) =>
															setFinanceFormData({
																...financeFormData,
																base_salary:
																	e.target.value,
															})
														}
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='hourly_rate'>
														Hourly Rate
													</Label>
													<Input
														id='hourly_rate'
														type='number'
														step='0.01'
														value={
															financeFormData.hourly_rate
														}
														onChange={(e) =>
															setFinanceFormData({
																...financeFormData,
																hourly_rate:
																	e.target.value,
															})
														}
													/>
												</div>
											</div>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='pay_frequency'>
														Pay Frequency
													</Label>
													<SimpleSelect
														options={[
															{
																value: "weekly",
																label: "Weekly",
															},
															{
																value: "bi-weekly",
																label: "Bi-weekly",
															},
															{
																value: "monthly",
																label: "Monthly",
															},
															{
																value: "quarterly",
																label: "Quarterly",
															},
														]}
														value={
															financeFormData.pay_frequency
														}
														onValueChange={(value) =>
															setFinanceFormData({
																...financeFormData,
																pay_frequency: value,
															})
														}
														placeholder='Select pay frequency'
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='tax_id'>
														Tax ID
													</Label>
													<Input
														id='tax_id'
														value={financeFormData.tax_id}
														onChange={(e) =>
															setFinanceFormData({
																...financeFormData,
																tax_id: e.target.value,
															})
														}
													/>
												</div>
											</div>
											<div className='space-y-2'>
												<Label htmlFor='bank_account'>
													Bank Account
												</Label>
												<Input
													id='bank_account'
													value={financeFormData.bank_account}
													onChange={(e) =>
														setFinanceFormData({
															...financeFormData,
															bank_account:
																e.target.value,
														})
													}
												/>
											</div>
											<div className='flex justify-end space-x-2'>
												<Button
													type='button'
													variant='outline'
													onClick={() =>
														setIsFinanceDialogOpen(false)
													}>
													Cancel
												</Button>
												<Button
													type='submit'
													disabled={loading}>
													{loading
														? "Saving..."
														: editingFinance
															? "Update"
															: "Add"}{" "}
													Finances
												</Button>
											</div>
										</form>
									</DialogContent>
								</Dialog>
							</div>

							{/* Employee Finances List */}
							<div className="overflow-hidden">
								{filteredEmployeeFinances.length > 0 ? (
									<div className="divide-y divide-slate-200">
										{filteredEmployeeFinances.map((finance, index) => (
											<div key={finance.id} className={`p-6 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
												}`}>
												<div className="flex items-center justify-between">
													{/* Employee Info */}
													<div className="flex items-center gap-4">
														<Avatar className="w-12 h-12 border-2 border-slate-200">
															<AvatarImage src={finance.employee?.profile_photo || ""} />
															<AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold">
																{finance.employee?.full_name?.charAt(0) || finance.employee?.email?.charAt(0) || "?"}
															</AvatarFallback>
														</Avatar>

														<div className="space-y-1">
															<div className="flex items-center gap-2">
																<h3 className="font-semibold text-slate-900">{finance.employee?.full_name || "Unknown Employee"}</h3>
																<Badge className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 border-0 shadow-sm">
																	{finance.currency}
																</Badge>
															</div>

															<div className="flex items-center gap-4 text-sm text-slate-600">
																<div className="flex items-center gap-1">
																	<Briefcase className="w-3 h-3" />
																	<span>{finance.employee?.position || "No position"}</span>
																</div>
																<div className="flex items-center gap-1">
																	<MapPin className="w-3 h-3" />
																	<span>{finance.employee?.department || "No department"}</span>
																</div>
															</div>
														</div>
													</div>

													{/* Financial Info and Actions */}
													<div className="flex items-center gap-6">
														{/* Financial Info */}
														<div className="flex items-center gap-6">
															<div className="text-center">
																<p className="text-xs text-slate-500 mb-1">Base Salary</p>
																<p className="font-semibold text-slate-900">
																	{finance.base_salary ? formatCurrency(finance.base_salary, finance.currency) : "-"}
																</p>
															</div>
															{hasAnyHourlyRate && (
																<div className="text-center">
																	<p className="text-xs text-slate-500 mb-1">Hourly Rate</p>
																	<p className="font-semibold text-slate-900">
																		{finance.hourly_rate && finance.hourly_rate > 0 ? formatCurrency(finance.hourly_rate, finance.currency) : "-"}
																	</p>
																</div>
															)}
															<div className="text-center">
																<p className="text-xs text-slate-500 mb-1">Pay Frequency</p>
																<p className="font-semibold text-slate-900 capitalize">{finance.pay_frequency}</p>
															</div>
														</div>

														{/* Actions */}
														<div className="flex items-center gap-2">
															{/* Edit Button */}
															<Button
																variant="outline"
																size="sm"
																onClick={() => openFinanceDialog(finance)}
																className="h-8 px-3 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
															>
																<Edit className="w-4 h-4 mr-1" />
																Edit
															</Button>

															{/* Delete Button */}
															<Button
																variant="outline"
																size="sm"
																onClick={() => openFinanceDeleteModal(finance)}
																className="h-8 px-3 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
															>
																<Trash2 className="w-4 h-4 mr-1" />
																Delete
															</Button>

															{/* Delete Button */}
															<AlertDialog>
																<AlertDialogTrigger asChild>
																	<Button
																		variant="outline"
																		size="sm"
																		className="h-8 px-3 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
																	>
																		<Trash2 className="w-4 h-4 mr-1" />
																		Delete
																	</Button>
																</AlertDialogTrigger>
																<AlertDialogContent>
																	<AlertDialogHeader>
																		<AlertDialogTitle>Delete Financial Record</AlertDialogTitle>
																		<AlertDialogDescription>
																			Are you sure you want to delete this financial record? This action cannot be undone.
																			<br /><br />
																			<strong>Employee:</strong> {finance.employee?.full_name || "Unknown"}
																			<br />
																			<strong>Currency:</strong> {finance.currency}
																			<br />
																			<strong>Base Salary:</strong> {finance.base_salary ? `${finance.currency} ${finance.base_salary.toLocaleString()}` : "Not set"}
																			<br />
																			<strong>Pay Frequency:</strong> {finance.pay_frequency}
																		</AlertDialogDescription>
																	</AlertDialogHeader>
																	<AlertDialogFooter>
																		<AlertDialogCancel>Cancel</AlertDialogCancel>
																		<AlertDialogAction
																			onClick={() => handleDeleteFinance(finance.id)}
																			className="bg-red-600 hover:bg-red-700">
																			Delete
																		</AlertDialogAction>
																	</AlertDialogFooter>
																</AlertDialogContent>
															</AlertDialog>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
											<PiggyBank className="w-8 h-8 text-slate-500" />
										</div>
										<p className="text-slate-600 font-medium">No financial records found</p>
										<p className="text-sm text-slate-400 mt-2">
											{searchTerm
												? "Try adjusting your search criteria."
												: "Get started by adding financial records for employees."}
										</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value='payroll' className="p-6">
							{/* Search and Actions */}
							<div className="flex flex-col lg:flex-row gap-4 mb-6">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
										<Input
											placeholder="Search payroll records by employee name, email, department, or position..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-10 bg-white border-slate-200 focus:border-slate-400"
										/>
									</div>
								</div>
								<Dialog open={isPayrollDialogOpen} onOpenChange={setIsPayrollDialogOpen}>
									<DialogContent className='max-w-3xl'>
										<DialogHeader>
											<DialogTitle>
												{editingPayroll ? "Edit" : "Create"}{" "}
												Payroll Record
											</DialogTitle>
											<DialogDescription>
												{editingPayroll ? "Update" : "Create"}{" "}
												payroll information for the employee
											</DialogDescription>
										</DialogHeader>
										<form
											onSubmit={handlePayrollSubmit}
											className='space-y-4'>
											<div className='grid grid-cols-3 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='payroll_employee_id'>
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
															payrollFormData.employee_id
														}
														onValueChange={(value) =>
															setPayrollFormData({
																...payrollFormData,
																employee_id: value,
															})
														}
														placeholder={
															employees.length === 0
																? "No employees available"
																: "Select employee"
														}
														searchPlaceholder='Search employees...'
														emptyMessage={
															employees.length === 0
																? "No employees found. Please check your authentication."
																: "No employees found."
														}
														disabled={
															!!editingPayroll ||
															employees.length === 0
														}
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='pay_period_start'>
														Pay Period Start
													</Label>
													<Input
														id='pay_period_start'
														type='date'
														value={
															payrollFormData.pay_period_start
														}
														onChange={(e) =>
															setPayrollFormData({
																...payrollFormData,
																pay_period_start:
																	e.target.value,
															})
														}
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='pay_period_end'>
														Pay Period End
													</Label>
													<Input
														id='pay_period_end'
														type='date'
														value={
															payrollFormData.pay_period_end
														}
														onChange={(e) =>
															setPayrollFormData({
																...payrollFormData,
																pay_period_end:
																	e.target.value,
															})
														}
														required
													/>
												</div>
											</div>
											<div className='grid grid-cols-3 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='gross_pay'>
														Gross Pay
													</Label>
													<Input
														id='gross_pay'
														type='number'
														step='0.01'
														value={
															payrollFormData.gross_pay
														}
														onChange={(e) =>
															setPayrollFormData({
																...payrollFormData,
																gross_pay:
																	e.target.value,
															})
														}
														required
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='deductions'>
														Deductions
													</Label>
													<Input
														id='deductions'
														type='number'
														step='0.01'
														value={
															payrollFormData.deductions
														}
														onChange={(e) =>
															setPayrollFormData({
																...payrollFormData,
																deductions:
																	e.target.value,
															})
														}
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='bonus'>Bonus</Label>
													<Input
														id='bonus'
														type='number'
														step='0.01'
														value={payrollFormData.bonus}
														onChange={(e) =>
															setPayrollFormData({
																...payrollFormData,
																bonus: e.target.value,
															})
														}
													/>
												</div>
											</div>
											<div className='grid grid-cols-3 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='overtime_hours'>
														Overtime Hours
													</Label>
													<Input
														id='overtime_hours'
														type='number'
														step='0.01'
														value={
															payrollFormData.overtime_hours
														}
														onChange={(e) =>
															setPayrollFormData({
																...payrollFormData,
																overtime_hours:
																	e.target.value,
															})
														}
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='overtime_pay'>
														Overtime Pay
													</Label>
													<Input
														id='overtime_pay'
														type='number'
														step='0.01'
														value={
															payrollFormData.overtime_pay
														}
														onChange={(e) =>
															setPayrollFormData({
																...payrollFormData,
																overtime_pay:
																	e.target.value,
															})
														}
													/>
												</div>
												<div className='space-y-2'>
													<Label htmlFor='status'>
														Status
													</Label>
													<SimpleSelect
														options={[
															{
																value: "pending",
																label: "Pending",
															},
															{
																value: "processing",
																label: "Processing",
															},
															{
																value: "paid",
																label: "Paid",
															},
														]}
														value={payrollFormData.status}
														onValueChange={(value) =>
															setPayrollFormData({
																...payrollFormData,
																status: value,
															})
														}
														placeholder='Select status'
													/>
												</div>
											</div>
											<div className='space-y-2'>
												<div className='flex items-center space-x-2'>
													<Label htmlFor='net_pay'>
														Net Pay
													</Label>
													<Button
														type='button'
														variant='outline'
														size='sm'
														onClick={calculateNetPay}>
														<Calculator className='h-4 w-4 mr-1' />
														Calculate
													</Button>
												</div>
												<Input
													id='net_pay'
													type='number'
													step='0.01'
													value={payrollFormData.net_pay}
													onChange={(e) =>
														setPayrollFormData({
															...payrollFormData,
															net_pay: e.target.value,
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
														setIsPayrollDialogOpen(false)
													}>
													Cancel
												</Button>
												<Button
													type='submit'
													disabled={loading}>
													{loading
														? "Saving..."
														: editingPayroll
															? "Update"
															: "Create"}{" "}
													Payroll
												</Button>
											</div>
										</form>
									</DialogContent>
								</Dialog>
							</div>

							{/* Payroll Records List */}
							<div className="overflow-hidden">
								{filteredPayrollRecords.length > 0 ? (
									<div className="divide-y divide-slate-200">
										{filteredPayrollRecords.map((record, index) => (
											<div key={record.id} className={`p-6 hover:bg-slate-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
												}`}>
												<div className="flex items-center justify-between">
													{/* Employee Info */}
													<div className="flex items-center gap-4">
														<Avatar className="w-12 h-12 border-2 border-slate-200">
															<AvatarImage src={record.employee?.profile_photo || ""} />
															<AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-semibold">
																{record.employee?.full_name?.charAt(0) || record.employee?.email?.charAt(0) || "?"}
															</AvatarFallback>
														</Avatar>

														<div className="space-y-1">
															<div className="flex items-center gap-2">
																<h3 className="font-semibold text-slate-900">{record.employee?.full_name || "Unknown Employee"}</h3>
																<Badge className={`${getStatusColor(record.status)} border-0 shadow-sm`}>
																	{record.status.toUpperCase()}
																</Badge>
															</div>

															<div className="flex items-center gap-4 text-sm text-slate-600">
																<div className="flex items-center gap-1">
																	<Calendar className="w-3 h-3" />
																	<span>{new Date(record.pay_period_start).toLocaleDateString()} - {new Date(record.pay_period_end).toLocaleDateString()}</span>
																</div>
																<div className="flex items-center gap-1">
																	<Briefcase className="w-3 h-3" />
																	<span>{record.employee?.position || "No position"}</span>
																</div>
															</div>
														</div>
													</div>

													{/* Payroll Info and Actions */}
													<div className="flex items-center gap-6">
														{/* Payroll Info */}
														<div className="flex items-center gap-6">
															<div className="text-center">
																<p className="text-xs text-slate-500 mb-1">Gross Pay</p>
																<p className="font-semibold text-slate-900">{formatCurrency(record.gross_pay, record.currency)}</p>
															</div>
															<div className="text-center">
																<p className="text-xs text-slate-500 mb-1">Deductions</p>
																<p className="font-semibold text-red-600">-{formatCurrency(record.deductions, record.currency)}</p>
															</div>
															<div className="text-center">
																<p className="text-xs text-slate-500 mb-1">Net Pay</p>
																<p className="font-semibold text-emerald-600 text-lg">{formatCurrency(record.net_pay, record.currency)}</p>
															</div>
														</div>

														{/* Actions */}
														<div className="flex items-center gap-2">
															{/* Edit Button */}
															<Button
																variant="outline"
																size="sm"
																onClick={() => openPayrollDialog(record)}
																className="h-8 px-3 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
															>
																<Edit className="w-4 h-4 mr-1" />
																Edit
															</Button>

															{/* Delete Button */}
															<Button
																variant="outline"
																size="sm"
																onClick={() => openPayrollDeleteModal(record)}
																className="h-8 px-3 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
															>
																<Trash2 className="w-4 h-4 mr-1" />
																Delete
															</Button>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
											<Receipt className="w-8 h-8 text-slate-500" />
										</div>
										<p className="text-slate-600 font-medium">No payroll records found</p>
										<p className="text-sm text-slate-400 mt-2">
											{searchTerm
												? "Try adjusting your search criteria."
												: "Get started by creating payroll records for employees."}
										</p>
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Floating Action Button for Mobile */}
			<div className="fixed bottom-6 right-6 z-50 sm:hidden">
				<Button 
					onClick={() => openFinanceDialog()}
					size="lg" 
					className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300"
				>
					<Plus className="w-6 h-6" />
				</Button>
			</div>

			{/* New Finance Delete Modal */}
			<Dialog open={isFinanceDeleteModalOpen} onOpenChange={setIsFinanceDeleteModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<Trash2 className="w-5 h-5" />
							Delete Finance Record
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this finance record? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					
					{financeToDelete && (
						<div className="space-y-4">
							{/* Employee Info */}
							<div className="bg-slate-50 p-4 rounded-lg">
								<h4 className="font-semibold text-slate-900 mb-2">Employee Information</h4>
								<div className="space-y-1 text-sm">
									<p><strong>Name:</strong> {financeToDelete.employee?.full_name || "Unknown"}</p>
									<p><strong>Email:</strong> {financeToDelete.employee?.email || "N/A"}</p>
									<p><strong>Position:</strong> {financeToDelete.employee?.position || "N/A"}</p>
									<p><strong>Department:</strong> {financeToDelete.employee?.department || "N/A"}</p>
								</div>
							</div>

							{/* Financial Info */}
							<div className="bg-red-50 p-4 rounded-lg border border-red-200">
								<h4 className="font-semibold text-red-800 mb-2">Financial Information to be Deleted</h4>
								<div className="space-y-1 text-sm text-red-700">
									<p><strong>Currency:</strong> {financeToDelete.currency}</p>
									<p><strong>Base Salary:</strong> {financeToDelete.base_salary ? `${financeToDelete.currency} ${financeToDelete.base_salary.toLocaleString()}` : "Not set"}</p>
									<p><strong>Hourly Rate:</strong> {financeToDelete.hourly_rate ? `${financeToDelete.currency} ${financeToDelete.hourly_rate}` : "Not set"}</p>
									<p><strong>Pay Frequency:</strong> {financeToDelete.pay_frequency}</p>
									<p><strong>Tax ID:</strong> {financeToDelete.tax_id || "Not set"}</p>
									<p><strong>Bank Account:</strong> {financeToDelete.bank_account || "Not set"}</p>
								</div>
							</div>

							{/* Warning */}
							<div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
								<div className="flex items-start gap-2">
									<div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
									<div className="text-sm text-amber-800">
										<p className="font-semibold">Warning:</p>
										<p>Deleting this finance record will remove all financial information for this employee. This action cannot be undone.</p>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="flex justify-end gap-2 mt-6">
						<Button
							variant="outline"
							onClick={() => {
								setIsFinanceDeleteModalOpen(false);
								setFinanceToDelete(null);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleFinanceDeleteConfirm}
							className="bg-red-600 hover:bg-red-700"
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Delete Finance Record
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Payroll Delete Modal */}
			<Dialog open={isPayrollDeleteModalOpen} onOpenChange={setIsPayrollDeleteModalOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-red-600">
							<Trash2 className="w-5 h-5" />
							Delete Payroll Record
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this payroll record? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					{payrollToDelete && (
						<div className="space-y-4">
							{/* Employee Info */}
							<div className="bg-slate-50 p-4 rounded-lg">
								<h4 className="font-semibold text-slate-900 mb-2">Employee Information</h4>
								<div className="space-y-1 text-sm">
									<p><strong>Name:</strong> {payrollToDelete.employee?.full_name || "Unknown"}</p>
									<p><strong>Email:</strong> {payrollToDelete.employee?.email || "N/A"}</p>
									<p><strong>Position:</strong> {payrollToDelete.employee?.position || "N/A"}</p>
									<p><strong>Department:</strong> {payrollToDelete.employee?.department || "N/A"}</p>
								</div>
							</div>
							{/* Payroll Info */}
							<div className="bg-red-50 p-4 rounded-lg border border-red-200">
								<h4 className="font-semibold text-red-800 mb-2">Payroll Information to be Deleted</h4>
								<div className="space-y-1 text-sm text-red-700">
									<p><strong>Pay Period:</strong> {new Date(payrollToDelete.pay_period_start).toLocaleDateString()} - {new Date(payrollToDelete.pay_period_end).toLocaleDateString()}</p>
									<p><strong>Gross Pay:</strong> {formatCurrency(payrollToDelete.gross_pay, payrollToDelete.currency)}</p>
									<p><strong>Deductions:</strong> {formatCurrency(payrollToDelete.deductions, payrollToDelete.currency)}</p>
									<p><strong>Net Pay:</strong> {formatCurrency(payrollToDelete.net_pay, payrollToDelete.currency)}</p>
									<p><strong>Overtime Hours:</strong> {payrollToDelete.overtime_hours || 0}</p>
									<p><strong>Overtime Pay:</strong> {formatCurrency(payrollToDelete.overtime_pay, payrollToDelete.currency)}</p>
									<p><strong>Bonus:</strong> {formatCurrency(payrollToDelete.bonus, payrollToDelete.currency)}</p>
									<p><strong>Status:</strong> {payrollToDelete.status}</p>
								</div>
							</div>
							{/* Warning */}
							<div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
								<div className="flex items-start gap-2">
									<div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
									<div className="text-sm text-amber-800">
										<p className="font-semibold">Warning:</p>
										<p>Deleting this payroll record will remove all payroll information for this pay period. This action cannot be undone.</p>
									</div>
								</div>
							</div>
						</div>
					)}
					<div className="flex justify-end gap-2 mt-6">
						<Button
							variant="outline"
							onClick={() => {
								setIsPayrollDeleteModalOpen(false);
								setPayrollToDelete(null);
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handlePayrollDeleteConfirm}
							className="bg-red-600 hover:bg-red-700"
						>
							<Trash2 className="w-4 h-4 mr-2" />
							Delete Payroll Record
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
